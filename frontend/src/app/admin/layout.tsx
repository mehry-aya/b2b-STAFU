import { ReactNode } from "react";
import AdminSidebar from "@/components/layouts/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Portal - STAFUPRO",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
