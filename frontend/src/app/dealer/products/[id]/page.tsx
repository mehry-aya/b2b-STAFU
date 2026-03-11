"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/types/product";
import { fetchProductById } from "@/lib/api/products";
import {
  ChevronLeft,
  ChevronDown,
  ShoppingCart,
  Package,
  Hash,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string | null;
  }>({
    option1: null,
    option2: null,
    option3: null,
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [descOpen, setDescOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(params.id);
        setProduct(data);
        if (data.images?.[0]?.src) setActiveImage(data.images[0].src);
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
    value: string
  ) => {
    setSelectedOptions((prev) => ({ ...prev, [optionKey]: value }));
  };

  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find(
        (v) =>
          v.option1 === selectedOptions.option1 &&
          v.option2 === selectedOptions.option2 &&
          v.option3 === selectedOptions.option3
      ) || null
    );
  }, [product, selectedOptions]);

  const availableOptions = useMemo(() => {
    if (!product?.variants) return { option1: [], option2: [], option3: [] };
    return {
      option1: Array.from(new Set(product.variants.map((v) => v.option1).filter(Boolean))),
      option2: Array.from(new Set(product.variants.map((v) => v.option2).filter(Boolean))),
      option3: Array.from(new Set(product.variants.map((v) => v.option3).filter(Boolean))),
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
      title: "Added to Order",
      description: `${quantity}x ${product?.title} (${selectedVariant.title || "Default Variant"}) added.`,
    });
  };

  /* ─── Loading skeleton ───────────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-zinc-100 w-32 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-zinc-100 rounded-2xl" />
          <div className="space-y-5">
            <div className="h-4 bg-zinc-100 rounded w-1/3" />
            <div className="h-8 bg-zinc-100 rounded w-3/4" />
            <div className="h-10 bg-zinc-100 rounded w-1/4" />
            <div className="h-px bg-zinc-100 my-4" />
            <div className="h-24 bg-zinc-100 rounded" />
            <div className="h-12 bg-zinc-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error state ────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <XCircle className="h-12 w-12 text-red-300" />
        <h2 className="text-lg font-bold text-zinc-900">Product Not Found</h2>
        <p className="text-sm text-zinc-500">{error || "This product could not be loaded."}</p>
        <button
          onClick={() => router.push("/dealer/products")}
          className="mt-2 flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </button>
      </div>
    );
  }

  const displayImage = activeImage || selectedVariant?.imageUrl || product.images?.[0]?.src;
  const isOutOfStock = selectedVariant ? (selectedVariant.inventoryQuantity || 0) <= 0 : true;
  const price = selectedVariant?.price ? parseFloat(selectedVariant.price).toFixed(2) : null;

  // Option label names (use productOptions if available, otherwise fallback)
  const optionLabels = (product as any).options?.map((o: any) => o.name) || ["Option 1", "Option 2", "Option 3"];

  const optionPairs: [string, string[], "option1" | "option2" | "option3"][] = [
    [optionLabels[0] || "Option 1", availableOptions.option1 as string[], "option1"],
    [optionLabels[1] || "Option 2", availableOptions.option2 as string[], "option2"],
    [optionLabels[2] || "Option 3", availableOptions.option3 as string[], "option3"],
  ].filter(([, vals]) => (vals as string[]).length > 0) as any;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Back link */}
      <button
        onClick={() => router.push("/dealer/products")}
        className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors mb-8"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* ── Left: Image gallery ─────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative w-full aspect-square bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-300">
                <Package className="h-14 w-14 mb-2" />
                <span className="text-sm font-medium">No Image</span>
              </div>
            )}
            {/* Red price stamp */}
            {price && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-black px-3 py-1.5 rounded-xl shadow-lg">
                ${price}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.src)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                    activeImage === img.src
                      ? "border-red-500 shadow-md shadow-red-100"
                      : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <img
                    src={img.src}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Info & actions ───────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Vendor + title */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5">
              {product.vendor || "Brand"}
            </p>
            <h1 className="text-2xl font-black text-zinc-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Price */}
          <div>
            {price ? (
              <span className="text-3xl font-black text-zinc-900">${price}</span>
            ) : (
              <span className="text-base text-zinc-400 font-medium">Price unavailable</span>
            )}
          </div>


          {/* Options */}

          {/* Variant meta */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-2.5">
            {selectedVariant ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-zinc-500">SKU:</span>
                  <span className="font-semibold text-zinc-800 font-mono text-xs">
                    {selectedVariant.sku || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isOutOfStock ? (
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  <span className="text-zinc-500">Stock:</span>
                  <span
                    className={`font-semibold ${
                      isOutOfStock ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {selectedVariant.inventoryQuantity || 0} available
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                <Layers className="h-4 w-4" />
                This combination is not available
              </div>
            )}
          </div>
  {optionPairs.length > 0 && (
            <div className="space-y-5">
              {optionPairs.map(([label, values, key]) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                    {label}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val: string) => {
                      const isSelected = selectedOptions[key] === val;
                      // Check if ALL variants containing this option value are out of stock
                      const isValueOutOfStock = product?.variants
                        ? product.variants
                            .filter((v: any) => v[key] === val)
                            .every((v: any) => (v.inventoryQuantity || 0) <= 0)
                        : false;
                      return (
                        <button
                          key={val}
                          onClick={() => !isValueOutOfStock && handleOptionChange(key, val)}
                          disabled={isValueOutOfStock}
                          className={`relative px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                            isValueOutOfStock
                              ? "border-zinc-100 text-zinc-300 cursor-not-allowed bg-zinc-50"
                              : isSelected
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                              : "border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                          }`}
                        >
                          {val}
                          {/* Diagonal strikethrough for out-of-stock */}
                          {isValueOutOfStock && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                            >
                              <svg
                                className="absolute inset-0 w-full h-full"
                                preserveAspectRatio="none"
                              >
                                <line
                                  x1="0%"
                                  y1="100%"
                                  x2="100%"
                                  y2="0%"
                                  stroke="#dc2626"
                                  strokeWidth="1.5"
                                  strokeOpacity="0.45"
                                />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Qty + Add to Order */}
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center px-3 py-3 rounded-xl border-2 border-zinc-200 bg-white text-zinc-900 font-bold text-sm focus:outline-none focus:border-zinc-900 transition-colors"
            />
            <button
              onClick={handleAddToOrder}
              disabled={!selectedVariant || isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-150 ${
                !selectedVariant || isOutOfStock
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Description — now below the images and info section */}
      {product.description && (
        <div className="mt-12 pt-12 border-t border-zinc-100">
          <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-6">
            Product Details
          </h2>
          <div className="relative">
            <div
              className={`overflow-hidden transition-all duration-300 ${
                descOpen ? "max-h-[5000px]" : "max-h-48"
              }`}
            >
              <div
                className="text-base text-zinc-600 leading-relaxed prose prose-sm max-w-none prose-p:my-3 prose-strong:text-zinc-900 prose-headings:text-zinc-900"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
            {/* Fade overlay — only when collapsed */}
            {!descOpen && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent pointer-events-none" />
            )}
          </div>
          <button
            onClick={() => setDescOpen((o) => !o)}
            className="mt-4 text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
          >
            {descOpen ? (
              <>
                <ChevronDown className="h-4 w-4 rotate-180" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Read full description
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
