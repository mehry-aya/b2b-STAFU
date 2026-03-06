"use client";

import { ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  User,
} from "lucide-react";

export default function DealerSidebar({ children }: { children: ReactNode }) {
  const navItems = [
    { label: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/dealer/products", icon: Package },
    { label: "Orders", href: "/dealer/orders", icon: ShoppingCart },
    { label: "Contracts", href: "/dealer/contracts", icon: FileText },
    { label: "Profile", href: "/dealer/profile", icon: User },
  ];

  const brandSubtitle = (
    <span className="text-sm font-medium text-gray-500">Dealer Portal</span>
  );

  return (
    <SidebarLayout navItems={navItems} brandSubtitle={brandSubtitle}>
      {children}
    </SidebarLayout>
  );
}
