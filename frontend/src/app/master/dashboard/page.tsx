"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  BarChart3, 
  Shield, 
  Crown,
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import { getAdminStatsAction } from "@/app/dashboard/actions";
import Link from "next/link";

export default function MasterDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStatsAction().then((res) => {
      if (res.stats) {
        setStats(res.stats);
      }
      setLoading(false);
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-32 bg-zinc-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const revenueStats = [
    { label: "This Week", value: stats?.revenue?.week || 0, color: "from-emerald-500 to-teal-600" },
    { label: "This Month", value: stats?.revenue?.month || 0, color: "from-blue-500 to-indigo-600" },
    { label: "This Year", value: stats?.revenue?.year || 0, color: "from-violet-500 to-purple-600" },
    { label: "All Time", value: stats?.revenue?.allTime || 0, color: "from-rose-600 to-red-700" },
  ];

  const platformStats = [
    { label: "Total Dealers", value: stats?.platform?.totalDealers || 0, icon: Users, href: "/admin/dealers" },
    { label: "Active Dealers", value: stats?.platform?.activeDealers || 0, icon: CheckCircle2, href: "/admin/dealers" },
    { label: "Pending Contracts", value: stats?.platform?.pendingContractsCount || 0, icon: FileText, href: "/admin/contracts" },
    { label: "Total Orders", value: stats?.platform?.totalOrders || 0, icon: ShoppingCart, href: "/admin/orders" },
    { label: "Total Admins", value: stats?.platform?.totalAdmins || 0, icon: Shield, href: "/master/admins" },
  ];

  const hasAlerts = (stats?.alerts?.pendingContracts?.length > 0) || (stats?.alerts?.pendingOrdersCount > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <DashboardHeader
        title="Master Admin Dashboard"
        subtitle="Full platform control for STAFUPRO B2B. Manage admins, dealers, and oversee all transactions."
        icon={Crown}
        breadcrumbs={[{ label: "Master Console" }]}
        roleBadge={{ label: "Master", type: "master" }}
      />

      {/* Revenue Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-zinc-900" />
          <h2 className="text-lg font-bold text-zinc-900">Platform Revenue</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueStats.map((stat) => (
            <div 
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl p-6 text-white bg-linear-to-br ${stat.color} shadow-lg shadow-zinc-200/50`}
            >
              <div className="relative z-10">
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black mt-1">{formatCurrency(stat.value)}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <TrendingUp className="h-24 w-24" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Overview */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-zinc-900" />
          <h2 className="text-lg font-bold text-zinc-900">Platform Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group p-5 bg-white border border-zinc-100 rounded-2xl flex items-center gap-4 transition-all hover:border-zinc-300 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Critical Tasks */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-zinc-900" />
          <h2 className="text-lg font-bold text-zinc-900">Action Items</h2>
        </div>

        {!hasAlerts ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900">System Clear</h3>
            <p className="text-emerald-700 mt-1">All dealer contracts and orders are up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Contracts */}
            {stats?.alerts?.pendingContracts?.length > 0 && (
              <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-zinc-900">Pending Approvals</span>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {stats.alerts.pendingContracts.length} Pending
                  </span>
                </div>
                <div className="divide-y divide-zinc-50">
                  {stats.alerts.pendingContracts.map((dealer: any) => (
                    <div key={dealer.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/30 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{dealer.companyName}</p>
                        <p className="text-xs text-zinc-500">{dealer.user.email}</p>
                      </div>
                      <Link
                        href="/admin/contracts"
                        className="bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Orders */}
            {stats?.alerts?.pendingOrdersCount > 0 && (
              <div className="bg-white border border-rose-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Orders Requiring Action</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      There are <span className="font-bold text-rose-600">{stats.alerts.pendingOrdersCount}</span> orders awaiting master approval or payment confirmation.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/orders"
                  className="mt-6 flex items-center justify-center gap-2 w-full bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors"
                >
                  Manage Transactions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
