"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, ChevronDown, ChevronRight, ShoppingBag } from "lucide-react";
import { logoutAction, getMeAction } from "@/app/login/actions";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { useCart } from "@/context/CartContext";

interface NavItem {
  icon?: React.ElementType;
  label: string;
  href: string;
  children?: NavItem[];
  active?: boolean;
  isGroup?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  brandSubtitle: React.ReactNode;
}
export default function SidebarLayout({
  children,
  navItems,
  brandSubtitle,
}: SidebarLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const [user, setUser] = useState<{
    companyName: string;
    email: string;
  } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMeAction();
        if (data && !data.error) {
          const companyName =
            data.dealer?.companyName ||
            (data.role === "admin" || data.role === "master_admin"
              ? "Administration"
              : "Contractor");
          setUser({ companyName, email: data.email });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive =
      item.active ??
      (pathname === item.href ||
        (pathname?.startsWith(item.href) &&
          item.href !== "/dealer/dashboard" &&
          item.href !== "/admin/dashboard" &&
          item.href !== "/dealer/products"));

    const hasChildren = item.children && item.children.length > 0;
    const isLink = item.href !== "#";

    return (
      <li key={item.label + item.href}>
        <div className="flex flex-col">
          {isLink ? (
            <div className="group relative">
              <Link
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-red-600/15 text-white border-l-2 border-red-500"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                }`}
                style={{
                  paddingLeft:
                    depth > 0 ? `${depth * 1.5 + 0.75}rem` : "0.75rem",
                }}
              >
                {item.icon && (
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-red-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
                  />
                )}
                <span className="flex-1 truncate">{item.label}</span>
                {hasChildren && <div className="w-6 h-6" />}
              </Link>
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.onToggle?.();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md transition-colors"
                  title={item.isOpen ? "Collapse" : "Expand"}
                >
                  {item.isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={item.onToggle}
              className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all duration-150`}
              style={{ paddingLeft: depth > 0 ? `${depth * 1}rem` : "0.75rem" }}
            >
              {item.icon && <item.icon className="h-4 w-4 shrink-0 text-zinc-500" />}
              <span className="flex-1 text-left truncate">{item.label}</span>
              {hasChildren &&
                (item.isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                ))}
            </button>
          )}

          {hasChildren && item.isOpen && (
            <ul className="mt-0.5 space-y-0.5 border-l border-white/6 ml-5">
              {item.children?.map((child) => renderNavItem(child, depth + 1))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  const sidebarContent = (
    <div
      className="flex h-full flex-col"
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        {/* Red accent line */}
        <div className="w-8 h-0.5 bg-red-600 mb-3 rounded-full" />
        <h1
          className="text-xl font-black tracking-widest uppercase"
          style={{ color: "var(--sidebar-text-active)", letterSpacing: "0.15em" }}
        >
          STAFUPRO
        </h1>
        <div className="mt-1">{brandSubtitle}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {navItems.map((item) => renderNavItem(item))}
        </ul>
      </nav>

      {/* Cart Toggle (Desktop) */}
      <div className="px-3 py-4">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold bg-zinc-800 text-white hover:bg-zinc-700 transition-all group"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-4 w-4 text-red-500" />
            <span>My Cart</span>
          </div>
          {totalItems > 0 && (
            <span className="bg-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* User section */}
      <div className="p-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        {user && (
          <div className="flex items-center gap-3 px-2 mb-3">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0"
            >
              {getInitials(user.companyName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--sidebar-text-active)" }}>
                {user.companyName}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--sidebar-text)" }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-red-600/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ background: "var(--surface)" }}>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header
          className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:hidden"
          style={{ background: "var(--sidebar-bg)", borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-white focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span
              className="text-base font-black tracking-widest uppercase"
              style={{ color: "var(--sidebar-text-active)" }}
            >
              STAFUPRO
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 relative text-zinc-400 hover:text-white transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full text-white">
                {totalItems}
              </span>
            )}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-7 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
