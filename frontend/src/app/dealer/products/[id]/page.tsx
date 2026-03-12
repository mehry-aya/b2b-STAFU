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
import { useCart } from "@/context/CartContext";

export default function DealerProductDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCart();

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
          // Find first in-stock variant, or fallback to first variant
          const firstInStock = data.variants.find((v: any) => (v.inventoryQuantity || 0) > 0) || data.variants[0];
          setSelectedOptions({
            option1: firstInStock.option1,
            option2: firstInStock.option2,
            option3: firstInStock.option3,
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
    if (!selectedVariant || !product) {
      toast({
        title: "Cannot Add to Order",
        description: "Please select a valid combination of options.",
        variant: "destructive",
      });
      return;
    }

    const stock = selectedVariant.inventoryQuantity || 0;
    if (quantity > stock) {
      toast({
        title: "Limited Stock",
        description: `Only ${stock} units available. Adjusting quantity to max stock.`,
        variant: "destructive",
      });
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      variantTitle: selectedVariant.title || "Default",
      price: Number(selectedVariant.price) || 0,
      quantity: quantity,
      inventoryQuantity: stock,
      imageUrl: selectedVariant.imageUrl || product.images?.[0]?.src,
    });

    toast({
      title: "Added to Order",
      description: `${quantity}x ${product?.title} (${selectedVariant.title || "Default Variant"}) added to your cart.`,
    });
  };

  const displayImage = activeImage || selectedVariant?.imageUrl || product?.images?.[0]?.src;
  const isOutOfStock = selectedVariant ? (selectedVariant.inventoryQuantity || 0) <= 0 : true;
  const price = selectedVariant?.price ? parseFloat(selectedVariant.price).toFixed(2) : null;

  // Option labels from the database (e.g., ["Size", "Color"])
  const optionLabels = useMemo(() => {
    if (product?.options && product.options.length > 0) {
      return product.options.map((opt: any) => opt.name);
    }
    
    // Manual detection fallback if sync haven't been run or labels are generic
    const detectLabel = (vals: (string | null)[], fallback: string) => {
      const validVals = vals.filter(Boolean) as string[];
      if (!validVals || validVals.length === 0) return fallback;
      const sizeList = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'XS-S', 'M-L', 'XL-2XL'];
      const hasSize = validVals.some(v => sizeList.includes(v.toUpperCase()));
      if (hasSize) return "Size";
      
      // If it looks like a color name (just a guess)
      return fallback;
    };

    return [
      detectLabel(availableOptions.option1, "Option 1"),
      detectLabel(availableOptions.option2, "Option 2"),
      detectLabel(availableOptions.option3, "Option 3"),
    ];
  }, [product, availableOptions]);

  const optionPairs = useMemo(() => {
    const pairs: [string, string[], "option1" | "option2" | "option3"][] = [
      [optionLabels[0] || "Option 1", availableOptions.option1 as string[], "option1"],
      [optionLabels[1] || "Option 2", availableOptions.option2 as string[], "option2"],
      [optionLabels[2] || "Option 3", availableOptions.option3 as string[], "option3"],
    ];
    
    // Filter out pairs that are empty OR just "Default Title"
    return pairs.filter(([, vals]) => 
      vals.length > 0 && 
      !(vals.length === 1 && (vals[0] === "Default Title" || vals[0] === "Default"))
    );
  }, [optionLabels, availableOptions]);

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
                ₺{price}
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
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border transition-all duration-150 ${
                    activeImage === img.src
                      ? "border-gray-500 shadow-md shadow-gray-100"
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
        <div className="flex flex-col gap-6">
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
              <span className="text-3xl font-black text-zinc-900">₺{price}</span>
            ) : (
              <span className="text-base text-zinc-400 font-medium">Price unavailable</span>
            )}
          </div>

          {/* Related Products (Other Colors) */}
          {(product.relatedProducts && product.relatedProducts.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                  Color
                </label>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {product.title.split(' - ')[1] || "Current"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Current Product Swatch */}
                <div className="p-0.5 rounded-full border border-gray-600 shadow-md shadow-red-100">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
                    <img
                      src={product.images?.[0]?.src}
                      alt="Current color"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Other Colors */}
                {product.relatedProducts.map((rp) => {
                  const colorName = rp.title.split(' - ')[1] || "Other";
                  return (
                    <button
                      key={rp.id}
                      onClick={() => router.push(`/dealer/products/${rp.id}`)}
                      title={colorName}
                      className="p-0.5 rounded-full border-2 border-transparent hover:border-zinc-300 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 grayscale-[0.2] hover:grayscale-0 transition-all">
                        <img
                          src={rp.images?.[0]?.src}
                          alt={colorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Options Selection */}
          {optionPairs.length > 0 && (
            <div className="space-y-6">
              {optionPairs.map(([label, values, key]) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                      {label}
                    </label>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {selectedOptions[key] || "Select one"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val: string) => {
                      const isSelected = selectedOptions[key] === val;
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
                          className={`relative px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                            isValueOutOfStock
                              ? "border-zinc-100 text-zinc-300 cursor-not-allowed bg-zinc-50"
                              : isSelected
                              ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-100"
                              : "border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                          }`}
                        >
                          {val}
                          {isValueOutOfStock && (
                            <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-20">
                              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                <line x1="0%" y1="100%" x2="100%" y2="0%" stroke="currentColor" strokeWidth="2" />
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

          {/* Variant meta */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-3">
            {selectedVariant ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-zinc-500">SKU:</span>
                  </div>
                  <span className="font-bold text-zinc-900 font-mono text-xs bg-white px-2 py-0.5 rounded border border-zinc-200">
                    {selectedVariant.sku || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isOutOfStock ? (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    <span className="text-zinc-500">Availability:</span>
                  </div>
                  <span
                    className={`font-bold ${
                      isOutOfStock ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : `${selectedVariant.inventoryQuantity || 0} in stock`}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-600 font-bold justify-center py-2">
                <Layers className="h-4 w-4" />
                Select all options to see availability
              </div>
            )}
          </div>

          {/* Qty + Add to Order */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Qty</span>
              <input
                type="number"
                min="1"
                max={selectedVariant?.inventoryQuantity || 1}
                value={quantity}
                onChange={(e) => {
                  const maxStock = selectedVariant?.inventoryQuantity || 1;
                  setQuantity(Math.min(maxStock, Math.max(1, parseInt(e.target.value) || 1)));
                }}
                className="w-20 text-center px-3 py-3 rounded-xl border-2 border-zinc-200 bg-white text-zinc-900 font-bold text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase opacity-0">Action</span>
              <button
                onClick={handleAddToOrder}
                disabled={!selectedVariant || isOutOfStock}
                className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  !selectedVariant || isOutOfStock
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Add to Order"}
              </button>
            </div>
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
