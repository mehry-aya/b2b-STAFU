"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types/product";
import { fetchProducts } from "@/lib/api/products";
import debounce from "lodash.debounce";
import { Search, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function DealerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async (searchquery: string = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts(
        searchquery,
        undefined,
        false,
        currentCategory || undefined,
        true
      );
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount and when category changes
  useEffect(() => {
    loadProducts(searchTerm);
  }, [currentCategory]);

  // Debounced search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      loadProducts(query);
    }, 300),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const getLowestPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return null;
    let minPrice: number | null = null;
    product.variants.forEach((v) => {
      if (v.price) {
        const price = parseFloat(v.price as string);
        if (minPrice === null || price < minPrice) {
          minPrice = price;
        }
      }
    });
    return minPrice !== null ? (minPrice as number).toFixed(2) : "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-4">
        <button
          onClick={() => router.push("/dealer/products")}
          className="hover:text-primary transition-colors"
        >
          Products
        </button>
        {currentCategory && (
          <>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="font-medium text-foreground capitalize">
              {currentCategory.replace(/-/g, " ")}
            </span>
          </>
        )}
      </nav>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Browse and order available products.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border rounded-xl bg-card overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-muted"></div>
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/3 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-foreground">
            No products found
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Try adjusting your search or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const firstImage = product.images?.[0]?.src;
            const price = getLowestPrice(product);

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/dealer/products/${product.id}`)}
                className="group border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="w-full aspect-4/3 bg-muted relative overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col grow">
                  <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
                    {product.vendor || "Vendor"}
                  </div>
                  <h3 className="text-lg font-semibold leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="text-xl font-bold">
                      {price !== "N/A" ? `$${price}` : "Price not available"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
