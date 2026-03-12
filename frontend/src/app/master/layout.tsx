import { ReactNode } from "react";
import AdminSidebar from "@/components/layouts/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Master Admin Portal - STAFUPRO",
};

export default function MasterLayout({ children }: { children: ReactNode }) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
