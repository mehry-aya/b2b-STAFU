"use client";

import { useEffect, useState, useCallback } from "react";
import { getDealersAdminAction } from "@/app/login/actions";
import DealerApprovalTable from "@/components/DealerApprovalTable";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Anchor,
  ArrowRight,
} from "lucide-react";

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const result = await getDealersAdminAction();
    if (result.dealers) {
      setDealers(result.dealers);
    } else {
      setError(result.error || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  // Derived stats from dynamic dealer data
  const totalDealers = dealers.length;
  const approvedCount = dealers.filter((d) => d.contractStatus === "approved").length;
  const pendingCount = dealers.filter((d) => d.contractStatus === "pending").length;
  const rejectedCount = dealers.filter((d) => d.contractStatus === "rejected").length;

  const stats = [
    {
      label: "Total Dealers",
      value: totalDealers,
      icon: Users,
      color: "text-white",
      bg: "bg-[#0f0f0f]",
      border: "border-white/10",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-950/30",
      border: "border-emerald-500/20",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-950/30",
      border: "border-amber-500/20",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-950/30",
      border: "border-red-500/20",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
            <Anchor className="h-3.5 w-3.5" />
            <Link href="/admin/dashboard" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Admin
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-red-400">Dealer Management</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dealers</h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Review contracts and manage dealer account activations across the platform.
          </p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-600/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div>
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
          All Dealers
        </h2>
        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-zinc-100 last:border-0 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/4" />
                </div>
                <div className="h-5 bg-zinc-100 rounded w-16" />
                <div className="h-8 bg-zinc-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <DealerApprovalTable initialDealers={dealers} />
        )}
      </div>
    </div>
  );
}
