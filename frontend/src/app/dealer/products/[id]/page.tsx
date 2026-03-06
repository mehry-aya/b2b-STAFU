"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductVariant } from "@/lib/types/product";
import { fetchProductById } from "@/lib/api/products";
import { ChevronLeft, ShoppingCart, Info, Package, Hash } from "lucide-react";

export default function DealerProductDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string | null;
  }>({
    option1: null,
    option2: null,
    option3: null,
  });
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(params.id);
        setProduct(data);

        // Auto-select first available variant's options
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedOptions({
            option1: firstVariant.option1,
            option2: firstVariant.option2,
            option3: firstVariant.option3,
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleOptionChange = (
    optionKey: "option1" | "option2" | "option3",
    value: string,
  ) => {
    setSelectedOptions((prev) => ({ ...prev, [optionKey]: value }));
  };

  // Find the exact variant matching all 3 selected options
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find(
        (v) =>
          v.option1 === selectedOptions.option1 &&
          v.option2 === selectedOptions.option2 &&
          v.option3 === selectedOptions.option3,
      ) || null
    );
  }, [product, selectedOptions]);

  // Extract unique non-null values for each option to render the dropdowns
  const availableOptions = useMemo(() => {
    if (!product?.variants) return { option1: [], option2: [], option3: [] };

    return {
      option1: Array.from(
        new Set(product.variants.map((v) => v.option1).filter(Boolean)),
      ),
      option2: Array.from(
        new Set(product.variants.map((v) => v.option2).filter(Boolean)),
      ),
      option3: Array.from(
        new Set(product.variants.map((v) => v.option3).filter(Boolean)),
      ),
    };
  }, [product]);

  const handleAddToOrder = () => {
    if (!selectedVariant) {
      toast({
        title: "Cannot Add to Order",
        description: "Please select a valid combination of options.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Added ${quantity}x ${product?.title} (${selectedVariant.title || "Default Variant"}) to order.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-muted w-32 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted aspect-square rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-muted w-3/4 rounded"></div>
            <div className="h-4 bg-muted w-1/4 rounded"></div>
            <div className="h-32 bg-muted w-full rounded mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive text-center rounded-xl border border-destructive/20">
        <p className="font-medium text-lg mb-2">Error Loading Product</p>
        <p className="text-sm">{error || "Product not found"}</p>
        <button
          onClick={() => router.push("/dealer/products")}
          className="mt-4 px-4 py-2 bg-background border text-foreground rounded-md text-sm hover:bg-muted"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Choose the image: first try selected variant, then fallback to product's first image
  const displayImage = selectedVariant?.imageUrl || product.images?.[0]?.src;
  const isOutOfStock = selectedVariant
    ? (selectedVariant.inventoryQuantity || 0) <= 0
    : true;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <button
        onClick={() => router.push("/dealer/products")}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="bg-muted rounded-xl aspect-square overflow-hidden relative border shadow-sm">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Package className="h-12 w-12 mb-2 opacity-20" />
                <span>No Image Available</span>
              </div>
            )}
          </div>
          {/* Miniature gallery if multiple images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-20 shrink-0 bg-muted rounded-md border overflow-hidden"
                >
                  <img
                    src={img.src}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex flex-col">
          <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">
            {product.vendor || "Vendor"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
            {product.title}
          </h1>

          <div className="text-3xl font-bold text-primary mt-2 mb-6">
            {selectedVariant?.price
              ? `$${parseFloat(selectedVariant.price).toFixed(2)}`
              : "Price Unavailable"}
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="mt-2 mb-8 prose prose-sm dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          <div className="w-full h-px bg-border mb-8"></div>

          {/* Options Selectors */}
          <div className="space-y-5 mb-8">
            {availableOptions.option1.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Option 1
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.option1.map((val) => (
                    <button
                      key={val}
                      onClick={() =>
                        handleOptionChange("option1", val as string)
                      }
                      className={`px-4 py-2 border rounded-md text-sm transition-all
                        ${
                          selectedOptions.option1 === val
                            ? "border-primary ring-1 ring-primary text-primary font-medium bg-primary/5"
                            : "hover:border-foreground/30 text-muted-foreground"
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableOptions.option2.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Option 2
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.option2.map((val) => (
                    <button
                      key={val}
                      onClick={() =>
                        handleOptionChange("option2", val as string)
                      }
                      className={`px-4 py-2 border rounded-md text-sm transition-all
                        ${
                          selectedOptions.option2 === val
                            ? "border-primary ring-1 ring-primary text-primary font-medium bg-primary/5"
                            : "hover:border-foreground/30 text-muted-foreground"
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableOptions.option3.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Option 3
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.option3.map((val) => (
                    <button
                      key={val}
                      onClick={() =>
                        handleOptionChange("option3", val as string)
                      }
                      className={`px-4 py-2 border rounded-md text-sm transition-all
                        ${
                          selectedOptions.option3 === val
                            ? "border-primary ring-1 ring-primary text-primary font-medium bg-primary/5"
                            : "hover:border-foreground/30 text-muted-foreground"
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Variant Meta */}
          <div className="bg-muted/50 rounded-lg p-4 mb-8 space-y-3 border">
            {selectedVariant ? (
              <>
                <div className="flex items-center text-sm">
                  <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">SKU:</span>
                  <span className="font-medium text-foreground">
                    {selectedVariant.sku || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Stock:</span>
                  <span
                    className={`font-medium ${isOutOfStock ? "text-destructive" : "text-emerald-600"}`}
                  >
                    {selectedVariant.inventoryQuantity || 0} available
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-amber-600 font-medium">
                Selected combination is not available.
              </div>
            )}
          </div>

          {/* Add to Order Actions */}
          <div className="flex gap-4 mt-auto pt-4">
            <div className="w-24">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full px-3 py-3 rounded-md border bg-background text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={handleAddToOrder}
              disabled={!selectedVariant || isOutOfStock}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 flex flex-row items-center justify-center px-4 py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isOutOfStock ? "Out of Stock" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
