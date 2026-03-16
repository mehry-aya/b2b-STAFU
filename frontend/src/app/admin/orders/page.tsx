"use client";

import React, { useEffect, useState } from "react";
import { getOrdersAction, getAuthToken } from "@/app/(auth)/actions";
import { Order } from "@/lib/types/order";
import { 
  ShoppingBag, 
  Calendar, 
  Eye, 
  AlertCircle, 
  Search,
  Filter,
  Download
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/ui/DashboardHeader";
import { Pagination } from "@/components/ui/Pagination";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const pageSize = 10;
  const { toast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getOrdersAction(page, pageSize);
      if (result.data) {
        setOrders(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalCount(result.data.total);
      } else {
        setError(result.error || "Failed to load orders");
      }
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
      case "draft": return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case "pending_payment": return "bg-amber-100 text-amber-700 border-amber-200";
      case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchQuery) || 
      order.dealer?.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <DashboardHeader
        title="Order Control"
        subtitle="Monitor and manage orders from all dealers. Update statuses, track fulfillment, and handle payments."
        icon={ShoppingBag}
        breadcrumbs={[
          { label: "Admin Console" }
        ]}
        roleBadge={{ label: "Admin", type: "admin" }}
      />

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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">From</span>
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-700 outline-none w-28"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">To</span>
                <input 
                  type="date" 
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-700 outline-none w-28"
                />
              </div>
            </div>

            <button 
              onClick={async () => {
                setExporting(true);
                try {
                  const token = await getAuthToken();
                  if (!token) throw new Error("Authentication token not found.");

                  const queryParams = new URLSearchParams();
                  if (dateFrom) queryParams.append("startDate", dateFrom);
                  if (dateTo) queryParams.append("endDate", dateTo);
                  if (statusFilter !== "all") queryParams.append("status", statusFilter);

                  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/export/excel?${queryParams.toString()}`;

                  const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                  });

                  if (!response.ok) throw new Error("Failed to export orders.");

                  const blob = await response.blob();
                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = `orders-export-${new Date().toISOString().split('T')[0]}.xlsx`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(downloadUrl);

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
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50 h-9"
            >
              <Download className={`h-3.5 w-3.5 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export (xlsx)'}
            </button>
            <div className="h-6 w-px bg-zinc-200 mx-2" />
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none flex items-center gap-2 pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/50"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="h-6 w-px bg-zinc-200 mx-2" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{totalCount} Orders</span>
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
