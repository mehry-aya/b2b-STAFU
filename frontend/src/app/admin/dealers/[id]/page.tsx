"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { getDealerDetailAction, approveDealerAction } from "@/app/(auth)/actions";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/components/ui/DashboardHeader";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function DealerDetailPage() {
  const { id } = useParams();
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");
  const baseUrl = isMaster ? "/master" : "/admin";

  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDealer() {
      setLoading(true);
      const result = await getDealerDetailAction(Number(id));
      if (result.dealer) {
        setDealer(result.dealer);
      } else {
        setError(result.error || "Failed to load dealer details");
      }
      setLoading(false);
    }
    if (id) fetchDealer();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    if (status === "suspended") {
      setPendingStatus(status);
      setIsConfirmDialogOpen(true);
      return;
    }
    await performStatusUpdate(status);
  };

  const performStatusUpdate = async (status: string) => {
    setUpdating(true);
    const result = await approveDealerAction(Number(id), status);
    if (result.success) {
      setDealer({ ...dealer, contractStatus: status });
    } else {
      alert(result.error || "Failed to update status");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-600">
        <h2 className="text-lg font-bold">Error</h2>
        <p>{error || "Dealer not found"}</p>
        <Link href={`${baseUrl}/dealers`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <DashboardHeader
        title={dealer.companyName}
        subtitle={`Managing account for ${dealer.companyName}`}
        icon={Building2}
        breadcrumbs={[
          { label: isMaster ? "Master" : "Admin", href: isMaster ? "/master/dashboard" : "/admin/dashboard" },
          { label: "Dealers", href: `${baseUrl}/dealers` },
          { label: dealer.companyName }
        ]}
        roleBadge={isMaster ? { label: "Master", type: "master" } : { label: "Admin", type: "admin" }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dealer Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Business Profile</h3>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                dealer.contractStatus === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                dealer.contractStatus === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                "bg-red-50 text-red-600 border-red-100"
              }`}>
                {dealer.contractStatus}
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Company</p>
                    <p className="text-sm font-bold text-zinc-900">{dealer.companyName}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">{dealer.user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                    <p className="text-sm font-bold text-zinc-900">{dealer.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Location</p>
                    <p className="text-sm font-bold text-zinc-900 leading-relaxed">{dealer.address || "No address provided"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex flex-col gap-2">
                <button
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={updating || dealer.contractStatus === "approved"}
                  className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Dealer
                </button>
                <button
                   onClick={() => handleStatusUpdate("suspended")}
                   disabled={updating || dealer.contractStatus === "suspended"}
                   className="w-full py-3 px-4 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Suspend Account
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Account Metadata</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-medium text-zinc-500 mb-1">Member Since</p>
                <p className="text-xs font-bold text-zinc-900">{format(new Date(dealer.createdAt), 'MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-[9px] font-medium text-zinc-500 mb-1">Account ID</p>
                <p className="text-xs font-bold text-zinc-900">#{dealer.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Orders & Documents */}
        <div className="lg:col-span-2 space-y-8">
          {/* Orders Section */}
          <section className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Recent Orders</h3>
              <Link href={`${baseUrl}/orders?dealerId=${dealer.id}`} className="text-xs font-bold text-red-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              {dealer.orders && dealer.orders.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-200">
                      <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order ID</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {dealer.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-zinc-900">#{order.id}</td>
                        <td className="px-6 py-4 text-xs text-zinc-500">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4 text-xs font-bold text-zinc-900">€{Number(order.totalAmount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="inline-flex p-3 bg-zinc-50 rounded-2xl text-zinc-300 mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400">No orders found for this dealer.</p>
                </div>
              )}
            </div>
          </section>

          {/* Documents Section */}
          <section className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Documents & Contracts</h3>
            </div>
            <div className="p-6">
              {dealer.contractUrl ? (
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-red-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white border border-zinc-200 rounded-xl text-red-600 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Partnership Agreement</p>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">PDF Document</p>
                    </div>
                  </div>
                  <a 
                    href={`http://localhost:3001${dealer.contractUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    View Document
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  <p className="text-xs font-medium text-zinc-400 italic">No contracts uploaded yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Suspend Account"
        description="Are you sure you want to suspend this dealer account? They will lose access to the platform until reactivated."
        onConfirm={() => pendingStatus && performStatusUpdate(pendingStatus)}
        confirmText="Suspend"
        variant="danger"
      />
    </div>
  );
}
