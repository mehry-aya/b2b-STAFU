import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { syncShopifyProducts, fetchSyncStatus } from "@/lib/api/products";

export interface SyncStatus {
  total: number;
  current: number;
  percent: number;
}

export function useProductSync(onComplete: () => Promise<void>) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const startSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncStatus({ total: 0, current: 0, percent: 0 });

    try {
      await syncShopifyProducts();
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message || "An error occurred while syncing with Shopify.",
        variant: "destructive",
      });
      setSyncing(false);
      setSyncStatus(null);
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await fetchSyncStatus();

        if (status.isSyncing) {
          const total = status.totalProducts || 0;
          const current = status.syncedProducts || 0;
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;
          setSyncStatus({ total, current, percent });
        } else {
          clearInterval(pollInterval);
          setSyncStatus(null);
          setSyncing(false);

          if (status.lastError) {
            toast({ title: "Sync Failed", description: status.lastError, variant: "destructive" });
          } else {
            toast({ title: "Sync Complete", description: `Synced ${status.syncedProducts} products from Shopify.` });
          }

          await onComplete();
        }
      } catch (err) {
        console.error("Error polling sync status:", err);
      }
    }, 1000);
  };

  return { syncing, syncStatus, startSync };
}