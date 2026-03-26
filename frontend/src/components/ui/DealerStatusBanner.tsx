import { useEffect, useState } from "react";
import { getMeAction } from "@/app/(auth)/actions";
import { useTranslations } from "next-intl";
import { AlertCircle, Clock } from "lucide-react";

export default function DealerStatusBanner() {
  const t = useTranslations("AccountStatus");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getMeAction();
        if (data && !data.error && data.dealer) {
          setStatus(data.dealer.contractStatus);
        }
      } catch (error) {
        console.error("Failed to fetch dealer status:", error);
      }
    };
    fetchStatus();
  }, []);

  if (!status || status === "approved") {
    return null;
  }

  const isWarning = status === "suspended" || status === "rejected";

  return (
    <div
      className={`w-full px-6 py-4 flex items-center justify-center gap-3 text-sm font-bold shadow-sm z-40 ${
        isWarning
          ? "bg-red-500 text-white border-b border-red-600"
          : "bg-amber-500 text-amber-950 border-b border-amber-600"
      }`}
    >
      {isWarning ? (
        <AlertCircle className="h-5 w-5 shrink-0" />
      ) : (
        <Clock className="h-5 w-5 shrink-0" />
      )}
      <p>
        {status === "suspended"
          ? t("suspended")
          : status === "rejected"
          ? t("rejected")
          : t("pending")}
      </p>
    </div>
  );
}
