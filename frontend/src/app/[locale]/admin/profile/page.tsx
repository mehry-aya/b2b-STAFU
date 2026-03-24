"use client";

import { useState, useMemo } from "react";
import { Anchor, ArrowRight, Save, Lock, User as UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { usePathname } from "@/i18n/routing";
import { updateProfileAction } from "@/app/(auth)/actions";
import { PasswordValidator } from "@/components/ui/PasswordValidator";
import { isPasswordValid } from "@/lib/password-utils";
import { useTranslations } from "next-intl";

export default function AdminProfilePage() {
  const t = useTranslations("AdminProfile");
  const tCommon = useTranslations("Common");
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const passwordsMatch = useMemo(() => {
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const isPasswordOk = useMemo(() => {
    if (!newPassword) return true;
    return isPasswordValid(newPassword) && passwordsMatch;
  }, [newPassword, passwordsMatch]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isPasswordOk) return;

    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("oldPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!oldPassword) {
      setError(t("passwordRequired"));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      setLoading(false);
      return;
    }

    try {
      const result = await updateProfileAction({ oldPassword, password: newPassword });

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setNewPassword("");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || t("connectionError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-8">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-600 via-red-500 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold tracking-widest uppercase mb-3">
            <UserIcon className="h-3.5 w-3.5" />
            <span className="text-zinc-500">{isMaster ? t("master") : t("admin")}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-red-400">{t("profileSettings")}</span>
          </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isMaster ? t("masterTitle") : t("title")}
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-xl">
              {isMaster 
                ? t("masterSubtitle")
                : t("subtitle")}
            </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-red-600" />
            {t("changePassword")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                {t("updateSuccess")}
              </div>
            )}

            <div className="space-y-1.5 relative">
              <label
                htmlFor="oldPassword"
                className="block text-sm font-bold text-zinc-700"
              >
                {t("oldPassword")}
              </label>
              <div className="relative">
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type={showPassword.old ? "text" : "password"}
                  required
                  className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                  placeholder={t("oldPasswordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                >
                  {showPassword.old ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <label
                htmlFor="newPassword"
                className="block text-sm font-bold text-zinc-700"
              >
                {t("newPassword")}
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                  placeholder={t("newPasswordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                >
                  {showPassword.new ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <PasswordValidator password={newPassword} show={passwordTouched} />
            </div>

            <div className="space-y-1.5 relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-zinc-700"
              >
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                  placeholder={t("confirmPasswordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                >
                  {showPassword.confirm ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPasswordTouched && confirmPassword && (
                <div className="mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <p className={`text-[11px] font-medium leading-relaxed ${passwordsMatch ? "text-emerald-500" : "text-red-500"}`}>
                    <span className="font-bold mr-1 uppercase tracking-wider opacity-70">
                      {passwordsMatch ? tCommon("passwordsMatch") : t("passwordsDoNotMatch")}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !isPasswordOk}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  t("updating")
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("savePassword")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
