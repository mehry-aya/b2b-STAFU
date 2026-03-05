"use client";

import { useCallback, useEffect, useState } from "react";
import { getProductsAction, getDealerStatusAction } from "../../login/actions";
import ProductTable from "@/components/ProductTable";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DealerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    // First check dealer status
    const statusResult = await getDealerStatusAction();
    if (statusResult.dealer) {
      if (statusResult.dealer.contractStatus !== "approved") {
        router.push("/dealer/onboarding");
        return;
      }
    }

    setError(null);
    const result = await getProductsAction();
    if (result.products) {
      setProducts(result.products);
    } else if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Defer to microtask queue to avoid synchronous setState warning in React 19
    Promise.resolve().then(() => fetchProducts());
  }, [fetchProducts]);

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
            <span className="text-slate-900">Products</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Product Catalog
          </h1>
          <p className="text-slate-600">
            Browse available items from our Shopify store
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-800 mb-6">
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
            <p className="text-slate-500 font-medium">Loading catalog...</p>
          </div>
        ) : (
          <ProductTable products={products} />
        )}
      </div>
    </div>
  );
}
