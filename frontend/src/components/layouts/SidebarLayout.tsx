"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
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
  const [user, setUser] = useState<{
    companyName: string;
    email: string;
  } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser({ companyName: data.companyName, email: data.email });
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

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-700">STAFUPRO</h1>
        <div className="mt-1">{brandSubtitle}</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname?.startsWith(item.href) &&
                item.href !== "/dealer/dashboard" &&
                item.href !== "/admin/dashboard");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-400"}`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-4 px-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.companyName || "Loading..."}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-blue-700">STAFUPRO</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
