import { ReactNode } from "react";
import DealerSidebar from "@/components/layouts/DealerSidebar";

export const metadata = {
  title: "Dealer Portal - STAFUPRO",
};

export default function DealerLayout({ children }: { children: ReactNode }) {
  return <DealerSidebar>{children}</DealerSidebar>;
}
