"use client";

import { ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Download,
} from "lucide-react";

export default function AdminSidebar({ children }: { children: ReactNode }) {
  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Dealers", href: "/admin/dealers", icon: Users },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Contracts", href: "/admin/contracts", icon: FileText },
    { label: "Export", href: "/admin/export", icon: Download },
  ];

  const brandSubtitle = (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Admin Portal</span>
      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
        Admin
      </span>
    </div>
  );

  return (
    <SidebarLayout navItems={navItems} brandSubtitle={brandSubtitle}>
      {children}
    </SidebarLayout>
  );
}
