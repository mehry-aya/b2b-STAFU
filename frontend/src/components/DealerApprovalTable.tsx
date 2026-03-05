"use client";

import { useState } from "react";
import { approveDealerAction } from "@/app/login/actions";

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
            : d,
        ),
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Dealer Info
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Contact
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Contract
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {dealers.map((dealer) => (
              <tr
                key={dealer.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900">
                    {dealer.companyName}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 font-mono tracking-tighter">
                    {dealer.user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-slate-600">
                    {dealer.phone || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {dealer.contractUrl ? (
                    <a
                      href={`http://localhost:3001${dealer.contractUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Doc
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-slate-300 italic">
                      No doc yet
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                      dealer.contractStatus === "approved"
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : dealer.contractStatus === "pending"
                          ? "text-amber-600 bg-amber-50 border-amber-100"
                          : dealer.contractStatus === "rejected"
                            ? "text-rose-600 bg-rose-50 border-rose-100"
                            : "text-slate-400 bg-slate-50 border-slate-100"
                    }`}
                  >
                    {dealer.contractStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(dealer.id, "approved")}
                      disabled={
                        updatingId === dealer.id ||
                        dealer.contractStatus === "approved"
                      }
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-30 transition-colors"
                      title="Approve"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleUpdate(dealer.id, "rejected")}
                      disabled={
                        updatingId === dealer.id ||
                        dealer.contractStatus === "rejected"
                      }
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-30 transition-colors"
                      title="Reject"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
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
