"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/types/product";
import { fetchProducts, syncShopifyProducts } from "@/lib/api/products";
import { RefreshCw, PackageOpen, AlertCircle } from "lucide-react";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      // Pass 'all=true' to fetch active, draft, and archived products (admin only backend logic)
      const data = await fetchProducts(undefined, undefined, true);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Products Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and sync your Shopify product catalog.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Syncing..." : "Sync from Shopify"}
        </button>
      </div>

      {error ? (
        <div className="flex items-center p-4 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium text-center">
                    Variants
                  </th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">
                    Last Synced
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded shrink-0"></div>
                          <div className="h-4 bg-muted rounded w-32"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-8 mx-auto"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-muted rounded-full w-16 mx-auto"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-24 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  // Empty state
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-base font-medium text-foreground">
                        No products found
                      </p>
                      <p className="mt-1">
                        Click the sync button above to import products from
                        Shopify.
                      </p>
                    </td>
                  </tr>
                ) : (
                  // Actual data
                  products.map((product) => {
                    const firstImage = product.images?.[0]?.src;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0 border">
                              {firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                  Img
                                </div>
                              )}
                            </div>
                            <span
                              className="font-medium text-foreground line-clamp-2 max-w-[250px]"
                              title={product.title}
                            >
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {product.productType || "-"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {product.vendor || "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {product.variants?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(product.status)}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                          {new Date(product.syncedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
