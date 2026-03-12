"use client";

import { Users, ShoppingCart, Package, FileText, BarChart3, Anchor } from "lucide-react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import DashboardGrid from "@/components/ui/DashboardGrid";

const adminModules = [
  {
    label: "Dealer Management",
    description: "Review, approve, and manage dealer accounts",
    href: "/admin/dealers",
    icon: Users,
    primary: true,
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

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Platform-wide management for STAFUPRO B2B. Approve dealers, monitor orders, and oversee the full catalog."
        icon={Anchor}
        breadcrumbs={[{ label: "Admin Console" }]}
      />

      <DashboardGrid modules={adminModules} />

      {/* Bottom strip */}
      <div className="rounded-2xl bg-white border border-zinc-100 px-6 py-5 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Anchor className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">STAFUPRO B2B Platform</p>
            <p className="text-xs text-zinc-500">
              Manage dealers, orders, and contracts from one place.
            </p>
          </div>
        </div>
        <a
          href="/admin/dealers"
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-red-600 transition-colors"
        >
          Manage Dealers
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
