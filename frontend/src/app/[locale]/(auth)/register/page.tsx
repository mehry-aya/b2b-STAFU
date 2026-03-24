"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { registerAction } from "../actions";
import { Logo } from "@/components/ui/Logo";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { PasswordValidator } from "@/components/ui/PasswordValidator";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { isPasswordValid } from "@/lib/password-utils";

import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("Register");
  const tCommon = useTranslations("Common");
  const tErr = useTranslations("Errors");
  const tSuc = useTranslations("Success");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phone, setPhone] = useState("+90");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const passwordsMatch = useMemo(() => {
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const isFormValid = useMemo(() => {
    return isPasswordValid(password) && passwordsMatch && confirmPassword !== "";
  }, [password, passwordsMatch, confirmPassword]);

  async function handleSubmit(formData: FormData) {
    if (!isFormValid) return;
    
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await registerAction(null, formData);

    if (result?.error) {
      setError(tErr(result.error));
      setLoading(false);
    } else if (result?.success) {
      setSuccess(tSuc(result.success));
      setLoading(false);
    }
  }

  return (
    <div className="p-8 sm:p-12">
      <div className="text-center mb-10">
        <Logo variant="white" width={140} height={40} className="justify-center mx-auto h-16" />
        <p className="mt-3 text-slate-200 font-medium tracking-wide">
          {t("title")} <span className="text-red-600 font-bold">{t("signUp")}</span>
        </p>
      </div>

      {success ? (
        <div className="space-y-6 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
            <p className="text-base text-emerald-100 font-bold leading-relaxed">
              {success}
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex justify-center items-center py-4 px-8 border border-transparent text-base font-black rounded-xl text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-xl active:scale-95"
          >
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-100 mb-2">
                {t("emailLabel")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                placeholder={t("emailPlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="password" title="Password" className="block text-sm font-bold text-slate-100 mb-2">
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium pr-12"
                  placeholder={t("passwordPlaceholder")}
                  onBlur={() => setPasswordTouched(true)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
               <PasswordValidator password={password} show={passwordTouched} />
            </div>
            <div>
              <label htmlFor="confirmPassword" title="Confirm Password" className="block text-sm font-bold text-slate-100 mb-2">
                {t("confirmPasswordLabel")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium pr-12"
                  placeholder={t("confirmPasswordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPasswordTouched && confirmPassword && (
                <div className="mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <p className={`text-[11px] font-medium leading-relaxed ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}>
                    <span className="font-bold mr-1 uppercase tracking-wider opacity-70">
                      {passwordsMatch ? tCommon("passwordsMatch") : tErr("passwordsDoNotMatch")}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-bold text-slate-100 mb-2">
                {t("companyNameLabel")}
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                placeholder={t("companyNamePlaceholder")}
              />
            </div>
            
              <div>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  required
                  variant="auth"
                  placeholder="555 555 55 55"
                  label={t("phoneLabel")}
                />
                <input type="hidden" name="phone" value={phone} />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-bold text-slate-100 mb-2">
                  {t("addressLabel")}
                </label>
                <input
                  id="address"
                  name="address"
                  className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                  placeholder={t("addressPlaceholder")}
                />
              </div>
            </div>
          

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <p className="text-sm font-bold text-red-100">{error}</p>
            </div>
          )}

          <div className="space-y-6 pt-2">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-black rounded-xl text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("submitting") : t("applyButton")}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors tracking-widest border-b border-transparent hover:border-white pb-1"
              >
                {t("alreadyHaveAccount")} <span className="text-red-600 font-bold letter-spacing-1">{t("signInLink")}</span> 
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
