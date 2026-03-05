"use client";

import { useCallback, useEffect, useState } from "react";
import { getProductsAction, syncProductsAction } from "../../login/actions";
import ProductTable from "@/components/ProductTable";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setError(null);
    const result = await getProductsAction();
    if (result.products) {
      setProducts(result.products);
    } else if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Defer to microtask queue to avoid synchronous setState warning in React 19
    Promise.resolve().then(() => fetchProducts());
  }, [fetchProducts]);

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    const result = await syncProductsAction();
    if (result.success) {
      setMessage({ type: "success", text: "Products synced successfully" });
      fetchProducts();
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to sync products",
      });
    }
    setSyncing(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
              <Link
                href="/admin/dashboard"
                className="hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-900">Products</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Manage Products
            </h1>
            <p className="text-slate-600">
              Sync and view your Shopify product catalog
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-lg shadow-slate-200 ${
              syncing
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 active:scale-95"
            }`}
          >
            {syncing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Sync Products
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-800 mb-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {message.type === "success" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span className="text-sm font-semibold">{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="flex justify-center">
              <svg
                className="animate-spin h-10 w-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-slate-500 font-medium">Loading products...</p>
          </div>
        ) : (
          <ProductTable products={products} />
        )}
      </div>
    </div>
  );
}
