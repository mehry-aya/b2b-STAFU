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
  MessageSquare,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePathname } from "@/i18n/routing";
import { getAdminContractsAction, uploadContractAction, getDealersAdminAction } from "@/app/(auth)/actions";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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

import { useTranslations } from "next-intl";

export default function AdminContractsPage() {
  const t = useTranslations("AdminContracts");
  const tErr = useTranslations("Errors");
  const tSuc = useTranslations("Success");
  const pathname = usePathname();
  const isMaster = pathname?.startsWith("/master");
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      const result = await getAdminContractsAction(statusFilter === "all" ? undefined : statusFilter);
      if (result.error) {
        toast.error(tErr(result.error));
        return;
      }
      setContracts(result.data || []);
    } catch (error) {
      toast.error(tErr("connectionError"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchDealers = useCallback(async () => {
    try {
      const result = await getDealersAdminAction(1, 100); // Get first 100 dealers
      if (result.data) {
        setDealers(result.data.data);
      }
    } catch (error) {
      console.error("Failed to load dealers", error);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchDealers();
  }, [fetchContracts, fetchDealers]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDealerId) {
      if (!selectedDealerId) toast.error(t("selectDealerFirst", { fallback: "Please select a dealer first" }));
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dealerId", selectedDealerId);

    try {
      const result = await uploadContractAction(formData);
      if (result.error) {
        toast.error(tErr(result.error));
        return;
      }
      
      toast.success(tSuc("uploadSuccess"));
      fetchContracts();
      setSelectedDealerId("");
      // Reset input
      e.target.value = "";
    } catch (error) {
      toast.error(tErr("connectionError"));
      console.error(error);
    } finally {
      setUploading(false);
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

  const statusMap: Record<string, string> = {
    pending: t("pending"),
    approved: t("approved"),
    rejected: t("rejected"),
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
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
              {t("title")}
            </h1>
            <p className="text-zinc-400 text-sm mt-3 font-medium tracking-wide max-w-xl">
              {t("subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t("pendingReview")}</p>
              <p className="text-xl font-black text-amber-500">{contracts.filter(c => c.status === "pending").length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t("approved")}</p>
              <p className="text-xl font-black text-emerald-500">{contracts.filter(c => c.status === "approved").length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t("rejected")}</p>
              <p className="text-xl font-black text-rose-500">{contracts.filter(c => c.status === "rejected").length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t("totalDocuments")}</p>
              <p className="text-xl font-black text-white">{contracts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main List Section */}
        <div className={`flex-1 space-y-6 transition-all duration-500 ${selectedContract ? "lg:w-3/5" : "w-full"}`}>
          {/* Controls */}
          <div className="bg-white rounded-4xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{t("selectDealer")}</label>
                <SearchableSelect
                  options={dealers.map(d => ({ id: d.id, label: d.companyName }))}
                  value={selectedDealerId}
                  onChange={(val) => setSelectedDealerId(val.toString())}
                  placeholder={t("selectDealerPlaceholder")}
                  searchPlaceholder={t("searchDealersPlaceholder")}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{t("uploadDocument")}</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploading || !selectedDealerId}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <div className={`
                    flex items-center justify-center gap-3 px-4 py-3.5 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl
                    group-hover:border-blue-500/50 group-hover:bg-blue-50/50 transition-all duration-300
                    ${uploading ? "opacity-50" : ""}
                  `}>
                    {uploading ? (
                       <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-widest">
                      {uploading ? t("uploading") : t("clickToSelect")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="text"
                  placeholder={t("searchTracking")}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-zinc-400" />
                <select 
                  className="bg-zinc-50 border-none rounded-2xl px-4 py-3 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t("filterAll")}</option>
                  <option value="pending">{t("filterPending")}</option>
                  <option value="approved">{t("filterApproved")}</option>
                  <option value="rejected">{t("filterRejected")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">{t("dealer")}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">{t("file")}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">{t("uploaded")}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">{t("status")}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t("loadingData")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 py-10 opacity-30">
                          <FileText className="w-16 h-16 text-zinc-400" />
                          <p className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">{t("noContracts")}</p>
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
                            {statusMap[contract.status]}
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
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none">{t("reviewDocument")}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">{t("contractId")}: DOC-{selectedContract.id}</p>
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
            <div className="aspect-4/5 bg-zinc-950 relative group overflow-hidden">
              <iframe 
                src={selectedContract.fileUrl} 
                className="w-full h-full border-none shadow-inner"
                title={t("preview")}
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
                  {t("openFullscreen")}
                </a>
              </div>
            </div>

            {/* Review Controls */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {t("dealer")}
                  </p>
                  <p className="text-sm font-black text-zinc-900 uppercase">{selectedContract.dealer.companyName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {t("uploaded")}
                  </p>
                  <p className="text-sm font-black text-zinc-900 uppercase">{format(new Date(selectedContract.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>

              <div className="pt-4">
                <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${getStatusStyles(selectedContract.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedContract.status)}
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t("status")} | {statusMap[selectedContract.status]}</p>
                    </div>
                    <Download className="w-4 h-4 opacity-50" />
                  </div>
                  {selectedContract.notes && (
                    <div className="p-4 bg-white/50 rounded-2xl border border-white/20">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">{t("dealerResponse")}</p>
                      <p className="text-xs font-medium italic">{selectedContract.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
