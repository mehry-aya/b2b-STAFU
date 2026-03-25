"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { createOrder } from "@/lib/api/orders";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import { useTranslations } from "next-intl";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, totalAmount, totalItems, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const t = useTranslations("Cart");
  const tErr = useTranslations("Errors");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));
      
      const result = await createOrder(orderItems);
      
      if (result.error) {
        toast({
          title: t("checkoutFailed"),
          description: tErr(result.error),
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: t("orderCreated"),
        description: t("orderCreatedDesc", { id: result.id }),
      });
      
      clearCart();
      onClose();
      router.push(`/dealer/orders/${result.id}`);
    } catch (error: any) {
      toast({
        title: t("checkoutFailed"),
        description: "An error occurred while creating your order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-101 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold">{t("title")}</h2>
            <span className="bg-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
              {t("items", { count: totalItems })}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-zinc-50 rounded-full">
                <ShoppingBag className="h-10 w-10 text-zinc-300" />
              </div>
              <div>
                <p className="text-zinc-500 font-medium">{t("empty")}</p>
                <button 
                  onClick={onClose}
                  className="mt-2 text-sm font-bold text-red-600 hover:text-red-700"
                >
                  {t("continueShopping")}
                </button>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-4 group">
                <div className="h-20 w-20 bg-zinc-50 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-zinc-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 truncate uppercase tracking-tight">
                      {item.title}
                    </h3>
                    <button 
                      onClick={() => removeItem(item.variantId)}
                      className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mb-3">
                    {item.variantTitle}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-zinc-50 transition-colors text-zinc-500"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-zinc-900 min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.inventoryQuantity}
                        className="px-2 py-1 hover:bg-zinc-50 transition-colors text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-black text-zinc-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{t("subtotal")}</span>
              <span className="text-2xl font-black text-zinc-900">{formatPrice(totalAmount)}</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
              {t("shippingTaxesNote")}
            </p>
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                isSubmitting 
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed" 
                : "bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {isSubmitting ? t("creatingOrder") : t("checkout")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
