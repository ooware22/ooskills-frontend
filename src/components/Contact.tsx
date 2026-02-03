"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PaperAirplaneIcon as Send,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  MapPinIcon as MapPin,
  CheckCircleIcon as CheckCircle,
  ExclamationCircleIcon as AlertCircle,
} from "@heroicons/react/24/outline";

// Custom social media icons (Heroicons doesn't include brand icons)
const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
  </svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

export default function Contact() {
  const t = useTranslations("contact");
  const [formState, setFormState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setFormState("idle"), 3000);
    } catch (error) {
      setFormState("error");
      setTimeout(() => setFormState("idle"), 3000);
    }
  };

  const contactInfo = [
    { icon: Mail, labelKey: "info.email" },
    { icon: Phone, labelKey: "info.phone" },
    { icon: MapPin, labelKey: "info.address" },
  ];

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-oxford dark:text-white tracking-tight mb-4">
              {t("title")}
            </h2>
            <p className="text-silver dark:text-gray-400 mb-10">
              {t("subtitle")}
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-10">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-oxford-light rounded-lg flex items-center justify-center">
                    <info.icon className="w-4 h-4 text-oxford dark:text-white" />
                  </div>
                  <span
                    className="text-sm text-oxford dark:text-white"
                    dir={info.labelKey === "info.phone" ? "ltr" : undefined}
                  >
                    {t(info.labelKey)}
                  </span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-100 dark:bg-oxford-light rounded-lg flex items-center justify-center hover:bg-gold hover:text-oxford dark:hover:bg-gold dark:hover:text-oxford transition-colors duration-200 text-oxford dark:text-white"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/5 p-6 md:p-8"
            >
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-oxford dark:text-white mb-2">
                    {t("form.name")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-silver focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-oxford dark:text-white mb-2">
                    {t("form.email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-silver focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-oxford dark:text-white mb-2">
                    {t("form.subject")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-silver focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-oxford dark:text-white mb-2">
                    {t("form.message")}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-silver focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className={cn(
                    "w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200",
                    formState === "success"
                      ? "bg-green-500 text-white"
                      : formState === "error"
                        ? "bg-red-500 text-white"
                        : "bg-gold text-oxford hover:bg-gold-light",
                  )}
                >
                  {formState === "loading" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-oxford/30 border-t-oxford rounded-full animate-spin" />
                      {t("form.sending")}
                    </>
                  ) : formState === "success" ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t("form.success")}
                    </>
                  ) : formState === "error" ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      {t("form.error")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t("form.submit")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
