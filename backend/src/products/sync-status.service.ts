import { Injectable, Scope } from '@nestjs/common';

export interface SyncStatus {
  isSyncing: boolean;
  totalProducts: number;
  syncedProducts: number;
  lastError: string | null;
  startedAt: Date | null;
}

@Injectable({ scope: Scope.DEFAULT })
export class SyncStatusService {
  private status: SyncStatus = {
    isSyncing: false,
    totalProducts: 0,
    syncedProducts: 0,
    lastError: null,
    startedAt: null,
  };

  startSync(total: number = 0) {
    this.status = {
      isSyncing: true,
      totalProducts: total,
      syncedProducts: 0,
      lastError: null,
      startedAt: new Date(),
    };
  }

  setTotal(total: number) {
    this.status.totalProducts = total;
  }

  updateProgress(current: number) {
    this.status.syncedProducts = current;
  }

  completeSync() {
    this.status.isSyncing = false;
  }

  setError(error: string) {
    this.status.lastError = error;
    this.status.isSyncing = false;
  }

  getStatus(): SyncStatus {
    return this.status;
  }
}
