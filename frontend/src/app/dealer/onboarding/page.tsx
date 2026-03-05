"use client";

import { useEffect, useState, useCallback } from "react";
import { getDealerStatusAction } from "@/app/login/actions";
import ContractUpload from "@/components/ContractUpload";
import { useRouter } from "next/navigation";

export default function DealerOnboardingPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkStatus = useCallback(async () => {
    const result = await getDealerStatusAction();
    if (result.dealer) {
      if (result.dealer.contractStatus === "approved") {
        router.push("/dealer/dashboard");
      } else {
        setStatus(result.dealer.contractStatus);
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    Promise.resolve().then(() => {
      void checkStatus();
    });
  }, [checkStatus]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <ContractUpload
        currentStatus={status || "none"}
        onSuccess={checkStatus}
      />
    </div>
  );
}
