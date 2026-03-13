"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "../actions";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await registerAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  }

  return (
    <div className="p-8 sm:p-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">
          STAFU<span className="text-slate-300">PRO</span>
        </h1>
        <p className="mt-3 text-slate-200 font-medium tracking-wide">
          DEALER REGISTRATION
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
            BACK TO LOGIN
          </Link>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-100 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                placeholder="dealer@stafupro.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-100 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-bold text-slate-100 mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                placeholder="Your Company Ltd."
              />
            </div>
            
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-slate-100 mb-2">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                  placeholder="+1 234..."
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-bold text-slate-100 mb-2">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                  placeholder="City, Country"
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
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-black rounded-xl text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all shadow-lg active:scale-95"
            >
              {loading ? "Submitting..." : "APPLY FOR ACCESS"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white pb-1"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
