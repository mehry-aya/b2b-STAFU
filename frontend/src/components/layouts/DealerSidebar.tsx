"use client";

import { useState, useEffect, ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";
import { useSearchParams, usePathname } from "next/navigation";
import { fetchCategories } from "@/lib/api/products";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface Category {
  title: string;
  handle: string;
  children: {
    title: string;
    handle: string;
  }[];
}

export default function DealerSidebar({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get("category");

  useEffect(() => {
    fetchCategories().then((data) => {
      setCategories(data);
      // Auto-expand parent if a child is active (only on initial load or data change)
      setOpenGroups((prev) => {
        const newOpen = { ...prev };
        data.forEach((cat: Category) => {
          if (
            cat.handle === currentCategory ||
            cat.children.some((c) => c.handle === currentCategory)
          ) {
            newOpen[cat.title] = true;
          }
        });
        return newOpen;
      });
    });
  }, []); // Only fetch on mount

  // Separate effect to handle auto-expansion when category changes via URL
  useEffect(() => {
    if (currentCategory && categories.length > 0) {
      setOpenGroups((prev) => {
        const newOpen = { ...prev };
        categories.forEach((cat) => {
          if (
            cat.handle === currentCategory ||
            cat.children.some((c) => c.handle === currentCategory)
          ) {
            newOpen[cat.title] = true;
          }
        });
        return newOpen;
      });
    }
  }, [currentCategory, categories]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

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
    <span className="text-sm font-medium text-gray-500">Dealer Portal</span>
  );

  return (
    <SidebarLayout navItems={navItems} brandSubtitle={brandSubtitle}>
      {children}
    </SidebarLayout>
  );
}
