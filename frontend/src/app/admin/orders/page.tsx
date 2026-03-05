"use client";

import { useEffect, useState, useCallback } from "react";
import { getOrdersAction } from "@/app/login/actions";
import OrderList from "@/components/OrderList";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const result = await getOrdersAction();
    if (result.orders) {
      setOrders(result.orders);
    } else {
      setError(result.error || "Failed to load orders");
    }
    setLoading(false);
  }, []);

  const exportToCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      "Order ID",
      "Date",
      "Dealer",
      "Status",
      "Total Amount",
      "Items",
    ];
    const rows = orders.map(
      (o: {
        id: number;
        createdAt: string;
        dealer: { companyName: string };
        status: string;
        totalAmount: number;
        items: Array<{
          product: { title: string };
          variant: { title: string };
          quantity: number;
        }>;
      }) => [
        o.id,
        new Date(o.createdAt).toLocaleDateString(),
        o.dealer.companyName,
        o.status,
        o.totalAmount,
        o.items
          .map((i) => `${i.product.title}(${i.variant.title}) x${i.quantity}`)
          .join("; "),
      ],
    );

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `stafupro_orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
              <Link
                href="/admin/dashboard"
                className="hover:text-slate-900 transition-colors"
              >
                Admin
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">Orders</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Order Tracking
            </h1>
            <p className="text-slate-500 font-medium tracking-tight">
              Monitor dealer orders and confirm manual payments.
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={orders.length === 0}
            className="px-6 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-slate-100 disabled:opacity-30 disabled:active:scale-100"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
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
          <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">
            Loading Orders...
          </div>
        ) : (
          <OrderList initialOrders={orders} isAdmin={true} />
        )}
      </div>
    </div>
  );
}
