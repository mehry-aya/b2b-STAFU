"use client";

import { useEffect, useState, useCallback } from "react";
import { getDealersAdminAction } from "@/app/login/actions";
import DealerApprovalTable from "@/components/DealerApprovalTable";
import Link from "next/link";

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const result = await getDealersAdminAction();
    if (result.dealers) {
      setDealers(result.dealers);
    } else {
      setError(result.error || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
            <Link
              href="/admin/dashboard"
              className="hover:text-slate-900 transition-colors"
            >
              Admin
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Dealer Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            Dealers
          </h1>
          <p className="text-slate-500 font-medium">
            Review contracts and approve dealer account activations.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-sm font-bold flex items-center gap-3">
            <svg
              className="w-5 h-5 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Loading Dealers...
          </div>
        ) : (
          <DealerApprovalTable initialDealers={dealers} />
        )}
      </div>
    </div>
  );
}
