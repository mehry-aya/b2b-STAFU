"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/types/product";
import { fetchProducts, syncShopifyProducts } from "@/lib/api/products";
import { RefreshCw, PackageOpen, AlertCircle, Search, Tag, Anchor, Box, ChevronLeft, ChevronRight, Filter, Calendar } from "lucide-react";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalCount, setTotalCount] = useState(0);

  const loadProducts = async () => {
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
  };

  useEffect(() => {
    loadProducts();
  }, [page, statusFilter, pageSize]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        loadProducts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      const result = await syncShopifyProducts();
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${result.productsSynced} products and ${result.variantsSynced} variants from Shopify.`,
      });
      // Reload the table with fresh data
      await loadProducts();
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description:
          err.message || "An error occurred while syncing with Shopify.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Active
        </span>
      );
    }
    if (s === "draft") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 capitalize">
        {status}
      </span>
    );
  };

  // Server-side filtering is now used, so we use products directly
  const visibleProducts = products;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-600/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-600 via-red-500 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold tracking-widest uppercase">
              <Anchor className="h-3.5 w-3.5" />
              <span>Product Catalog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Manage Products
            </h1>
            <p className="text-zinc-400 text-sm max-w-md">
              View, search, and synchronize your entire Shopify inventory. Keep your B2B offerings up to date.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-zinc-300 text-xs font-bold shadow-xl">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
              />
              {syncing ? "Syncing..." : "Sync Shopify"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            Catalog Overview
            <span className="text-xs font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200">
              {totalCount} Items
            </span>
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all shadow-sm"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-44">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-zinc-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none cursor-pointer shadow-sm transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product List */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold">
              <tr>
                <th className="px-6 py-4 rounded-tl-3xl">Product</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-center">Variants</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-3xl">Last Synced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                // Skeleton Loader
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-xl shrink-0" />
                        <div className="h-4 bg-zinc-100 rounded w-48" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-zinc-100 rounded w-20" />
                        <div className="h-4 bg-zinc-100 rounded w-16" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-100 rounded w-8 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-zinc-100 rounded w-16 ml-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-zinc-100 rounded-full w-16 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-zinc-100 rounded w-24 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : visibleProducts.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                        <PackageOpen className="w-10 h-10 text-zinc-300" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">No Products Found</h3>
                      <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                        {searchQuery 
                          ? `We couldn't find anything matching "${searchQuery}". Try different keywords.`
                          : "Your catalog is empty or matches no filters. Sync from Shopify to import your active products."}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={handleSync}
                          disabled={syncing}
                          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                          Sync Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Actual Data rows
                visibleProducts.map((product) => {
                  const firstImage = product.images?.[0]?.src;
                  const firstVariant = product.variants?.[0];
                  const sku = firstVariant?.sku;
                  const price = firstVariant?.price;

                  return (
                    <tr 
                      key={product.id} 
                      className="group hover:bg-zinc-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/50 shadow-sm z-0">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Box className="w-6 h-6 opacity-20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span 
                              className="font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors max-w-sm"
                              title={product.title}
                            >
                              {product.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 justify-center">
                          {sku ? (
                            <span className="text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 shadow-sm px-2.5 py-1 rounded-md max-w-fit truncate" title={`SKU: ${sku}`}>
                              SKU: {sku}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-red-400/70 bg-red-50/50 border border-red-100 shadow-sm px-2.5 py-1 rounded-md max-w-fit truncate">
                              No SKU
                            </span>
                          )}
                          {product.productType ? (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                              <Tag className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="truncate max-w-[120px]" title={product.productType}>
                                {product.productType}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 font-medium">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-bold text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                          {product.variants?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-zinc-900">
                          {price ? `$${parseFloat(price).toFixed(2)}` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-zinc-900 whitespace-nowrap">
                            {new Date(product.syncedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">
                            at {new Date(product.syncedAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-zinc-500 font-medium">
              Showing <span className="font-bold text-zinc-900">{((page - 1) * pageSize) + 1}</span> to <span className="font-bold text-zinc-900">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-bold text-zinc-900">{totalCount}</span> products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // Show only first, last, and pages around current
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                          page === p 
                            ? "bg-red-600 text-white shadow-md shadow-red-600/20" 
                            : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="px-1 text-zinc-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
