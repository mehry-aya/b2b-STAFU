import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-center space-y-8 border border-slate-100">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
            STAFUPRO B2B Management
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link
            href="/admin/dealers"
            className="group p-6 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            Manage Dealers
          </Link>
          <div className="flex flex-col justify-end">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
