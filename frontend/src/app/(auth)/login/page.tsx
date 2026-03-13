"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password || password.length < 1) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    const result = await loginAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="p-8 sm:p-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">
          STAFU<span className="text-slate-300">PRO</span>
        </h1>
        <p className="mt-3 text-slate-200 font-medium">
          B2B Dealer Portal Login
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-slate-100 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
              placeholder="dealer@stafupro.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-slate-100 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-red-100">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-black rounded-xl text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? "Signing in..." : "SIGN IN"}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/register"
              className="text-sm font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white pb-1"
            >
              Apply for Dealer Access
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
