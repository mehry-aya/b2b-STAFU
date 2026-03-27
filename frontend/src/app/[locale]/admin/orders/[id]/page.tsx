"use client";

import React, { use, useEffect, useState } from "react";
import { fetchOrderById, updateOrderStatus } from "@/lib/api/orders";
import { Order, OrderStatus } from "@/lib/types/order";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Package,
  User as UserIcon,
  ArrowRight,
  Printer,
  MoreVertical,
  Check,
  X,
  Truck as ShippedIcon,
  FileText
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { format, subMonths, isBefore } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PaymentAmountDialog } from "@/components/ui/PaymentAmountDialog";

import { useTranslations, useLocale } from "next-intl";

export default function AdminOrderDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const t = useTranslations("OrderDetail");
  const tErr = useTranslations("Errors");
  const { formatPrice } = useCurrency();
  const locale = useLocale();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "png" | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPaymentAmountDialogOpen, setIsPaymentAmountDialogOpen] = useState(false);
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const loadOrder = async () => {
    try {
      const data = await fetchOrderById(parseInt(params.id));
      if (data?.error) {
        setError(data.error);
        return;
      }
      setOrder(data);
    } catch (err: any) {
      setError(tErr(err.message || "fetchOrdersFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id, tErr]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    if (newStatus === "cancelled") {
      setIsCancelDialogOpen(true);
      return;
    }

    if (newStatus === "first_payment_received") {
      setIsPaymentAmountDialogOpen(true);
      return;
    }

    await performStatusUpdate(newStatus);
  };

  const performStatusUpdate = async (newStatus: OrderStatus, paymentAmount?: number) => {
    if (!order) return;
    setUpdating(newStatus);
    try {
      await updateOrderStatus(order.id, newStatus, paymentAmount);
      toast({
        title: t("statusUpdated"),
        description: t("statusDescription", { status: newStatus.replace('_', ' ') }),
      });
      await loadOrder();
    } catch (err: any) {
      toast({
        title: t("updateFailed"),
        description: tErr(err.message || "updateFailed"),
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleDownload = async (format: "pdf" | "png") => {
    if (!invoiceRef.current || !order) return;
    setDownloading(format);
    
    try {
      const element = invoiceRef.current;
      const fileName = `invoice-order-${order.id}-${new Date().toISOString().split('T')[0]}`;

      if (format === "png") {
        const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, pixelRatio: 3 });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${fileName}.png`;
        link.click();
      } else {
        const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, pixelRatio: 3 });
        const pdf = new jsPDF("p", "mm", "a4");
        
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
      }

      toast({
        title: t("downloadStarted"),
        description: t("downloadDescription", { format: format.toUpperCase() }),
      });
    } catch (err: any) {
      toast({
        title: t("downloadFailed"),
        description: tErr(err.message || "updateFailed"),
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "draft": return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case "pending_first_payment": return "bg-amber-100 text-amber-700 border-amber-200";
      case "first_payment_received": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "received": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "pending_rest_payment": return "bg-purple-100 text-purple-700 border-purple-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <AlertCircle className="h-4 w-4" />;
      case "pending_first_payment": return <CreditCard className="h-4 w-4" />;
      case "first_payment_received": return <CheckCircle2 className="h-4 w-4" />;
      case "paid": return <CheckCircle2 className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "received": return <CheckCircle2 className="h-4 w-4" />;
      case "pending_rest_payment": return <CreditCard className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-zinc-200 rounded-lg" />
      <div className="h-48 bg-white rounded-3xl border border-zinc-100" />
      <div className="h-96 bg-white rounded-3xl border border-zinc-100" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-5xl mx-auto text-center py-20">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-zinc-900 mb-2">{t("orderNotFound")}</h2>
      <p className="text-zinc-500 mb-8">{error || t("orderNotFound")}</p>
      <Link href="/admin/orders" className="text-red-600 font-bold flex items-center justify-center gap-2">
        <ChevronLeft className="h-4 w-4" />
        {t("backToOrders")}
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("backToList") || "Back to List"}
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => handleDownload("pdf")}
            disabled={!!downloading || !["first_payment_received", "shipped", "received", "pending_rest_payment", "paid"].includes(order.status)}
            title={!["first_payment_received", "shipped", "received", "pending_rest_payment", "paid"].includes(order.status) ? t("invoiceNote") : ""}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className={`h-3.5 w-3.5 ${downloading === 'pdf' ? 'animate-pulse' : ''}`} />
            {downloading === 'pdf' ? t("generatingPdf") : t("pdfInvoice")}
          </button>
          <button 
            onClick={() => handleDownload("png")}
            disabled={!!downloading || !["first_payment_received", "shipped", "received", "pending_rest_payment", "paid"].includes(order.status)}
            title={!["first_payment_received", "shipped", "received", "pending_rest_payment", "paid"].includes(order.status) ? t("invoiceNote") : ""}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className={`h-3.5 w-3.5 ${downloading === 'png' ? 'animate-pulse' : ''}`} />
            {downloading === 'png' ? t("generatingPng") : t("pngInvoice")}
          </button>
        </div>
      </div>

        {/* Hidden Invoice Template for Export */}
        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
          <div ref={invoiceRef}>
            <InvoiceTemplate order={order} />
          </div>
        </div>

        {/* Order Hero */}
        <div className="bg-[#0f0f0f] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">{t("controlPanel")}</span>
                <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-black uppercase">{t("admin")}</span>
              </div>
              <h1 className="font-black text-3xl tracking-tighter mb-4 flex items-center gap-4">
                {t("order")} <span className="text-red-600 italic">#{order.id.toString().padStart(5, '0')}</span>
              </h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  {format(new Date(order.createdAt), "MMMM d, yyyy", { locale: locale === 'tr' ? tr : undefined })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  {new Date(order.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(order.status)} animate-in fade-in zoom-in duration-500`}>
                {getStatusIcon(order.status)}
                {order.status.replace('_', ' ')}
              </div>

              {order.statusChangedByEmail && (
                <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <UserIcon className="w-2.5 h-2.5" />
                    {t("performedBy", { status: order.status.replace('_', ' '), email: order.statusChangedByEmail })}
                  </p>
                  {order.statusChangedAt && (
                    <p className="text-[8px] font-medium text-zinc-400 mt-0.5 uppercase tracking-tighter">
                      {format(new Date(order.statusChangedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}
              
              {/* Admin Actions — Step 2: Confirm first payment */}
              {order.status === "pending_first_payment" && (
                <button 
                  onClick={() => handleStatusUpdate("first_payment_received")}
                  disabled={!!updating}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {updating === "first_payment_received" ? t("marking") : t("markAsFirstPaid")}
                </button>
              )}
              {/* Admin Actions — Step 3: Mark as shipped */}
              {order.status === "first_payment_received" && (
                <button 
                  onClick={() => handleStatusUpdate("shipped")}
                  disabled={!!updating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  <ShippedIcon className="h-3.5 w-3.5" />
                  {updating === "shipped" ? t("marking") : t("markAsShipped")}
                </button>
              )}
              {/* Admin Actions — Step 6: Mark as paid */}
              {order.status === "pending_rest_payment" && (
                <button 
                  onClick={() => handleStatusUpdate("paid")}
                  disabled={!!updating}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {updating === "paid" ? t("marking") : t("markAsPaid")}
                </button>
              )}
              {/* Cancel — available for any non-terminal status */}
              {order.status !== "cancelled" && order.status !== "paid" && (
                <button 
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={!!updating}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  {updating === "cancelled" ? t("cancelling") : t("cancelOrder")}
                </button>
              )}
            </div>
          </div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-red-600/5 to-transparent pointer-events-none" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <UserIcon className="h-3 w-3 text-red-500" />
              {t("dealerAccount")}
            </h3>
            <div className="space-y-1">
              <p className="font-black text-zinc-900 leading-tight uppercase truncate">{order.dealer?.companyName || "N/A"}</p>
              <p className="text-xs text-zinc-500 font-medium">{order.dealer?.address || t("noAddress")}</p>
              <p className="text-[10px] text-zinc-400 font-bold font-mono mt-2">UUID: STF-{order.dealerId}</p>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Package className="h-3 w-3 text-red-500" />
              {t("fulfillment")}
            </h3>
            <div className="space-y-1">
              <p className="font-black text-zinc-900 leading-tight uppercase">{t("totalUnits", { count: order.items.reduce((sum, i) => sum + i.quantity, 0) })}</p>
              <p className="text-xs text-zinc-500 font-medium">{t("skusOrdered", { count: order.items.length })}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase py-0.5 px-2 bg-zinc-100 rounded text-zinc-500 tracking-tighter">{t("standardShipping")}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
              <ShoppingBag className="h-3 w-3 text-red-500" />
              {t("financials")}
            </h3>
            <div className="space-y-1">
              <p className="font-black text-3xl text-zinc-900 leading-tight font-mono tracking-tighter">{formatPrice(Number(order.totalAmount))}</p>
            </div>
          </div>
        </div>

        {/* Itemized List */}
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">{t("inventoryItems")}</h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("verifySkus")}</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {order.items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 group hover:bg-zinc-50/50 transition-colors">
                <div className="h-16 w-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-200 shadow-inner">
                  {item.productVariant.imageUrl ? (
                    <img src={item.productVariant.imageUrl} alt={item.productVariant.title} className="h-full w-full object-cover" />
                  ) : item.productVariant.product.images?.[0]?.src ? (
                    <img src={item.productVariant.product.images[0].src} alt={item.productVariant.product.title} className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-zinc-300" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-black text-zinc-900 uppercase tracking-tight truncate leading-none">
                      {item.productVariant.product.title}
                    </h4>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                      {item.productVariant.title}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded">{t("sku")}: {item.productVariant.sku || "N/A"}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                  <div className="text-xs font-bold text-zinc-400">
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-zinc-900 font-mono">{formatPrice(Number(item.unitPrice))}</span>
                      <span className="text-[10px] text-zinc-400 line-through font-medium">{formatPrice(Number(item.unitPrice) * 2)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className="mx-2 text-zinc-300">×</span>
                      <span className="text-zinc-900 font-mono">{item.quantity}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end mt-1">
                    <div className="text-base font-black text-zinc-900 font-mono tracking-tighter">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </div>
                    <div className="text-[10px] text-zinc-400 line-through font-bold">
                      {formatPrice(Number(item.unitPrice) * 2 * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer Area */}
          <div className="p-8 bg-zinc-50/50 flex flex-col items-end gap-3 border-t border-zinc-100">
             <div className="flex items-center gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <span>{t("grandTotal")}</span>
                <span className="text-xl font-black text-zinc-900 font-mono tracking-tighter">{formatPrice(Number(order.totalAmount))}</span>
             </div>
             {order.firstPaymentAmount && (
               <>
                 <div className="flex items-center gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <span>{t("firstAmountReceived")}</span>
                    <span className="text-xl font-black text-emerald-600 font-mono tracking-tighter">{formatPrice(Number(order.firstPaymentAmount))}</span>
                 </div>
                 <div className="h-px w-48 bg-zinc-200 my-1" />
                 <div className="flex items-center gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <span>{t("restToPay")}</span>
                    <span className="text-2xl font-black text-red-600 font-mono tracking-tighter">{formatPrice(Number(order.remainingAmount))}</span>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Order Logs */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-500" />
            {t("notes") || "Order Logs"}
          </h3>
          
          {/* Stale Shipment Alert */}
          {order.status === 'shipped' && isBefore(new Date(order.updatedAt), subMonths(new Date(), 3)) && (
            <div className="mb-6 flex gap-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-pulse">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div className="text-sm font-bold leading-tight">
                {t("staleOrderAlert")}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="space-y-4 font-mono text-zinc-600 text-sm whitespace-pre-wrap">
              {order.notes.split('\n').filter(Boolean).map((note, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-1.5 rounded-full bg-zinc-300" />
                  <p className="flex-1 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          title={t("cancelTitle")}
          description={t("cancelDescription")}
          onConfirm={() => performStatusUpdate("cancelled")}
          confirmText={t("cancelConfirm")}
          variant="danger"
        />

        <PaymentAmountDialog
          isOpen={isPaymentAmountDialogOpen}
          onOpenChange={setIsPaymentAmountDialogOpen}
          maxAmount={Number(order.totalAmount)}
          onConfirm={(amount) => performStatusUpdate("first_payment_received", amount)}
        />
    </div>
  );
}
