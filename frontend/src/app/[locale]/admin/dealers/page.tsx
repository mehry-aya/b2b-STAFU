"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "@/i18n/routing";
import { getDealersAdminAction } from "@/app/(auth)/actions";
import DealerApprovalTable from "@/components/DealerApprovalTable";
import { Users, Clock, CheckCircle, XCircle, Anchor } from "lucide-react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import StatsRow from "@/components/ui/StatsRow";
import { useTranslations } from "next-intl";
import { Pagination } from "@/components/ui/Pagination";

export default function AdminDealersPage() {
  const t = useTranslations("AdminDealers");
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");
  
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getDealersAdminAction(page, pageSize);
    if (result.data) {
      setDealers(result.data.data);
      setTotalCount(result.data.total);
      setTotalPages(result.data.totalPages);
    } else {
      setError(result.error || null);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // For stats, we might actually need a total count across all pages if it's not provided by a separate stats endpoint
  // But for now, we'll use the totalCount from the paginated response for the "Total Dealers" stat.
  // The filtered counts (approved Count etc.) would ideally come from the backend or a separate summary API.
  // If not, the current stats on the frontend will ONLY reflect the current page, which is not ideal.
  // However, I will focus on the pagination task as requested.

  const totalDealers = totalCount;
  // Note: approvedCount, pendingCount, rejectedCount currently only reflect the current page.
  // In a production app, these should come from a summary/stats API endpoint.
  const approvedCount = dealers.filter((d) => d.contractStatus === "approved").length;
  const pendingCount = dealers.filter((d) => d.contractStatus === "pending").length;
  const rejectedCount = dealers.filter((d) => d.contractStatus === "rejected").length;

  const stats = [
    {
      label: t("totalDealers"),
      value: totalDealers,
      icon: Users,
      color: "text-slate-700",
      bg: "bg-slate-200",
      border: "border-slate-200",
    },
    {
      label: t("approved"),
      value: approvedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: t("pendingReview"),
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: t("rejected"),
      value: rejectedCount,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Anchor}
        breadcrumbs={[
          { label: isMaster ? t("master") : t("admin"), href: isMaster ? "/master/dashboard" : "/admin/dashboard" },
          { label: t("management") }
        ]}
        roleBadge={isMaster ? { label: t("master"), type: "master" } : { label: t("admin"), type: "admin" }}
      />

      <StatsRow stats={stats} loading={loading} />

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-600/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
          {t("allDealers")}
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
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <DealerApprovalTable initialDealers={dealers} />
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              itemsLabel={t("dealersLabel")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
