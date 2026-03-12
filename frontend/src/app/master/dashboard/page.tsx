"use client";

import Link from "next/link";
import {
  Users,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  ArrowRight,
  Shield,
  Crown,
} from "lucide-react";

const masterModules = [
  {
    label: "Admin Management",
    description: "Add and remove portal administrators",
    href: "/master/admins",
    icon: Shield,
    primary: true,
  },
  {
    label: "Dealer Management",
    description: "Review, approve, and manage dealer accounts",
    href: "/admin/dealers",
    icon: Users,
    primary: false,
  },
  {
    label: "Orders",
    description: "View and manage all dealer orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    primary: false,
  },
  {
    label: "Products",
    description: "Browse and manage the product catalog",
    href: "/admin/products",
    icon: Package,
    primary: false,
  },
  {
    label: "Contracts",
    description: "Review uploaded dealer contracts",
    href: "/admin/contracts",
    icon: FileText,
    primary: false,
  },
  {
    label: "Export",
    description: "Export data and generate reports",
    href: "/admin/export",
    icon: BarChart3,
    primary: false,
  },
];

export default function MasterDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-10">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-600 via-red-500 to-transparent" />

        <div className="relative space-y-3">
          <div className="flex items-center gap-2  text-red-400 text-xs font-semibold tracking-widest uppercase">
            <Crown className="h-3.5 w-3.5" />
            <span>Master Console</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Master Admin Dashboard
          </h1>
          <p className="text-zinc-400 text-sm max-w-md">
            Full platform control for STAFUPRO B2B. Manage admins, approve
            dealers, monitor orders, and oversee the entire catalog.
          </p>
        </div>
      </div>

      {/* Modules grid */}
      <div>
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
          Management Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`group relative flex flex-col gap-4 rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  mod.primary
                    ? "bg-red-600 border-red-700 hover:bg-red-700 hover:shadow-red-900/30"
                    : "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-zinc-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mod.primary
                      ? "bg-red-700/60 text-white"
                      : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${mod.primary ? "text-white" : "text-zinc-900"}`}>
                    {mod.label}
                  </p>
                  <p className={`text-xs mt-1 ${mod.primary ? "text-red-100/80" : "text-zinc-500"}`}>
                    {mod.description}
                  </p>
                </div>
                <ArrowRight
                  className={`absolute right-5 top-5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    mod.primary ? "text-red-200" : "text-zinc-400"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom strip */}
      <div className="rounded-2xl bg-white border border-zinc-100 px-6 py-5 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Crown className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">STAFUPRO B2B Platform</p>
            <p className="text-xs text-zinc-500">
              Master admin — full platform control.
            </p>
          </div>
        </div>
        <Link
          href="/master/admins"
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-red-500 transition-colors"
        >
          Manage Admins
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
