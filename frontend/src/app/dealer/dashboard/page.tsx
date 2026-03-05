import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function DealerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-center space-y-8 border border-slate-100">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Dealer Portal
          </h1>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
            B2B Ordering & Management
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link
            href="/dealer/orders/new"
            className="group p-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center gap-3 shadow-xl shadow-slate-200"
          >
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20">
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
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            New Order
          </Link>
          <Link
            href="/dealer/products"
            className="group p-6 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-100">
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
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
            View Products
          </Link>
          <Link
            href="/dealer/orders"
            className="group p-6 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-100">
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            Order History
          </Link>
          <div className="flex flex-col justify-end">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
