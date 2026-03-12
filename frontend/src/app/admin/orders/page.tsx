"use client";

import React, { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/api/orders"; // Admin can see all orders
import { Order } from "@/lib/types/order";
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  Eye, 
  CreditCard, 
  Truck, 
  AlertCircle, 
  CheckCircle2,
  Users,
  Search,
  Filter,
  Download
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { exportOrdersToExcel } from "@/lib/api/orders";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

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

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchQuery) || 
    order.dealer?.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0f0f0f] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-widest">
              Global Management
            </div>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
              Admin
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            ORDER <span className="text-red-600 italic">CONTROL</span>
          </h1>
          <p className="text-zinc-400 max-w-md text-sm md:text-base leading-relaxed font-medium">
            Monitor and manage orders from all dealers. Update statuses, track fulfillment, and handle payments.
          </p>
        </div>
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-red-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Dealer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/50 transition-all"
            />
         </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                setExporting(true);
                try {
                  const blob = await exportOrdersToExcel();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `orders-export-${new Date().toISOString().split('T')[0]}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast({
                    title: "Export Successful",
                    description: "Your order export is ready and downloading.",
                  });
                } catch (err: any) {
                  toast({
                    title: "Export Failed",
                    description: err.message || "Failed to export orders.",
                    variant: "destructive",
                  });
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              <Download className={`h-3.5 w-3.5 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </button>
            <div className="h-6 w-px bg-zinc-200 mx-2" />
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </button>
            <div className="h-6 w-px bg-zinc-200 mx-2" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filteredOrders.length} Orders</span>
          </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white border border-zinc-100 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-red-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Order</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Dealer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-black text-zinc-900">#{order.id.toString().padStart(5, '0')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                          {order.dealer?.companyName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 leading-none uppercase truncate max-w-[150px]">
                            {order.dealer?.companyName}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold font-mono mt-1">ID: STF-{order.dealerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-zinc-900">₺{Number(order.totalAmount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all group-hover:shadow-md"
                      >
                        <Eye className="h-3 w-3" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
               <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No matching orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
