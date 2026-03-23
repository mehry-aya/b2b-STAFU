"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { getMeAction } from "@/app/(auth)/actions";
import { getDealerStatsAction } from "@/app/dashboard/actions";
import {
  ShoppingCart,
  Clock,
  ArrowRight,
  Package,
  TrendingUp,
  Anchor,
  DollarSign,

  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/context/CurrencyContext";

export default function DealerDashboard() {
  const t = useTranslations("DealerDashboard");
  const tOrders = useTranslations("DealerOrders");
  const tContracts = useTranslations("DealerContracts");
  const { formatPrice } = useCurrency();
  const [user, setUser] = useState<{ companyName: string; email: string } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMeAction(),
      getDealerStatsAction()
    ]).then(([userData, statsData]) => {
      if (userData && !userData.error) {
        const companyName = userData.dealer?.companyName || "Dealer";
        setUser({ companyName, email: userData.email });
      }
      if (statsData.stats) {
        setStats(statsData.stats);
      }
      setLoading(false);
    });
  }, []);


  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return {
        card: "bg-emerald-50/30 border-emerald-500/10",
        badge: "bg-white text-emerald-600 border-emerald-200",
        icon: "bg-emerald-50 text-emerald-600"
      };
      case "pending": return {
        card: "bg-amber-50/30 border-amber-500/10",
        badge: "bg-white text-amber-600 border-amber-200",
        icon: "bg-amber-50 text-amber-600"
      };
      case "rejected": return {
        card: "bg-rose-50/30 border-rose-500/10",
        badge: "bg-white text-rose-600 border-rose-200",
        icon: "bg-rose-50 text-rose-600"
      };
      default: return {
        card: "bg-zinc-50/30 border-zinc-500/10",
        badge: "bg-white text-zinc-600 border-zinc-200",
        icon: "bg-zinc-50 text-zinc-600"
      };
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "shipped": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending_payment":
      case "draft": return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  const translateOrderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft": return tOrders("statusDraft");
      case "pending_payment": return tOrders("statusPendingPayment");
      case "paid": return tOrders("statusPaid");
      case "shipped": return tOrders("statusShipped");
      case "cancelled": return tOrders("statusCancelled");
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-48 bg-zinc-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const dealerStats = [
    { label: t("totalOrders"), value: stats?.totalOrders || 0, icon: ShoppingCart },
    { label: t("pendingOrders"), value: stats?.pendingOrders || 0, icon: Clock },
    { label: t("totalSpent"), value: formatPrice(stats?.totalSpent || 0), icon: DollarSign },
    { label: t("contractStatus"), value: stats?.contractStatus || "None", icon: FileText, type: "badge" },
  ];

  const quickLinks = [
    { label: t("browseProducts"), description: t("browseProductsDesc"), href: "/dealer/products", icon: Package, accent: "red" },
    { label: t("myOrders"), description: t("myOrdersDesc"), href: "/dealer/orders", icon: ShoppingCart, accent: "zinc" },
    { label: t("contracts"), description: t("contractsDesc"), href: "/dealer/contracts", icon: FileText, accent: "zinc" },
    { label: t("profile"), description: t("profileDesc"), href: "/dealer/profile", icon: TrendingUp, accent: "zinc" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0f0f0f] px-8 py-10 shadow-2xl shadow-zinc-200">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-600 via-red-500 to-transparent" />
        
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500 text-xs font-black tracking-widest uppercase mb-3">
              <Anchor className="h-4 w-4" />
              <span>{t("portal")}</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              {t("welcome")}{user?.companyName ? `, ${user.companyName}` : ""}
            </h1>
            <p className="text-zinc-400 text-sm max-w-sm">
              {t("heroDescription")}
            </p>
          </div>
          
        </div>
      </div>

      {/* Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dealerStats.map((stat) => {
          const Icon = stat.icon;
          const isStatus = stat.label === t("contractStatus");
          const styles = isStatus ? getStatusStyles(stat.value) : null;
          
          return (
            <div 
              key={stat.label} 
              className={`bg-white border rounded-3xl p-6 shadow-sm transition-all duration-300 ${
                isStatus ? styles?.card : "border-zinc-100 hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                isStatus ? styles?.icon : "bg-zinc-50 text-zinc-500"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              {stat.type === "badge" ? (
                <span className={`inline-block mt-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-xs ${styles?.badge}`}>
                  {stat.value.toLowerCase() === "approved" ? tContracts("approved") : 
                   stat.value.toLowerCase() === "pending" ? tContracts("pending") : 
                   stat.value.toLowerCase() === "rejected" ? tContracts("rejected") : 
                   stat.value}
                </span>
              ) : (
                <p className="text-2xl font-black text-zinc-900 mt-1">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Order */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> {t("recentOrders")}
          </h2>
          {stats?.recentOrder ? (
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">{t("orderId")}</p>
                  <p className="text-lg font-black text-zinc-900">#{stats.recentOrder.id.toString().padStart(5, '0')}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getOrderStatusColor(stats.recentOrder.status)}`}>
                  {translateOrderStatus(stats.recentOrder.status)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-y border-zinc-50 py-4 mb-6">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">{t("date")}</p>
                  <p className="text-sm font-bold text-zinc-700">{new Date(stats.recentOrder.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">{t("items")}</p>
                  <p className="text-sm font-bold text-zinc-700">{stats.recentOrder.itemsCount} {t("productsCount")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">{t("total")}</p>
                  <p className="text-sm font-bold text-zinc-900">{formatPrice(stats.recentOrder.total)}</p>
                </div>
              </div>

              <Link href="/dealer/orders" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center justify-center gap-1">
                {t("viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-4">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="text-zinc-500 font-medium">{t("noOrders")}</p>
              <Link href="/dealer/products" className="text-sm font-bold text-red-600 mt-2 inline-block">{t("startShopping")}</Link>
            </div>
          )}
        </div>

        {/* Quick Links / Modern Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Anchor className="h-5 w-5" /> {t("quickAccess")}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              const isRed = item.accent === "red";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-x-1 ${
                    isRed ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRed ? "bg-red-600" : "bg-zinc-100 group-hover:bg-zinc-200"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={`text-[10px] ${isRed ? "text-zinc-400" : "text-zinc-500"}`}>{item.description}</p>
                  </div>
                  <ArrowRight className={`absolute right-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${isRed ? "text-red-400" : "text-zinc-300"}`} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
