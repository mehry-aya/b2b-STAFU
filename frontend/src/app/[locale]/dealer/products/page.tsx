"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Product } from "@/lib/types/product";
import { fetchProducts } from "@/lib/api/products";
import debounce from "lodash.debounce";
import { Search, ChevronRight, Package } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useTranslations, useLocale } from "next-intl";
import { useCurrency } from "@/context/CurrencyContext";

export default function DealerProductsPage() {
  const router = useRouter();
  const t = useTranslations("DealerProducts");
  const tErr = useTranslations("Errors");
  const locale = useLocale();
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalCount, setTotalCount] = useState(0);

  const loadProducts = async (searchquery: string = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts(
        searchquery,
        undefined,
        false,
        currentCategory || undefined,
        true,
        undefined,
        page,
        pageSize
      );
      setProducts(data.data);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err.message || tErr("fetchProductsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(searchTerm);
  }, [currentCategory, page]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      loadProducts(query);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
    debouncedSearch(e.target.value);
  };

  const getLowestPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return null;
    let minPrice: number | null = null;
    product.variants.forEach((v) => {
      if (v.price) {
        const priceNum = parseFloat(v.price as string);
        if (minPrice === null || priceNum < minPrice) {
          minPrice = priceNum;
        }
      }
    });
    return minPrice;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center text-xs text-zinc-400 mb-2 font-medium">
            <button
              onClick={() => router.push("/dealer/products")}
              className="hover:text-zinc-700 transition-colors"
            >
              {t("breadcrumb")}
            </button>
            {currentCategory && (
              <>
                <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-zinc-300" />
                <span className="text-zinc-700 capitalize">
                  {currentCategory.replace(/-/g, " ")}
                </span>
              </>
            )}
          </nav>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            {currentCategory
              ? currentCategory.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
              : t("allProducts")}
            <span className="text-xs font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200 tracking-normal">
              {totalCount} {t("items")}
            </span>
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors placeholder:text-zinc-400"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-zinc-100 overflow-hidden animate-pulse">
              <div className="w-full h-52 bg-zinc-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-zinc-100 rounded w-1/3" />
                <div className="h-5 bg-zinc-100 rounded w-3/4" />
                <div className="h-6 bg-zinc-100 rounded w-1/4 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-100">
          <Package className="h-10 w-10 text-zinc-300 mb-3" />
          <h3 className="text-base font-bold text-zinc-900">{t("noProducts")}</h3>
          <p className="text-sm text-zinc-500 mt-1">
            {t("noProductsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
          {products.map((product) => {
            const firstImage = product.images?.[0]?.src;
            const price = getLowestPrice(product);

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/dealer/products/${product.id}`)}
                className="group relative bg-white border border-zinc-100 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-200/60 hover:border-zinc-200"
              >
                {/* Image */}
                <div className="relative w-full aspect-square bg-zinc-50 overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Package className="h-10 w-10 text-zinc-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  
                  <h3 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-zinc-900">
                        {price && price !== "N/A" ? formatPrice(price) : "—"}
                      </span>
                      {product.variants && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                          (product.variants?.reduce((sum: number, v: any) => sum + (v.inventoryQuantity || 0), 0) || 0) > 0 
                            ? "text-emerald-600" 
                            : "text-red-500"
                        }`}>
                          {product.variants?.reduce((sum: number, v: any) => sum + (v.inventoryQuantity || 0), 0) || 0} in stock
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-red-500 transition-colors uppercase tracking-wide">
                      {t("view")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setPage}
        itemsLabel={t("productsLabel")}
      />
    </div>
  );
}
