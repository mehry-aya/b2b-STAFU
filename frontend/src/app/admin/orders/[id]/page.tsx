"use client";

import React, { use, useEffect, useState } from "react";
import { fetchOrderById, updateOrderStatus } from "@/lib/api/orders";
import { Order } from "@/lib/types/order";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Package,
  User as UserIcon,
  ArrowRight,
  Printer,
  MoreVertical,
  Check,
  X,
  Truck as ShippedIcon
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function AdminOrderDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "png" | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const loadOrder = async () => {
    try {
      const data = await fetchOrderById(parseInt(params.id));
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: "paid" | "shipped" | "cancelled") => {
    if (!order) return;
    if (newStatus === "cancelled") {
      setIsCancelDialogOpen(true);
      return;
    }
    await performStatusUpdate(newStatus);
  };

  const performStatusUpdate = async (newStatus: "paid" | "shipped" | "cancelled") => {
    if (!order) return;
    setUpdating(newStatus);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus.replace('_', ' ')}.`,
      });
      await loadOrder();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "An error occurred.",
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
      // The element is hidden but rendered, so we need to ensure it's visible to htmlToImage
      // html-to-image can handle off-screen elements if they are in the DOM
      
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
        title: "Download Started",
        description: `Your invoice is being saved as ${format.toUpperCase()}.`,
      });
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.message || "Failed to generate invoice.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
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
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-zinc-200 rounded-lg" />
      <div className="h-48 bg-white rounded-3xl border border-zinc-100" />
      <div className="h-96 bg-white rounded-3xl border border-zinc-100" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-5xl mx-auto text-center py-20">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Order not found</h2>
      <p className="text-zinc-500 mb-8">{error || "The requested order could not be located."}</p>
      <Link href="/admin/orders" className="text-red-600 font-bold flex items-center justify-center gap-2">
        <ChevronLeft className="h-4 w-4" />
        Back to Orders
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/orders" 
          className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Global List
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => handleDownload("pdf")}
            disabled={!!downloading || !["paid", "shipped"].includes(order.status)}
            title={!["paid", "shipped"].includes(order.status) ? "Invoice available only for Paid or Shipped orders" : ""}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className={`h-3.5 w-3.5 ${downloading === 'pdf' ? 'animate-pulse' : ''}`} />
            {downloading === 'pdf' ? 'Generating PDF...' : 'PDF Invoice'}
          </button>
          <button 
            onClick={() => handleDownload("png")}
            disabled={!!downloading || !["paid", "shipped"].includes(order.status)}
            title={!["paid", "shipped"].includes(order.status) ? "Invoice available only for Paid or Shipped orders" : ""}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className={`h-3.5 w-3.5 ${downloading === 'png' ? 'animate-pulse' : ''}`} />
            {downloading === 'png' ? 'Generating PNG...' : 'PNG Invoice'}
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
                <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Control Panel</span>
                <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-black uppercase">Admin</span>
              </div>
              <h1 className="font-black text-3xl tracking-tighter mb-4 flex items-center gap-4">
                ORDER <span className="text-red-600 italic">#{order.id.toString().padStart(5, '0')}</span>
              </h1>
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
            
            <div className="flex flex-col items-end gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(order.status)} animate-in fade-in zoom-in duration-500`}>
                {getStatusIcon(order.status)}
                {order.status.replace('_', ' ')}
              </div>

              {order.statusChangedByEmail && (
                <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <UserIcon className="w-2.5 h-2.5" />
                    {order.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} by {order.statusChangedByEmail}
                  </p>
                  {order.statusChangedAt && (
                    <p className="text-[8px] font-medium text-zinc-400 mt-0.5 uppercase tracking-tighter">
                      {format(new Date(order.statusChangedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}
              
              {/* Admin Actions */}
              <div className="flex flex-wrap gap-2 justify-end">
                {order.status === "pending_payment" && (
                  <button 
                    onClick={() => handleStatusUpdate("paid")}
                    disabled={!!updating}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {updating === "paid" ? "Marking..." : "Mark as Paid"}
                  </button>
                )}
                {order.status === "paid" && (
                  <button 
                    onClick={() => handleStatusUpdate("shipped")}
                    disabled={!!updating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                  >
                    <ShippedIcon className="h-3.5 w-3.5" />
                    {updating === "shipped" ? "Marking..." : "Mark as Shipped"}
                  </button>
                )}
                {order.status !== "cancelled" && order.status !== "shipped" && (
                  <button 
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={!!updating}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    {updating === "cancelled" ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
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
              Dealer Account
            </h3>
            <div className="space-y-1">
              <p className="font-black text-zinc-900 leading-tight uppercase truncate">{order.dealer?.companyName || "N/A"}</p>
              <p className="text-xs text-zinc-500 font-medium">{order.dealer?.address || "No address provided"}</p>
              <p className="text-[10px] text-zinc-400 font-bold font-mono mt-2">UUID: STF-{order.dealerId}</p>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Package className="h-3 w-3 text-red-500" />
              Fulfillment
            </h3>
            <div className="space-y-1">
              <p className="font-black text-zinc-900 leading-tight uppercase">{order.items.reduce((sum, i) => sum + i.quantity, 0)} TOTAL UNITS</p>
              <p className="text-xs text-zinc-500 font-medium">{order.items.length} SKUs ORDERED</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase py-0.5 px-2 bg-zinc-100 rounded text-zinc-500 tracking-tighter">Standard Shipping</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
              <ShoppingBag className="h-3 w-3 text-red-500" />
              Financials
            </h3>
            <div className="space-y-1">
              <p className="font-black text-3xl text-zinc-900 leading-tight font-mono tracking-tighter">₺{Number(order.totalAmount).toFixed(2)}</p>
              <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest">Settled via B2B Credit</p>
            </div>
          </div>
        </div>

        {/* Itemized List */}
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Inventory Items</h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verify SKUs before shipping</span>
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
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded">SKU: {item.productVariant.sku || "N/A"}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                  <div className="text-xs font-bold text-zinc-400">
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-zinc-900 font-mono">₺{Number(item.unitPrice).toFixed(2)}</span>
                      <span className="text-[10px] text-zinc-400 line-through font-medium">₺{(Number(item.unitPrice) * 2).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className="mx-2 text-zinc-300">×</span>
                      <span className="text-zinc-900 font-mono">{item.quantity}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end mt-1">
                    <div className="text-base font-black text-zinc-900 font-mono tracking-tighter">
                      ₺{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-400 line-through font-bold">
                      ₺{(Number(item.unitPrice) * 2 * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer Area */}
          <div className="p-8 bg-zinc-50/50 flex flex-col items-end gap-2 border-t border-zinc-100">
             <div className="flex items-center gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <span>Grand Total</span>
                <span className="text-2xl font-black text-red-600 font-mono tracking-tighter">₺{Number(order.totalAmount).toFixed(2)}</span>
             </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          title="Cancel Order"
          description="Are you sure you want to cancel this order? This action cannot be undone."
          onConfirm={() => performStatusUpdate("cancelled")}
          confirmText="Cancel Order"
          variant="danger"
        />
    </div>
  );
}
