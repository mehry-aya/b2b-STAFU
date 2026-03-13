"use client";

import { ReactNode, useState, useEffect } from "react";
import SidebarLayout from "./SidebarLayout";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  User,
  Shield,
} from "lucide-react";
import { getMeAction } from "@/app/(auth)/actions";

export default function AdminSidebar({ children }: { children: ReactNode }) {
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    getMeAction().then((data) => {
      if (data?.role === "master_admin") setIsMaster(true);
    });
  }, []);

  const base = isMaster ? "/master" : "/admin";

  const navItems = [
    { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
     ...(isMaster
      ? [{ label: "Admins", href: "/master/admins", icon: Shield }]
      : []),
    { label: "Dealers", href: `${base}/dealers`, icon: Users },
    { label: "Orders", href: `${base}/orders`, icon: ShoppingCart },
    { label: "Products", href: `${base}/products`, icon: Package },
    { label: "Contracts", href: `${base}/contracts`, icon: FileText },
    { label: "Export", href: `${base}/export`, icon: BarChart3 },
    { label: "Profile", href: `${base}/profile`, icon: User },
   
  ];

  const brandSubtitle = (
    <div className="flex items-center gap-2 mt-1">
      <span
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: "var(--sidebar-text)" }}
      >
        {isMaster ? "Master Portal" : "Admin Portal"}
      </span>
      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-600/20">
        {isMaster ? "Master" : "Admin"}
      </span>
    </div>
  );

  return (
    <SidebarLayout navItems={navItems} brandSubtitle={brandSubtitle}>
      {children}
    </SidebarLayout>
  );
}
