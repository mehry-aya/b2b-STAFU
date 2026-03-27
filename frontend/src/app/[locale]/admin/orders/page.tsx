"use client";

import React, { useEffect, useState } from "react";
import { getOrdersAction, getAuthToken } from "@/app/(auth)/actions";
import { usePathname } from "@/i18n/routing";
import { Order } from "@/lib/types/order";
import {
  ShoppingBag,
  Calendar,
  Eye,
  AlertCircle,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import DashboardHeader from "@/components/ui/DashboardHeader";
import { Pagination } from "@/components/ui/Pagination";

import { useTranslations, useLocale } from "next-intl";

export default function AdminOrdersPage() {
  const t = useTranslations("AdminOrders");
  const tErr = useTranslations("Errors");
  const { formatPrice } = useCurrency();
  const locale = useLocale();
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const pageSize = 10;
  const { toast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getOrdersAction(page, pageSize);
      if (result.data) {
        setOrders(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalCount(result.data.total);
      } else {
        setError(tErr(result.error || "fetchOrdersFailed"));
      }
    } catch (err: any) {
      setError(tErr(err.message || "fetchOrdersFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, tErr]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case "pending_first_payment":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "first_payment_received":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "received":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "pending_rest_payment":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.dealer?.companyName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={ShoppingBag}
        breadcrumbs={[
          { label: isMaster ? t("masterConsole") : t("adminConsole") },
        ]}
        roleBadge={
          isMaster
            ? { label: t("master"), type: "master" }
            : { label: t("admin"), type: "admin" }
        }
      />

      {/* Toolbar from Mockup Refined */}
      <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          {/* Left Side: Search */}
          <div className="relative w-full xl:max-w-xs 2xl:max-w-md">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-transparent uppercase tracking-tighter select-none">
                Search
              </span>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 transition-all placeholder:text-zinc-400 font-medium h-[42px]"
                />
              </div>
            </div>
          </div>

          {/* Right Side: Filters & Actions grouped */}
          <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
            {/* Date From */}
            <div className="flex flex-col gap-1.5 flex-1 sm:flex-none">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter ml-1">
                {t("from")}
              </span>
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl hover:bg-zinc-100/50 transition-colors h-[42px]">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-700 outline-none w-full sm:w-28 appearance-none"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1.5 flex-1 sm:flex-none">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter ml-1">
                {t("to")}
              </span>
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl hover:bg-zinc-100/50 transition-colors h-[42px]">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-700 outline-none w-full sm:w-28 appearance-none"
                />
              </div>
            </div>
            {/* Status Filter */}
            <div className="relative w-full sm:w-48">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-transparent uppercase tracking-tighter select-none">
                  Status
                </span>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none flex items-center gap-2 pl-10 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 h-[42px]"
                  >
                    <option value="all">{t("allStatuses")}</option>
                    <option value="draft">{t("draft")}</option>
                    <option value="pending_first_payment">
                      {t("pendingFirstPayment")}
                    </option>
                    <option value="first_payment_received">
                      {t("firstPaymentReceived")}
                    </option>
                    <option value="shipped">{t("shipped")}</option>
                    <option value="received">{t("received")}</option>
                    <option value="pending_rest_payment">
                      {t("pendingRestPayment")}
                    </option>
                    <option value="paid">{t("paid")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                  </select>
                  <Filter className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="h-4 w-4 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.6}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Export Button */}
            <button
              onClick={async () => {
                setExporting(true);
                try {
                  const token = await getAuthToken();
                  if (!token)
                    throw new Error("Authentication token not found.");

                  const queryParams = new URLSearchParams();
                  if (dateFrom) queryParams.append("startDate", dateFrom);
                  if (dateTo) queryParams.append("endDate", dateTo);
                  if (statusFilter !== "all")
                    queryParams.append("status", statusFilter);

                  const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/orders/export/excel?${queryParams.toString()}`;

                  const response = await fetch(url, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  if (!response.ok) throw new Error("Failed to export orders.");

                  const blob = await response.blob();
                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = downloadUrl;
                  link.download = `orders-export-${new Date().toISOString().split("T")[0]}.xlsx`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(downloadUrl);

                  toast({
                    title: t("exportSuccess"),
                    description: t("exportSuccessDesc"),
                  });
                } catch (err: any) {
                  toast({
                    title: t("exportFailed"),
                    description: tErr(err.message || "updateFailed"),
                    variant: "destructive",
                  });
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50 h-[42px] shadow-sm flex-1 sm:flex-none justify-center"
            >
              <Download
                className={`h-4 w-4 ${exporting ? "animate-bounce" : ""}`}
              />
              <span className="whitespace-nowrap">
                {exporting ? t("exporting") : t("export")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Counter and Table Area */}
      <div className="space-y-3">
        {/* Counter Aligned Right Above Table */}
        <div className="flex justify-end pr-2">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[12px] font-black text-zinc-600 uppercase tracking-widest -mt-1">
              {" "}
              {t("ordersCount", { count: totalCount })}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-zinc-100 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-zinc-100 border-t-red-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              {t("loadingOrders")}
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {t("order")}
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {t("dealer")}
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {t("date")}
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {t("status")}
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {t("total")}
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-4 py-2">
                        <span className="font-mono text-xs font-black text-zinc-900">
                          #{order.id.toString().padStart(5, "0")}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            {order.dealer?.companyName
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-900 leading-none uppercase truncate max-w-[150px]">
                              {order.dealer?.companyName}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-bold font-mono mt-1">
                              ID: STF-{order.dealerId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          {format(new Date(order.createdAt), "MMM d, yyyy", {
                            locale: locale === "tr" ? tr : undefined,
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(order.status)}`}
                        >
                          {t(
                            order.status === "pending_first_payment"
                              ? "pendingFirstPayment"
                              : order.status === "first_payment_received"
                                ? "firstPaymentReceived"
                                : order.status === "pending_rest_payment"
                                  ? "pendingRestPayment"
                                  : order.status,
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-sm font-black text-zinc-900">
                          {formatPrice(Number(order.totalAmount))}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all group-hover:shadow-md"
                        >
                          <Eye className="h-3 w-3" />
                          {t("review")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                  {t("noOrders")}
                </p>
              </div>
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              itemsLabel={t("ordersLabel")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
