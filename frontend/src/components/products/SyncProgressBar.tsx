import { RefreshCw } from "lucide-react";
import { SyncStatus } from "@/hooks/use-product-sync";

interface Props {
  syncStatus: SyncStatus;
}

export function SyncProgressBar({ syncStatus }: Props) {
  const isFetching = syncStatus.total === 0;

  return (
    <div className="rounded-2xl bg-zinc-900 px-6 py-4 flex items-center gap-6 shadow-lg">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin text-red-500" />
            {isFetching ? "Fetching from Shopify..." : "Syncing Inventory..."}
          </span>
          <span className="text-[11px] font-black text-white px-2.5 py-0.5 bg-red-600 rounded-full">
            {isFetching ? "..." : `${syncStatus.percent}%`}
          </span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          {isFetching ? (
            <div
              className="h-full w-1/3 bg-linear-to-r from-red-600 to-red-400 rounded-full"
              style={{ animation: "indeterminate 1.2s ease-in-out infinite" }}
            />
          ) : (
            <div
              className="h-full bg-linear-to-r from-red-600 to-red-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${syncStatus.percent}%` }}
            />
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="block text-sm font-black text-white">
          {isFetching ? (
            <span className="text-white/40">Loading...</span>
          ) : (
            <>{syncStatus.current} <span className="text-white/40">/ {syncStatus.total}</span></>
          )}
        </span>
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
          Products Synced
        </span>
      </div>
    </div>
  );
}