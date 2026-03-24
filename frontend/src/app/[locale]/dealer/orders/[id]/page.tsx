"use client";

import { useEffect, useState, use } from "react";
import { fetchOrderById, updateOrderStatus } from "@/lib/api/orders";
import { Order } from "@/lib/types/order";
import { 
  ChevronLeft, 
  Calendar, 
  Package, 
  CreditCard, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Download,
  AlertTriangle,
  X,
  Clock, 
  ShoppingBag, 
  User,
  ArrowRight,
  Printer,
  Truck as ShippedIcon
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useTranslations, useLocale } from "next-intl";

export default function DealerOrderDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const t = useTranslations("OrderDetail");
  const tErr = useTranslations("Errors");
  const router = useRouter();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadOrder = async () => {
    try {
      const result = await fetchOrderById(parseInt(params.id));
      if (result && result.error) {
        setError(result.error);
      } else if (result) {
        setOrder(result);
      } else {
        setError(tErr("fetchOrdersFailed"));
      }
    } catch (err: any) {
      setError(err.message || tErr("fetchOrdersFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleSubmitForPayment = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      const result = await updateOrderStatus(order.id, "pending_payment");
      if (result && result.error) {
        toast({
          title: "Submission Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order Submitted",
          description: "Your order has been submitted for payment processing.",
        });
        await loadOrder(); // Refresh data
      }
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "draft": return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case "pending_payment": return "bg-amber-100 text-amber-700 border-amber-200";
      case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <AlertCircle className="h-4 w-4" />;
      case "pending_payment": return <CreditCard className="h-4 w-4" />;
      case "paid": return <CheckCircle2 className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-zinc-200 rounded-lg" />
      <div className="h-48 bg-white rounded-3xl border border-zinc-100" />
      <div className="h-96 bg-white rounded-3xl border border-zinc-100" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Order not found</h2>
      <p className="text-zinc-500 mb-8">{error || "The requested order could not be located."}</p>
      <Link href="/dealer/orders" className="text-red-600 font-bold flex items-center justify-center gap-2">
        <ChevronLeft className="h-4 w-4" />
        Back to Orders
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("backToHistory") || "Back to History"}
        </button>
        <button 
          disabled={!["paid", "shipped"].includes(order.status)}
          title={!["paid", "shipped"].includes(order.status) ? t("invoiceNote") : ""}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="h-3.5 w-3.5" />
          {t("printInvoice") || "Print Invoice"}
        </button>
      </div>

        {/* Order Hero */}
        <div className="bg-zinc-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-zinc-500 font-mono text-sm">Order ID:</span>
                <span className="font-black text-xl tracking-tighter">#{order.id.toString().padStart(5, '0')}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  {format(new Date(order.createdAt), "MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  {format(new Date(order.createdAt), "h:mm a")}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(order.status)} animate-in fade-in zoom-in duration-500`}>
                {getStatusIcon(order.status)}
                {order.status.replace('_', ' ')}
              </div>
              {order.status === "draft" && (
                <button 
                  onClick={handleSubmitForPayment}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? "Processing..." : (
                    <>
                      Submit for Payment
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-red-600/5 to-transparent pointer-events-none" />
        </div>

        {/* Order Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <User className="h-3 w-3 text-red-500" />
              Dealer Information
            </h3>
            <div className="space-y-1">
              <p className="font-black text-zinc-900 leading-tight uppercase truncate">{order.dealer?.companyName || "N/A"}</p>
              <p className="text-xs text-zinc-500 font-medium font-mono">ID: STF-{order.dealerId.toString().padStart(4, '0')}</p>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Package className="h-3 w-3 text-red-500" />
              Total Items
            </h3>
            <div className="space-y-1">
              <p className="font-black text-zinc-900 leading-tight uppercase font-mono">{order.items.reduce((sum, i) => sum + i.quantity, 0)} UNITS</p>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-tight">{order.items.length} UNIQUE VARIANTS</p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-800">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-3 w-3 text-red-500" />
              Order Total
            </h3>
            <div className="space-y-1">
              <p className="font-black text-3xl text-white leading-tight font-mono tracking-tighter">{formatPrice(order.totalAmount)}</p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Includes Tax & Fees</p>
            </div>
          </div>
        </div>

        {/* Itemized List */}
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Itemized Breakdown</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {order.items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 group hover:bg-zinc-50/50 transition-colors">
                <div className="h-20 w-20 bg-zinc-100 rounded-2xl overflow-hidden shrink-0 border border-zinc-200 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  {item.productVariant.imageUrl ? (
                    <img src={item.productVariant.imageUrl} alt={item.productVariant.title} className="h-full w-full object-cover" />
                  ) : item.productVariant.product.images?.[0]?.src ? (
                    <img src={item.productVariant.product.images[0].src} alt={item.productVariant.product.title} className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-zinc-300" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-black text-zinc-900 uppercase tracking-tight truncate leading-none">
                      {item.productVariant.product.title}
                    </h4>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="text-zinc-300">|</span>
                      {item.productVariant.title}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest font-mono">
                    <span className="px-2 py-1 bg-zinc-100 rounded text-zinc-500 whitespace-nowrap">SKU: {item.productVariant.sku || "N/A"}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div className="text-xs font-bold text-zinc-400">
                    <span className="text-zinc-900 font-mono">{formatPrice(item.unitPrice)}</span>
                    <span className="mx-2">×</span>
                    <span className="text-zinc-900 font-mono">{item.quantity}</span>
                  </div>
                  <div className="text-lg font-black text-zinc-900 font-mono tracking-tighter">
                    {formatPrice(Number(item.unitPrice) * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer Area */}
          <div className="p-8 bg-zinc-50 flex flex-col items-end gap-2">
             <div className="flex items-center gap-8 text-sm">
                <span className="font-bold text-zinc-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-black text-zinc-900 font-mono">{formatPrice(order.totalAmount)}</span>
             </div>
             <div className="flex items-center gap-8 text-sm">
                <span className="font-bold text-zinc-400 uppercase tracking-widest">Shipping</span>
                <span className="font-bold text-emerald-600 uppercase tracking-widest">Calculated</span>
             </div>
             <div className="h-px w-48 bg-zinc-200 my-2" />
             <div className="flex items-center gap-8 text-xl">
                <span className="font-black text-zinc-900 uppercase tracking-tighter">Total Amount</span>
                <span className="font-black text-red-600 font-mono tracking-tighter">{formatPrice(order.totalAmount)}</span>
             </div>
          </div>
      </div>
    </div>
  );
}
