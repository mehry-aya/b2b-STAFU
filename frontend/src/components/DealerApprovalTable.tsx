"use client";

import { useState } from "react";
import { approveDealerAction } from "@/app/login/actions";
import { Eye, Check, X, Mail, Phone, FileText } from "lucide-react";

interface Dealer {
  id: number;
  companyName: string;
  phone: string | null;
  contractUrl: string | null;
  contractStatus: string;
  createdAt: string;
  user: {
    email: string;
    isActive: boolean;
  };
}

export default function DealerApprovalTable({
  initialDealers,
}: {
  initialDealers: Dealer[];
}) {
  const [dealers, setDealers] = useState(initialDealers);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdate = async (id: number, status: string) => {
    setUpdatingId(id);
    const result = await approveDealerAction(id, status);
    if (result.success) {
      setDealers(
        dealers.map((d) =>
          d.id === id
            ? {
                ...d,
                contractStatus: status,
                user: { ...d.user, isActive: status === "approved" },
              }
            : d
        )
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Dealer Info
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Contact
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Contract
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {dealers.map((dealer) => (
              <tr
                key={dealer.id}
                className="hover:bg-zinc-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                    {dealer.companyName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-400">
                    <Mail className="h-3 w-3" />
                    {dealer.user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                    <Phone className="h-3 w-3 text-zinc-400" />
                    {dealer.phone || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {dealer.contractUrl ? (
                    <a
                      href={`http://localhost:3001${dealer.contractUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Doc
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 italic">
                      <FileText className="h-3.5 w-3.5" />
                      No doc
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      dealer.contractStatus === "approved"
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : dealer.contractStatus === "pending"
                        ? "text-amber-600 bg-amber-50 border-amber-100"
                        : dealer.contractStatus === "rejected"
                        ? "text-red-600 bg-red-50 border-red-100"
                        : "text-zinc-400 bg-zinc-50 border-zinc-100"
                    }`}
                  >
                    {dealer.contractStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleUpdate(dealer.id, "approved")}
                      disabled={
                        updatingId === dealer.id ||
                        dealer.contractStatus === "approved"
                      }
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:opacity-30 transition-all border border-emerald-100"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdate(dealer.id, "rejected")}
                      disabled={
                        updatingId === dealer.id ||
                        dealer.contractStatus === "rejected"
                      }
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-30 transition-all border border-red-100"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
