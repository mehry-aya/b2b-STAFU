"use client";

import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

interface DashboardModule {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
}

interface DashboardGridProps {
  modules: DashboardModule[];
  sectionTitle?: string;
}

export default function DashboardGrid({
  modules,
  sectionTitle = "Management Modules",
}: DashboardGridProps) {
  return (
    <div>
      {sectionTitle && (
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
          {sectionTitle}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
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
  );
}
