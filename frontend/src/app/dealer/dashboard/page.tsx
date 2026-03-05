import LogoutButton from "@/components/LogoutButton";

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
          <div className="flex flex-col justify-end">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
