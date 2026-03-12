"use client";

import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

interface StatsRowProps {
  stats: StatItem[];
  loading?: boolean;
}

export default function StatsRow({ stats, loading = false }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-2xl border ${stat.bg} ${stat.border} px-5 py-4 flex items-center gap-4`}
          >
            <div className={`${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-2xl font-black ${stat.color}`}>
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-white/10 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
