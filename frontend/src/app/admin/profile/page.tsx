"use client";

import { useState } from "react";
import { Anchor, ArrowRight, Save, Lock, User as UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { updateProfileAction } from "@/app/(auth)/actions";

export default function AdminProfilePage() {
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!oldPassword) {
      setError("Old password is required to set a new password");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const result = await updateProfileAction({ oldPassword, password: newPassword });

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "An error occurred");
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
            <span className="text-zinc-500">{isMaster ? "Master" : "Admin"}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-red-400">Profile Settings</span>
          </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isMaster ? "Master Security" : "Security & Profile"}
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-xl">
              {isMaster 
                ? "Update your master administrator credentials." 
                : "Update your administrator credentials."}
            </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-red-600" />
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                Password updated successfully!
              </div>
            )}

            <div className="space-y-1.5 relative">
              <label
                htmlFor="oldPassword"
                className="block text-sm font-bold text-zinc-700"
              >
                Old Password
              </label>
              <div className="relative">
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                >
                  {showPassword ? (
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
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-zinc-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Password
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
