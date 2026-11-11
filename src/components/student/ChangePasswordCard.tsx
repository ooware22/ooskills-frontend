"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";
import { EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/i18n";
import { changePassword } from "@/services/authApi";

type FieldErrors = Partial<Record<"old_password" | "new_password" | "new_password_confirm" | "form", string>>;

const MIN_LENGTH = 8;

function firstMessage(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.map(String).join(" ");
  if (typeof value === "string") return value;
  return undefined;
}

/**
 * "Change password" section of the learner settings page (audit FN-08).
 * Accounts created with Google/Facebook have no password yet: they are sent
 * to the forgot-password flow, which lets them create one.
 */
export default function ChangePasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useI18n();
  const tp = (key: string) => t(`student.settings.password.${key}`);

  const [values, setValues] = useState({ old_password: "", new_password: "", new_password_confirm: "" });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined, form: undefined }));
    setSuccess(false);
  };

  const validate = (): FieldErrors => {
    const found: FieldErrors = {};
    if (!values.old_password) found.old_password = tp("required");
    if (values.new_password.length < MIN_LENGTH) found.new_password = tp("tooShort");
    else if (values.new_password === values.old_password) found.new_password = tp("sameAsOld");
    if (values.new_password_confirm !== values.new_password) found.new_password_confirm = tp("mismatch");
    return found;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await changePassword(values);
      setValues({ old_password: "", new_password: "", new_password_confirm: "" });
      setSuccess(true);
    } catch (err) {
      const next: FieldErrors = {};
      if (isAxiosError(err) && err.response) {
        const data = (err.response.data || {}) as Record<string, unknown>;
        if (err.response.status === 429) next.form = tp("tooMany");
        else {
          if (data.old_password) next.old_password = tp("wrongCurrent");
          // Django's password validators explain why the new password is refused.
          const weak = firstMessage(data.new_password);
          if (weak) next.new_password = weak;
          if (data.new_password_confirm) next.new_password_confirm = tp("mismatch");
          if (!Object.keys(next).length) next.form = tp("error");
        }
      } else {
        next.form = tp("error");
      }
      setErrors(next);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 pe-10 bg-gray-50 dark:bg-white/5 border rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-600 dark:text-white/70 mb-1.5";

  const field = (
    name: keyof typeof values,
    label: string,
    autoComplete: string,
  ) => {
    const id = `pwd-${name}`;
    const error = errors[name];
    return (
      <div>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={name}
            type={show ? "text" : "password"}
            autoComplete={autoComplete}
            value={values[name]}
            onChange={set(name)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`${inputClass} ${error ? "border-red-400 dark:border-red-500/60" : "border-gray-200 dark:border-white/10"}`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? tp("hide") : tp("show")}
            aria-pressed={show}
            className="absolute inset-y-0 end-0 flex items-center justify-center w-10 text-gray-500 hover:text-oxford dark:text-white/60 dark:hover:text-white"
          >
            {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
          <KeyIcon className="w-5 h-5 text-gold" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-oxford dark:text-white">{tp("title")}</h3>
          <p className="text-xs text-gray-600 dark:text-white/60">{tp("desc")}</p>
        </div>
      </div>

      {!hasPassword ? (
        <p className="text-sm text-gray-700 dark:text-white/80">
          {tp("noPassword")}{" "}
          <Link href="/auth/forgot-password" className="font-medium text-gold hover:underline">
            {tp("createOne")}
          </Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {field("old_password", tp("current"), "current-password")}
            {field("new_password", tp("new"), "new-password")}
            {field("new_password_confirm", tp("confirm"), "new-password")}
          </div>
          <p className="text-xs text-gray-600 dark:text-white/60 mb-4">{tp("hint")}</p>

          <div role="status" aria-live="polite" className="mb-4 empty:hidden">
            {success && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{tp("success")}</p>
            )}
            {errors.form && <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-oxford rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? tp("saving") : tp("submit")}
          </button>
        </form>
      )}
    </motion.div>
  );
}
