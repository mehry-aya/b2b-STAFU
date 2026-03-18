"use client";

import { useState, ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";
import { useSearchParams } from "next/navigation";
import { useShopifyCategories } from "@/hooks/useShopifyCategories";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  User,
} from "lucide-react";

export default function DealerSidebar({ children }: { children: ReactNode }) {
  const t = useTranslations("Navigation");
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const { categories, openGroups, toggleGroup } = useShopifyCategories(currentCategory);

  const navItems = [
    { label: t("dashboard"), href: "/dealer/dashboard", icon: LayoutDashboard },
    {
      label: t("products"),
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
    { label: t("orders"), href: "/dealer/orders", icon: ShoppingCart },
    { label: t("contracts"), href: "/dealer/contracts", icon: FileText },
    { label: t("profile"), href: "/dealer/profile", icon: User },
  ];

  const brandSubtitle = (
    <span
      className="text-xs font-medium tracking-widest uppercase"
      style={{ color: "var(--sidebar-text)" }}
    >
      {t("dealerPortal")}
    </span>
  );

  return (
    <SidebarLayout navItems={navItems} brandSubtitle={brandSubtitle} showCart={true}>
      {children}
    </SidebarLayout>
  );
}
