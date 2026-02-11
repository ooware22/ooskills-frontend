"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeIcon as Mail,
  LockClosedIcon as Lock,
  ArrowRightIcon as ArrowRight,
  ArrowLeftIcon as ArrowLeft,
  EyeIcon as Eye,
  EyeSlashIcon as EyeOff,
  ExclamationTriangleIcon as AlertIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  GiftIcon,
  CameraIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  register,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from "@/store/slices/authSlice";
import { WILAYAS } from "@/constants/wilayas";
import { useTranslations, useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/Toast";

const STEPS = ["personal", "contact", "security"] as const;
type Step = typeof STEPS[number];

export default function SignUp() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("auth.signup");
  const tCommon = useTranslations("auth");
  const { dir, locale } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [wilayaOpen, setWilayaOpen] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone: "",
    wilaya: "",
    referral_code: "",
    newsletter_subscribed: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter wilayas based on search
  const filteredWilayas = WILAYAS.filter(
    (w) =>
      w.name.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
      w.nameAr.includes(wilayaSearch) ||
      w.code.includes(wilayaSearch)
  );

  // Get selected wilaya name
  const selectedWilaya = WILAYAS.find((w) => w.code === formData.wilaya);
  const getWilayaDisplayName = (wilaya: typeof WILAYAS[0]) => {
    return locale === "ar" ? wilaya.nameAr : wilaya.name;
  };

  // Redirect if already authenticated (but not right after registration)
  useEffect(() => {
    if (isAuthenticated && !registrationSuccess) {
      router.replace("/");
    }
  }, [isAuthenticated, registrationSuccess, router]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".wilaya-dropdown")) {
        setWilayaOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (formData.password !== formData.password_confirm) {
      showToast(
        locale === "ar" ? "كلمات المرور غير متطابقة" : locale === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords do not match",
        "error"
      );
      return;
    }

    const result = await dispatch(
      register({
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        wilaya: formData.wilaya || undefined,
        referral_code: formData.referral_code || undefined,
        newsletter_subscribed: formData.newsletter_subscribed,
        avatar: avatarFile,
      })
    );

    if (register.fulfilled.match(result)) {
      setRegistrationSuccess(true);
    } else {
      const errorMsg = (result.payload as string) || (locale === "ar" ? "فشل إنشاء الحساب" : locale === "fr" ? "Échec de la création du compte" : "Registration failed");
      showToast(errorMsg, "error");
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthKeys = ["weak", "fair", "good", "strong"] as const;

  const isDark = resolvedTheme === "dark";

  const currentStepIndex = STEPS.indexOf(currentStep);

  const canProceedToNext = () => {
    switch (currentStep) {
      case "personal":
        return formData.first_name.trim() && formData.last_name.trim();
      case "contact":
        return formData.email.trim() && formData.email.includes("@");
      case "security":
        return formData.password.length >= 8 && formData.password === formData.password_confirm;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const stepLabels = {
    personal: locale === "ar" ? "المعلومات الشخصية" : locale === "fr" ? "Informations personnelles" : "Personal Info",
    contact: locale === "ar" ? "معلومات الاتصال" : locale === "fr" ? "Coordonnées" : "Contact Info",
    security: locale === "ar" ? "الأمان" : locale === "fr" ? "Sécurité" : "Security",
  };

  return (
    <div 
      className={`auth-page h-screen overflow-hidden flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark 
          ? "bg-gradient-to-br from-oxford via-oxford to-oxford-light" 
          : "bg-gradient-to-br from-cream via-white to-blue-light"
      }`} 
      dir={dir}
    >
      {/* Background Pattern */}
      <div
        className={`absolute inset-0 ${isDark ? "opacity-[0.03]" : "opacity-[0.1]"}`}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "white" : "#002147"} 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative Blobs */}
      <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-gold/10" : "bg-gold/20"}`} />
      <div className={`absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-gold/5" : "bg-oxford/5"}`} />

      {/* Registration Success Overlay */}
      {registrationSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md px-4 sm:px-0 z-10"
        >
          <div className={`backdrop-blur-xl rounded-2xl border p-8 sm:p-10 shadow-2xl text-center ${
            isDark 
              ? "bg-white/5 border-white/10" 
              : "bg-white/80 border-gray-200"
          }`}>
            {/* Success Icon */}
            <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
            </div>

            <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-oxford"}`}>
              {locale === "ar" ? "تم إنشاء حسابك بنجاح!" : locale === "fr" ? "Compte créé avec succès !" : "Account Created Successfully!"}
            </h2>

            <p className={`text-sm sm:text-base mb-2 ${isDark ? "text-white/60" : "text-oxford/60"}`}>
              {locale === "ar"
                ? "لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني"
                : locale === "fr"
                  ? "Nous avons envoyé un lien d'activation à votre adresse e-mail"
                  : "We've sent an activation link to your email"}
            </p>

            <p className={`text-sm sm:text-base font-semibold mb-6 ${isDark ? "text-gold" : "text-gold"}`}>
              {formData.email}
            </p>

            <p className={`text-xs sm:text-sm mb-6 ${isDark ? "text-white/40" : "text-oxford/50"}`}>
              {locale === "ar"
                ? "يرجى التحقق من بريدك الإلكتروني والنقر على رابط التفعيل لتفعيل حسابك."
                : locale === "fr"
                  ? "Veuillez vérifier votre e-mail et cliquer sur le lien d'activation pour activer votre compte."
                  : "Please check your email and click the activation link to activate your account."}
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg transition-all shadow-md shadow-gold/20"
            >
              {locale === "ar" ? "الذهاب إلى الصفحة الرئيسية" : locale === "fr" ? "Aller à la page d'accueil" : "Go to Home Page"}
              <ArrowRight className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </Link>

            <p className={`text-[10px] sm:text-xs mt-6 ${isDark ? "text-white/30" : "text-oxford/40"}`}>
              {locale === "ar"
                ? "لم تتلقَ البريد الإلكتروني؟ تحقق من مجلد الرسائل غير المرغوب فيها."
                : locale === "fr"
                  ? "Vous n'avez pas reçu l'e-mail ? Vérifiez votre dossier spam."
                  : "Didn't receive the email? Check your spam folder."}
            </p>
          </div>
        </motion.div>
      )}

      {/* Registration Form */}
      {!registrationSuccess && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-4 sm:px-0"
      >
        {/* Logo */}
        <div className="text-center mb-4 sm:mb-6">
          <Link href="/" className="inline-block mb-2 sm:mb-3">
            {mounted && (
              <Image
                src={isDark ? "/images/logo/logo_DarkMood2.png" : "/images/logo/logo_LightMood2.png"}
                alt="OOSkills"
                width={180}
                height={60}
                className="h-8 sm:h-10 w-auto"
              />
            )}
          </Link>
          <h1 className={`text-lg sm:text-xl font-bold mb-1 ${isDark ? "text-white" : "text-oxford"}`}>
            {t("title")}
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? "text-white/50" : "text-oxford/60"}`}>
            {t("subtitle")}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                  index <= currentStepIndex
                    ? "bg-gold text-oxford"
                    : isDark
                      ? "bg-white/10 text-white/40"
                      : "bg-gray-200 text-oxford/40"
                }`}
              >
                {index < currentStepIndex ? (
                  <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all ${
                    index < currentStepIndex
                      ? "bg-gold"
                      : isDark
                        ? "bg-white/10"
                        : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Label */}
        <p className={`text-center text-xs sm:text-sm mb-3 sm:mb-4 font-medium ${isDark ? "text-white/60" : "text-oxford/60"}`}>
          {stepLabels[currentStep]}
        </p>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className={`backdrop-blur-xl rounded-2xl border p-5 sm:p-6 shadow-2xl ${
            isDark 
              ? "bg-white/5 border-white/10" 
              : "bg-white/80 border-gray-200"
          }`}
        >
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
            >
              <AlertIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className={`text-xs sm:text-sm ${isDark ? "text-red-300" : "text-red-600"}`}>{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {currentStep === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Avatar Upload */}
                <div className="flex justify-center mb-4 sm:mb-5">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed cursor-pointer transition-all group overflow-hidden ${
                      isDark 
                        ? "bg-white/10 border-white/20 hover:border-gold/50" 
                        : "bg-gray-100 border-gray-300 hover:border-gold"
                    }`}
                  >
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        fill
                        dir="ltr"
                        className="object-cover"
                      />
                    ) : (
                      <div className={`flex flex-col items-center justify-center h-full p-4 transition-colors ${
                        isDark 
                          ? "text-white/40 group-hover:text-gold/70" 
                          : "text-oxford/40 group-hover:text-gold"
                      }`}>
                        <CameraIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                        <span className="text-[10px] sm:text-xs mt-1 whitespace-nowrap">{t("avatar")}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <CameraIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                  {/* First Name */}
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                      {t("firstName")} <span className="text-red-400">{t("required")}</span>
                    </label>
                    <div className="relative">
                      <UserIcon className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({ ...formData, first_name: e.target.value })
                        }
                        placeholder={t("firstNamePlaceholder")}
                        className={`w-full ps-8 sm:ps-9 pe-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                          isDark 
                            ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30" 
                            : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                        }`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                      {t("lastName")} <span className="text-red-400">{t("required")}</span>
                    </label>
                    <div className="relative">
                      <UserIcon className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({ ...formData, last_name: e.target.value })
                        }
                        placeholder={t("lastNamePlaceholder")}
                        className={`w-full ps-8 sm:ps-9 pe-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                          isDark 
                            ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30" 
                            : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                        }`}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="mb-4">
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                    {t("referralCode")} <span className={isDark ? "text-white/30" : "text-oxford/40"}>{t("referralCodeOptional")}</span>
                  </label>
                  <div className="relative">
                    <GiftIcon className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                    <input
                      type="text"
                      value={formData.referral_code}
                      onChange={(e) =>
                        setFormData({ ...formData, referral_code: e.target.value })
                      }
                      placeholder={t("referralCodePlaceholder")}
                      className={`w-full ps-8 sm:ps-9 pe-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                        isDark 
                          ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30" 
                          : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                      }`}
                      disabled={loading}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === "contact" && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Email */}
                <div className="mb-4">
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                    {t("email")} <span className="text-red-400">{t("required")}</span>
                  </label>
                  <div className="relative">
                    <Mail className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={t("emailPlaceholder")}
                      className={`w-full ps-8 sm:ps-9 pe-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                        isDark 
                          ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30" 
                          : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                      }`}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                    {t("phone")}
                  </label>
                  <div className="relative">
                    <PhoneIcon className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={t("phonePlaceholder")}
                      className={`w-full ps-8 sm:ps-9 pe-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                        isDark 
                          ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30" 
                          : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                      }`}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Wilaya Dropdown */}
                <div className="wilaya-dropdown relative mb-4">
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                    {t("wilaya")}
                  </label>
                  <div
                    onClick={() => setWilayaOpen(!wilayaOpen)}
                    className="relative cursor-pointer"
                  >
                    <MapPinIcon className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                    <div className={`w-full ps-8 sm:ps-9 pe-8 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                      isDark 
                        ? "bg-white/5 border border-white/10 text-white" 
                        : "bg-white border border-gray-200 text-oxford"
                    }`}>
                      {selectedWilaya ? (
                        <span>{selectedWilaya.code} - {getWilayaDisplayName(selectedWilaya)}</span>
                      ) : (
                        <span className={isDark ? "text-white/30" : "text-oxford/40"}>{t("wilayaPlaceholder")}</span>
                      )}
                    </div>
                    <ChevronDownIcon className={`absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform ${wilayaOpen ? 'rotate-180' : ''} ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                  </div>

                  {/* Dropdown Menu */}
                  {wilayaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute z-50 mt-2 w-full rounded-lg shadow-2xl max-h-48 overflow-hidden ${
                        isDark 
                          ? "bg-oxford-light border border-white/10" 
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {/* Search Input */}
                      <div className={`p-2 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
                        <input
                          type="text"
                          placeholder={t("wilayaSearch")}
                          value={wilayaSearch}
                          onChange={(e) => setWilayaSearch(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                            isDark 
                              ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30" 
                              : "bg-gray-50 border border-gray-200 text-oxford placeholder:text-oxford/40"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {/* Wilaya List */}
                      <div className="overflow-y-auto max-h-36">
                        {filteredWilayas.map((wilaya) => (
                          <div
                            key={wilaya.code}
                            onClick={() => {
                              setFormData({ ...formData, wilaya: wilaya.code });
                              setWilayaOpen(false);
                              setWilayaSearch("");
                            }}
                            className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between text-sm ${
                              formData.wilaya === wilaya.code 
                                ? "bg-gold/10 text-gold" 
                                : isDark 
                                  ? "text-white/80 hover:bg-gold/20" 
                                  : "text-oxford/80 hover:bg-gold/10"
                            }`}
                          >
                            <span>{wilaya.code} - {getWilayaDisplayName(wilaya)}</span>
                            {formData.wilaya === wilaya.code && (
                              <CheckIcon className="w-3.5 h-3.5 text-gold" />
                            )}
                          </div>
                        ))}
                        {filteredWilayas.length === 0 && (
                          <div className={`px-3 py-2 text-xs text-center ${isDark ? "text-white/40" : "text-oxford/40"}`}>
                            {t("wilayaNotFound")}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Security */}
            {currentStep === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Password */}
                <div className="mb-4">
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                    {t("password")} <span className="text-red-400">{t("required")}</span>
                  </label>
                  <div className="relative">
                    <Lock className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={t("passwordPlaceholder")}
                      className={`w-full ps-8 sm:ps-9 pe-9 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                        isDark 
                          ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30" 
                          : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute end-2.5 top-1/2 -translate-y-1/2 transition-colors ${
                        isDark ? "text-white/30 hover:text-white/60" : "text-oxford/30 hover:text-oxford/60"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] sm:text-xs ${isDark ? "text-white/40" : "text-oxford/50"}`}>
                        {passwordStrength > 0 ? t(`passwordStrength.${strengthKeys[passwordStrength - 1]}`) : t('passwordStrength.tooShort')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                    {t("confirmPassword")} <span className="text-red-400">{t("required")}</span>
                  </label>
                  <div className="relative">
                    <Lock className={`absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.password_confirm}
                      onChange={(e) =>
                        setFormData({ ...formData, password_confirm: e.target.value })
                      }
                      placeholder={t("passwordPlaceholder")}
                      className={`w-full ps-8 sm:ps-9 pe-9 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all ${
                        formData.password_confirm && formData.password !== formData.password_confirm
                          ? 'border-red-500/50'
                          : isDark 
                            ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-gold" 
                            : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40 focus:border-gold"
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute end-2.5 top-1/2 -translate-y-1/2 transition-colors ${
                        isDark ? "text-white/30 hover:text-white/60" : "text-oxford/30 hover:text-oxford/60"
                      }`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {formData.password_confirm && formData.password !== formData.password_confirm && (
                    <p className="text-[10px] sm:text-xs text-red-400 mt-1">{t("passwordMismatch")}</p>
                  )}
                </div>

                {/* Newsletter Checkbox */}
                <div className="mb-4">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.newsletter_subscribed}
                        onChange={(e) =>
                          setFormData({ ...formData, newsletter_subscribed: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                        formData.newsletter_subscribed 
                          ? 'bg-gold border-gold' 
                          : isDark 
                            ? 'border-white/20 group-hover:border-white/40' 
                            : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                        {formData.newsletter_subscribed && (
                          <CheckIcon className="w-2.5 h-2.5 text-oxford" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <span className={`text-xs sm:text-sm transition-colors leading-tight ${
                      isDark 
                        ? "text-white/60 group-hover:text-white/80" 
                        : "text-oxford/60 group-hover:text-oxford/80"
                    }`}>
                      {t("newsletter")}
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-5">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={goToPrevStep}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all border ${
                  isDark 
                    ? "border-white/20 text-white hover:bg-white/10" 
                    : "border-gray-300 text-oxford hover:bg-gray-50"
                }`}
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                {locale === "ar" ? "السابق" : locale === "fr" ? "Précédent" : "Back"}
              </button>
            )}
            
            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceedToNext()}
                className="flex-1 py-2.5 text-sm bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gold/20"
              >
                {locale === "ar" ? "التالي" : locale === "fr" ? "Suivant" : "Next"}
                <ArrowRight className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !canProceedToNext()}
                className="flex-1 py-2.5 text-sm bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gold/20"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-oxford/30 border-t-oxford rounded-full animate-spin" />
                ) : (
                  <>
                    {t("submit")}
                    <ArrowRight className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? "border-white/10" : "border-gray-200"}`} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-4 ${isDark ? "text-white/30" : "text-oxford/40"}`}>
                {t("or")}
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            {/* Google */}
            <button
              type="button"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDark 
                  ? "bg-white/10 hover:bg-white/20 border border-white/10" 
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
              title="Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDark 
                  ? "bg-white/10 hover:bg-white/20 border border-white/10" 
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
              title="Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>

          {/* Sign In Link */}
          <p className={`text-center text-xs sm:text-sm ${isDark ? "text-white/50" : "text-oxford/60"}`}>
            {t("hasAccount")}{" "}
            <Link
              href="/auth/signin"
              className="text-gold hover:underline font-medium"
            >
              {t("signinLink")}
            </Link>
          </p>
        </form>

        {/* Footer */}
        <p className={`text-center text-[10px] sm:text-xs mt-3 sm:mt-4 ${isDark ? "text-white/30" : "text-oxford/40"}`}>
          {tCommon("copyright")}
        </p>
      </motion.div>
      )}
    </div>
  );
}
