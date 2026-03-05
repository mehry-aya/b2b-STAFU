"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyOrdersAction } from "@/app/login/actions";
import OrderList from "@/components/OrderList";
import Link from "next/link";

export default function DealerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const result = await getMyOrdersAction();
    if (result.orders) {
      setOrders(result.orders);
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
              href="/dealer/dashboard"
              className="hover:text-slate-900 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Order History</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            My Orders
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">
            Track your order statuses and payment progress.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">
            Loading History...
          </div>
        ) : (
          <OrderList initialOrders={orders} isAdmin={false} />
        )}
      </div>
    </div>
  );
}
