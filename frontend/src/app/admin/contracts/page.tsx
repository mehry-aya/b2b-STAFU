"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Eye, 
  ExternalLink,
  ChevronRight,
  User,
  Calendar,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { getAdminContractsAction, reviewContractAction } from "@/app/(auth)/actions";

interface Contract {
  id: number;
  dealerId: number;
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  type: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  dealer: {
    companyName: string;
  };
}

export default function AdminContractsPage() {
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processingReview, setProcessingReview] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      const result = await getAdminContractsAction(statusFilter === "all" ? undefined : statusFilter);
      if (result.error) throw new Error(result.error);
      setContracts(result.data || []);
    } catch (error) {
      toast.error("Failed to load contracts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedContract) return;
    
    setProcessingReview(true);
    try {
      const result = await reviewContractAction(
        selectedContract.id,
        status,
        reviewNotes
      );

      if (result.error) throw new Error(result.error);

      toast.success(`Contract ${status} successfully`);
      setSelectedContract(null);
      setReviewNotes("");
      fetchContracts();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      setProcessingReview(false);
    }
  };

  const filteredContracts = contracts.filter(c => 
    c.dealer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 px-10 py-12 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.08]" style={{ 
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px" 
        }} />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Compliance Engine
              </span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
              {isMaster ? "Master Contracts" : "Contract Control"}
            </h1>
            <p className="text-zinc-400 text-sm mt-3 font-medium tracking-wide max-w-xl">
              REVIEW AND MANAGE DEALER TRADING AGREEMENTS. ENSURE COMPLIANCE AND DOCUMENTATION STANDARDS ARE MET.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Pending Review</p>
              <p className="text-3xl font-black text-amber-500">{contracts.filter(c => c.status === "pending").length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Documents</p>
              <p className="text-3xl font-black text-white">{contracts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main List Section */}
        <div className={`flex-1 space-y-6 transition-all duration-500 ${selectedContract ? "lg:w-3/5" : "w-full"}`}>
          {/* Controls */}
          <div className="bg-white rounded-4xl border border-zinc-200 p-4 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search by dealer or file name..."
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select 
                className="bg-zinc-50 border-none rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all text-zinc-400">Status: All</option>
                <option value="pending">Status: Pending</option>
                <option value="approved">Status: Approved</option>
                <option value="rejected">Status: Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Dealer</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">File</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Uploaded</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hydrating Compliance Data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 py-10 opacity-30">
                          <FileText className="w-16 h-16 text-zinc-400" />
                          <p className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">No contracts found matching criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((contract) => (
                      <tr 
                        key={contract.id} 
                        className={`group cursor-pointer transition-all duration-300 ${
                          selectedContract?.id === contract.id ? "bg-blue-50/50" : "hover:bg-zinc-50/70"
                        }`}
                        onClick={() => setSelectedContract(contract)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                              <User className="w-5 h-5" />
                            </div>
                            <p className="font-black text-zinc-900 uppercase tracking-tight truncate max-w-[150px]">
                              {contract.dealer.companyName}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-zinc-400" />
                            <p className="font-bold text-zinc-600 truncate max-w-[180px]">{contract.fileName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-zinc-500 uppercase">
                            {format(new Date(contract.createdAt), "MMM dd, yyyy")}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className={`
                            inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest
                            ${getStatusStyles(contract.status)}
                          `}>
                            {contract.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> : contract.status === "rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {contract.status}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2.5 rounded-xl bg-zinc-100 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all duration-300">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Review Pane */}
        {selectedContract && (
          <div className="lg:w-2/5 w-full bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden sticky top-8 animate-in slide-in-from-right-8 duration-500">
            {/* Review Title */}
            <div className="bg-zinc-950 px-8 py-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3 text-white">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none">Review Document</h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Contract ID: DOC-{selectedContract.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedContract(null)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-500 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            {/* Preview Area */}
            <div className="aspect-4/5 bg-zinc-100 relative group overflow-hidden">
              <iframe 
                src={selectedContract.fileUrl} 
                className="w-full h-full border-none shadow-inner"
                title="Contract Preview"
              />
              <div className="absolute inset-0 bg-transparent pointer-events-none border-12 border-white/20" />
              <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <a 
                  href={selectedContract.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white shadow-2xl rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Fullscreen
                </a>
              </div>
            </div>

            {/* Review Controls */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Dealer
                  </p>
                  <p className="text-sm font-black text-zinc-900 uppercase">{selectedContract.dealer.companyName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Upload Date
                  </p>
                  <p className="text-sm font-black text-zinc-900 uppercase">{format(new Date(selectedContract.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Admin Notes (Internal & Dealer visible)
                </label>
                <textarea 
                  className="w-full h-24 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-300 outline-none"
                  placeholder="Review findings, reason for rejection, or general notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              {selectedContract.status === "pending" ? (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => handleReview("approved")}
                    disabled={processingReview}
                    className="group relative h-14 bg-emerald-600 text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative flex items-center justify-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> Approve
                    </span>
                  </button>
                  <button 
                    onClick={() => handleReview("rejected")}
                    disabled={processingReview}
                    className="h-14 bg-rose-50 text-rose-600 border border-rose-100 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-rose-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              ) : (
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${getStatusStyles(selectedContract.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedContract.status)}
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Already {selectedContract.status}</p>
                  </div>
                  <Download className="w-4 h-4 opacity-50" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
