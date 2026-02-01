"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin, CheckCircle, AlertCircle, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

export default function Contact() {
  const t = useTranslations("contact");
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
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
                  <span className="text-sm text-oxford dark:text-white">
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
                  className="w-10 h-10 bg-gray-100 dark:bg-oxford-light rounded-lg flex items-center justify-center hover:bg-gold hover:text-oxford transition-colors duration-200 text-oxford dark:text-white"
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                      : "bg-gold text-oxford hover:bg-gold-light"
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
