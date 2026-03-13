"use client";

import { BarChart3 } from "lucide-react";

export default function AdminExportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-8">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-500 via-red-400 to-transparent" />
        <div className="relative flex items-center gap-4">
          <BarChart3 className="h-8 w-8 text-red-400" />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Export
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Data export and reporting coming soon.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
        <BarChart3 className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
        <p className="text-sm font-semibold text-zinc-500">
          Export functionality is under development
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          ...
        </p>
      </div>
    </div>
  );
}
