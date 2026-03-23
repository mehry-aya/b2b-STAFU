"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getMyContractsAction, reviewContractAction } from "@/app/(auth)/actions";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";

interface Contract {
  id: number;
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  type: string;
  notes: string | null;
  createdAt: string;
}

export default function DealerContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingReview, setProcessingReview] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const t = useTranslations("DealerContracts");
  const tErr = useTranslations("Errors");
  const tSuc = useTranslations("Success");

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    if (!isImage(fileName)) {
      window.open(fileUrl, '_blank');
      return;
    }

    try {
      const pdf = new jsPDF();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = fileUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (img.height * pdfWidth) / img.width;
        
        pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        const pdfFileName = fileName.split('.').slice(0, -1).join('.') + '.pdf';
        pdf.save(pdfFileName);
        toast.success(tSuc("updateSuccess") || "Downloaded as PDF");
      };
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error(tErr("connectionError"));
    }
  };

  const fetchContracts = useCallback(async () => {
    try {
      const result = await getMyContractsAction();
      if (result.error) throw new Error(result.error);
      setContracts(result.data || []);
    } catch (error) {
      toast.error(tErr("fetchContractsFailed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [tErr]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleReview = async (id: number, status: "approved" | "rejected") => {
    setProcessingReview(true);
    try {
      const result = await reviewContractAction(id, status, reviewNotes);
      if (result.error) throw new Error(result.error);
      
      toast.success(tSuc("updateSuccess") || `Contract ${status} successfully`);
      setReviewNotes("");
      setSelectedContract(null);
      fetchContracts();
    } catch (error) {
      toast.error(tErr("failedToSubmitReview"));
      console.error(error);
    } finally {
      setProcessingReview(false);
    }
  };

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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-8 py-10 shadow-2xl">
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "24px 24px" 
        }} />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
              {t("title")}
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-medium tracking-wide">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main List Section */}
        <div className={`flex-1 space-y-6 transition-all duration-500 ${selectedContract ? "lg:w-3/5" : "w-full"}`}>
          {/* Contracts Table */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="font-black text-zinc-900 uppercase tracking-widest text-sm flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                {t("tableTitle")}
              </h2>
              <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                {t("itemsTotal", { count: contracts.length })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">{t("fileName")}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">{t("uploaded")}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">{t("status")}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">{t("action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("hydrating")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : contracts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <FileText className="w-12 h-12 text-zinc-400" />
                          <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">{t("noDocuments")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    contracts.map((contract) => (
                      <tr 
                        key={contract.id} 
                        onClick={() => setSelectedContract(contract)}
                        className={`group cursor-pointer hover:bg-zinc-50/50 transition-all duration-300 ${selectedContract?.id === contract.id ? "bg-blue-50/70" : ""}`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                              <FileText className="w-5 h-5" />
                            </div>
                            <p className="font-black text-zinc-900 uppercase tracking-tight text-sm truncate max-w-[200px]">
                              {contract.fileName}
                            </p>
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
                            {getStatusIcon(contract.status)}
                            {contract.status === "approved" ? t("approved") : contract.status === "rejected" ? t("rejected") : t("pending")}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
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

        {/* Review Side Pane */}
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
              {isImage(selectedContract.fileName) ? (
                <img 
                  src={selectedContract.fileUrl} 
                  alt="Contract Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe 
                  src={`${selectedContract.fileUrl}#view=FitH`} 
                  className="w-full h-full border-none shadow-inner"
                  title="Contract Preview"
                />
              )}
              <div className="absolute inset-0 bg-transparent pointer-events-none border-12 border-white/20" />
              <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <a 
                  href={selectedContract.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white shadow-2xl rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:bg-blue-600 hover:text-white transition-all font-bold"
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
                  <p className="text-sm font-black text-zinc-900 uppercase">Your Company</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {t("uploadDate")}
                  </p>
                  <p className="text-sm font-black text-zinc-900 uppercase">{format(new Date(selectedContract.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>

              {selectedContract.status === "pending" ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> {t("reviewNotes")}
                    </label>
                    <textarea 
                      className="w-full h-24 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder={t("reviewNotesPlaceholder")}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleReview(selectedContract.id, "approved")}
                      disabled={processingReview}
                      className="h-14 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {t("approve")}
                    </button>
                    <button 
                      onClick={() => handleReview(selectedContract.id, "rejected")}
                      disabled={processingReview}
                      className="h-14 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {t("reject")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4">
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                    selectedContract.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedContract.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t("statusLabel")} | {selectedContract.status === "approved" ? t("approved") : t("rejected")}</p>
                      </div>
                      <button 
                        onClick={() => handleDownload(selectedContract.fileUrl, selectedContract.fileName)}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                        title="Download as PDF"
                      >
                        <Download className="w-4 h-4 opacity-50" />
                      </button>
                    </div>
                    {selectedContract.notes && (
                      <div className="p-4 bg-white/50 rounded-2xl border border-white/20">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">{t("yourNotes")}</p>
                        <p className="text-xs font-medium italic">{selectedContract.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
