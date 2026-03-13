"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMeAction } from "@/app/(auth)/actions";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  ArrowRight,
  Package,
  TrendingUp,
  Anchor,
} from "lucide-react";

export default function DealerDashboard() {
  const [user, setUser] = useState<{ companyName: string; email: string } | null>(null);

  useEffect(() => {
    getMeAction().then((data) => {
      if (data && !data.error) {
        const companyName = data.dealer?.companyName || "Dealer";
        setUser({ companyName, email: data.email });
      }
    });
  }, []);

  const quickLinks = [
    {
      label: "Browse Products",
      description: "Explore the full fishing catalog",
      href: "/dealer/products",
      icon: Package,
      accent: "red",
    },
    {
      label: "My Orders",
      description: "Track and manage your orders",
      href: "/dealer/orders",
      icon: ShoppingCart,
      accent: "zinc",
    },
    {
      label: "Contracts",
      description: "Upload and review contracts",
      href: "/dealer/contracts",
      icon: CheckCircle,
      accent: "zinc",
    },
    {
      label: "Profile",
      description: "Manage your account details",
      href: "/dealer/profile",
      icon: TrendingUp,
      accent: "zinc",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-10">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-600 via-red-500 to-transparent" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold tracking-widest uppercase mb-3">
              <Anchor className="h-3.5 w-3.5" />
              <span>Dealer Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome back{user?.companyName ? `, ${user.companyName}` : ""}
            </h1>
            <p className="text-zinc-400 text-sm max-w-md">
              Your B2B fishing gear hub. Browse the latest products, track orders,
              and manage your account — all in one place.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
              <Clock className="h-4 w-4 text-red-400" />
              <span className="text-xs text-zinc-300 font-medium">Active Account</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-300 font-medium">Approved Dealer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section title */}
      <div>
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const isPrimary = item.accent === "red";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-col gap-3 rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  isPrimary
                    ? "bg-red-600 border-red-700 text-white hover:bg-red-700 hover:shadow-red-900/30"
                    : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-200 hover:shadow-zinc-100"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isPrimary
                      ? "bg-red-700/60 text-white"
                      : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${isPrimary ? "text-white" : "text-zinc-900"}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isPrimary ? "text-red-100/80" : "text-zinc-500"}`}>
                    {item.description}
                  </p>
                </div>
                <ArrowRight
                  className={`absolute right-4 top-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isPrimary ? "text-red-200" : "text-zinc-400"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info strip */}
      <div className="rounded-2xl bg-white border border-zinc-100 px-6 py-5 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Anchor className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Need assistance?</p>
            <p className="text-xs text-zinc-500">
              Contact your account manager or browse the product catalog.
            </p>
          </div>
        </div>
        <Link
          href="/dealer/products"
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-red-600 transition-colors"
        >
          Shop Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
