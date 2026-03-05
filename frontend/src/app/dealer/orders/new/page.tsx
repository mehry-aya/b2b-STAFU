"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductsAction, getDealerStatusAction } from "@/app/login/actions";
import OrderCreation from "@/components/OrderCreation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewOrderPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    // Check dealer status first
    const statusResult = await getDealerStatusAction();
    if (statusResult.dealer) {
      if (statusResult.dealer.contractStatus !== "approved") {
        router.push("/dealer/onboarding");
        return;
      }
    }

    const result = await getProductsAction();
    if (result.products) {
      setProducts(result.products);
    } else {
      setError(result.error || "Failed to load products");
    }
    setLoading(false);
  }, [router]);

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
            <span className="text-slate-900 font-bold">New Order</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            Place New Order
          </h1>
          <p className="text-slate-500 font-medium">
            Select variants and specify quantities to create a B2B order.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-20 text-center font-black uppercase tracking-widest text-slate-300 animate-pulse text-2xl">
            Initializing Order Desk...
          </div>
        ) : (
          <OrderCreation products={products} />
        )}
      </div>
    </div>
  );
}
