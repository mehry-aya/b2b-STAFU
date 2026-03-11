"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, Building2, MapPin, Phone, Lock, Save, EyeIcon, EyeOffIcon } from "lucide-react";
import { updateProfileAction, getMeAction } from "@/app/login/actions";

export default function DealerProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMeAction();
        if (data && !data.error) {
          setProfileData({
            companyName: data.dealer?.companyName || "",
            phone: data.dealer?.phone || "",
            address: data.dealer?.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const companyName = formData.get("companyName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (newPassword && !oldPassword) {
      setError("Old password is required to set a new password");
      setLoading(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        companyName,
        phone,
        address,
      };

      if (newPassword) {
        payload.oldPassword = oldPassword;
        payload.password = newPassword;
      }

      const result = await updateProfileAction(payload);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      if (newPassword) {
        (e.target as HTMLFormElement).reset();
        // keep input values for other fields
        setProfileData({ companyName, phone, address });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse text-zinc-400">
        Loading...
      </div>
    );
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
            <span className="text-zinc-500">Dealer</span>
            <span className="text-zinc-600">/</span>
            <span className="text-red-400">Profile Settings</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Profile</h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Update your company details, contact information, and security settings.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                Profile updated successfully!
              </div>
            )}

            {/* Company Info Section */}
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6 border-b pb-4">
                <Building2 className="w-5 h-5 text-red-600" />
                Company Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-bold text-zinc-700">
                    Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      className="block w-full rounded-xl border-zinc-200 pl-11 pr-4 py-3 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                      defaultValue={profileData.companyName}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-sm font-bold text-zinc-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="block w-full rounded-xl border-zinc-200 pl-11 pr-4 py-3 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                      defaultValue={profileData.phone}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-bold text-zinc-700">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-4 pointer-events-none">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      className="block w-full rounded-xl border-zinc-200 pl-11 pr-4 py-3 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm resize-none"
                      defaultValue={profileData.address}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="pt-2">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6 border-b pb-4">
                <Lock className="w-5 h-5 text-red-600" />
                Security (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2 relative">
                  <label htmlFor="oldPassword" className="block text-sm font-bold text-zinc-700">
                    Old Password
                  </label>
                  <div className="relative">
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type={showPassword ? "text" : "password"}
                      className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                      placeholder="Required to set a new password"
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
                  <label htmlFor="newPassword" className="block text-sm font-bold text-zinc-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      className="block w-full rounded-xl border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-red-500 focus:ring-red-500 transition-colors shadow-sm"
                      placeholder="Leave blank to keep current"
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
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-zinc-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
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
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Saving Changes..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
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
