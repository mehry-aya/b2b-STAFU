"use client";

import { useState, ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";
import { useSearchParams } from "next/navigation";
import { useShopifyCategories } from "@/hooks/useShopifyCategories";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  User,
} from "lucide-react";

export default function DealerSidebar({ children }: { children: ReactNode }) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const { categories, openGroups, toggleGroup } = useShopifyCategories(currentCategory);

  const navItems = [
    { label: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
    {
      label: "Products",
      href: "/dealer/products",
      icon: Package,
      isOpen: isProductsOpen,
      onToggle: () => setIsProductsOpen(!isProductsOpen),
      children: categories.map((cat) => ({
        label: cat.title,
        href: cat.handle ? `/dealer/products?category=${cat.handle}` : "#",
        active: currentCategory === cat.handle,
        isGroup: !cat.handle,
        isOpen: openGroups[cat.title],
        onToggle: () => toggleGroup(cat.title),
        children: cat.children.map((child) => ({
          label: child.title,
          href: `/dealer/products?category=${child.handle}`,
          active: currentCategory === child.handle,
        })),
      })),
    },
    { label: "Orders", href: "/dealer/orders", icon: ShoppingCart },
    { label: "Contracts", href: "/dealer/contracts", icon: FileText },
    { label: "Profile", href: "/dealer/profile", icon: User },
  ];

  const brandSubtitle = (
    <span
      className="text-xs font-medium tracking-widest uppercase"
      style={{ color: "var(--sidebar-text)" }}
    >
      Dealer Portal
    </span>
  );

  return (
    <SidebarLayout navItems={navItems} brandSubtitle={brandSubtitle} showCart={true}>
      {children}
    </SidebarLayout>
  );
}
