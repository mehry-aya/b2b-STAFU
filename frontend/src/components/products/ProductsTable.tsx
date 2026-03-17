import { Product } from "@/lib/types/product";
import { Box, Tag, PackageOpen, RefreshCw } from "lucide-react";

interface Props {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  syncing: boolean;
  onSync: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "active") return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:text-emerald-400">Active</span>
  );
  if (s === "draft") return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:text-amber-400">Draft</span>
  );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:text-gray-300 capitalize">{status}</span>
  );
}

export function ProductsTable({ products, loading, searchQuery, syncing, onSync }: Props) {
  return (
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
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 rounded-xl shrink-0" />
                      <div className="h-4 bg-zinc-100 rounded w-48" />
                    </div>
                  </td>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-zinc-100 rounded w-20 mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                      <PackageOpen className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">No Products Found</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try different keywords.`
                        : "Your catalog is empty. Sync from Shopify to import products."}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={onSync}
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
              products.map((product) => {
                const firstImage = product.images?.[0]?.src;
                const firstVariant = product.variants?.[0];

                return (
                  <tr key={product.id} className="group hover:bg-zinc-50/80 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/50 shadow-sm">
                          {firstImage ? (
                            <img src={firstImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Box className="w-6 h-6 text-zinc-300" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors max-w-sm" title={product.title}>
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {firstVariant?.sku ? (
                          <span className="text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 shadow-sm px-2.5 py-1 rounded-md max-w-fit truncate">
                            SKU: {firstVariant.sku}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-red-400/70 bg-red-50/50 border border-red-100 px-2.5 py-1 rounded-md max-w-fit">No SKU</span>
                        )}
                        {product.productType ? (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Tag className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="truncate max-w-[120px]">{product.productType}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-bold text-sm">
                        {product.variants?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-zinc-900">
                          {firstVariant?.price ? `₺${parseFloat(firstVariant.price).toFixed(2)}` : "-"}
                        </span>
                        {firstVariant?.compareAtPrice && (
                          <span className="text-[10px] text-zinc-400 line-through font-medium">
                            ₺{parseFloat(firstVariant.compareAtPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="block text-sm font-bold text-zinc-900 whitespace-nowrap">
                        {new Date(product.syncedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                        at {new Date(product.syncedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}