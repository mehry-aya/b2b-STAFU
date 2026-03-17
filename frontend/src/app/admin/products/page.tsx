"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Product } from "@/lib/types/product";
import { fetchProducts } from "@/lib/api/products";
import { useProductSync } from "@/hooks/use-product-sync";
import { SyncProgressBar } from "@/components/products/SyncProgressBar";
import { ProductsTable } from "@/components/products/ProductsTable";
import { AlertCircle, Search, Anchor, RefreshCw, Calendar, Filter } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

export default function AdminProductsPage() {
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 24;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts(
        searchQuery || undefined,
        undefined,
        true,
        undefined,
        undefined,
        statusFilter,
        page,
        pageSize
      );
      setProducts(data.data);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  const { syncing, syncStatus, startSync } = useProductSync(loadProducts);

  useEffect(() => {
    loadProducts();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-600/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-8 md:py-10 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-600 via-red-500 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold tracking-widest uppercase">
              <Anchor className="h-3.5 w-3.5" />
              <span>{isMaster ? "Master Catalog" : "Product Catalog"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Products Management
            </h1>
            <p className="text-zinc-400 text-sm max-w-md">
              {isMaster 
                ? "Oversee and synchronize the entire platform product catalog across all dealers."
                : "View, search, and synchronize your entire Shopify inventory. Keep your B2B offerings up to date."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-zinc-300 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <button
              onClick={startSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              {syncing ? "Syncing..." : "Sync Shopify"}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {syncing && syncStatus && <SyncProgressBar syncStatus={syncStatus} />}

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="hidden md:flex text-xl font-bold text-zinc-900 items-center gap-2">
          Catalog Overview
          <span className="text-xs font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200">
            {totalCount} Items
          </span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all shadow-sm"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="block w-full pl-10 pr-10 py-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-900 focus:ring-2 focus:ring-red-500 sm:text-sm appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <ProductsTable
          products={products}
          loading={loading}
          searchQuery={searchQuery}
          syncing={syncing}
          onSync={startSync}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}