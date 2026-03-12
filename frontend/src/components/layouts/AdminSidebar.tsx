"use client";

import { ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  User,
} from "lucide-react";

export default function AdminSidebar({ children }: { children: ReactNode }) {
  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Dealers", href: "/admin/dealers", icon: Users },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Contracts", href: "/admin/contracts", icon: FileText },
    { label: "Profile", href: "/admin/profile", icon: User },
  ];

  const brandSubtitle = (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--sidebar-text)" }}>
        Admin Portal
      </span>
      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-600/20">
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
