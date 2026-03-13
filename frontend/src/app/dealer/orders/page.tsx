"use client";

import { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/api/orders";
import { Order } from "@/lib/types/order";
import { ShoppingBag, Calendar, Clock, Eye, CreditCard, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/Pagination";

export default function DealerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchOrders(page, pageSize);
      setOrders(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case "pending_payment":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <AlertCircle className="h-3 w-3" />;
      case "pending_payment": return <CreditCard className="h-3 w-3" />;
      case "paid": return <CheckCircle2 className="h-3 w-3" />;
      case "shipped": return <Truck className="h-3 w-3" />;
      case "cancelled": return <AlertCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-zinc-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
            <ShoppingBag className="h-3 w-3" />
            History
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            MY <span className="text-red-600 italic">ORDERS</span>
          </h1>
          <p className="text-zinc-400 max-w-md text-sm md:text-base leading-relaxed font-medium">
            Track your orders, manage payments, and view historical purchase data.
          </p>
        </div>
        {/* Decorative element */}
        <div className="absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-red-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Filters/Stats could go here */}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-zinc-100" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-16 text-center shadow-sm">
          <div className="p-4 bg-zinc-50 rounded-full w-fit mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-zinc-300" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">No orders found</h2>
          <p className="text-zinc-500 mb-8 max-w-xs mx-auto text-sm">You haven't placed any orders yet. Head over to the catalog to start browsing.</p>
          <Link href="/dealer/products" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-black text-zinc-900">#{order.id.toString().padStart(5, '0')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                          <Clock className="h-3 w-3" />
                          {format(new Date(order.createdAt), "h:mm a")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-zinc-900">₺{Number(order.totalAmount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/dealer/orders/${order.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all group-hover:shadow-md"
                      >
                        <Eye className="h-3 w-3" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            itemsLabel="orders"
          />
        </div>
      )}
    </div>
  );
}
