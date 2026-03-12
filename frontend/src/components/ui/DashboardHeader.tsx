"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  icon?: LucideIcon;
  roleBadge?: {
    label: string;
    type: "admin" | "master" | "dealer";
  };
  className?: string;
}

export default function DashboardHeader({
  title,
  subtitle,
  breadcrumbs,
  icon: Icon,
  roleBadge,
  className = "",
}: DashboardHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-8 ${className}`}>
      {/* Decorative background effects */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-600 via-red-500 to-transparent" />
      <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-red-600/10 to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {breadcrumbs?.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              {crumb.href ? (
                <Link href={crumb.href} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-red-400">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span className="text-zinc-600">/</span>}
            </div>
          ))}
          
          {roleBadge && (
            <span className={`ml-auto lg:ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              roleBadge.type === "dealer" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
            }`}>
              {roleBadge.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-red-500 shrink-0" />}
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            {title}
          </h1>
        </div>
        
        {subtitle && (
          <p className="text-zinc-400 text-sm mt-2 max-w-xl font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
