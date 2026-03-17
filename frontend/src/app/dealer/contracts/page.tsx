"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, FileText, Download, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { getMyContractsAction, uploadContractAction } from "@/app/(auth)/actions";

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
  const [uploading, setUploading] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      const result = await getMyContractsAction();
      if (result.error) throw new Error(result.error);
      setContracts(result.data || []);
    } catch (error) {
      toast.error("Failed to load contracts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadContractAction(formData);

      if (result.error) throw new Error(result.error);
      
      toast.success("Contract uploaded successfully");
      fetchContracts();
    } catch (error) {
      toast.error("Failed to upload contract");
      console.error(error);
    } finally {
      setUploading(false);
    }
  }, [fetchContracts]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    multiple: false,
  });

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
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
              Contracts
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-medium tracking-wide">
              UPLOAD AND MANAGE YOUR TRADING AGREEMENTS
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Active Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-black text-white uppercase tracking-wider">Trading Authorized</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`relative group cursor-pointer transition-all duration-500 ${
          isDragActive ? "scale-[0.99]" : "hover:scale-[1.005]"
        }`}
      >
        <input {...getInputProps()} />
        <div className={`
          relative overflow-hidden rounded-[2.5rem] border-2 border-dashed p-12 text-center
          transition-all duration-500 backdrop-blur-sm
          ${isDragActive 
            ? "border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10" 
            : "border-zinc-200 bg-white/50 hover:border-zinc-300 hover:bg-zinc-50/50"}
        `}>
          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500
              ${isDragActive ? "bg-blue-500 text-white rotate-12 scale-110" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-500"}
            `}>
              {uploading ? (
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-10 h-10" />
              )}
            </div>
            <div>
              <p className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                {isDragActive ? "Release to upload" : "Drop PDF or image here, or click to browse"}
              </p>
              <p className="text-xs text-zinc-500 font-bold mt-2 uppercase tracking-[0.2em]">
                ACCEPTED: PDF, JPG, PNG • MAX SIZE: 10 MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="font-black text-zinc-900 uppercase tracking-widest text-sm flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            Uploaded Contracts
          </h2>
          <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
            {contracts.length} Items Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">File Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Uploaded</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Type</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Notes</th>
                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hydrating data...</p>
                    </div>
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <FileText className="w-12 h-12 text-zinc-400" />
                      <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">No contracts found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className="group hover:bg-zinc-50/50 transition-colors duration-300">
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
                      <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        {contract.type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`
                        inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest
                        ${getStatusStyles(contract.status)}
                      `}>
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-zinc-500 font-medium italic max-w-xs truncate">
                        {contract.notes || "No notes from admin"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a 
                        href={contract.fileUrl} 
                        download 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-lg shadow-black/5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
