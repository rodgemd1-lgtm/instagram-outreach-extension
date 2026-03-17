declare module "@/lib/scraping/ncsa-browser-sync.mjs" {
  export interface NcsaSyncOutput {
    syncedAt: string;
    coachActivity: {
      stats: {
        views: number;
        searches: number;
        follows: number;
        opens: number;
      };
      rows: Array<Record<string, unknown>>;
    };
    personalThreads: Array<Record<string, unknown>>;
    campInvites: Array<Record<string, unknown>>;
    leadCountPrepared: number;
    importResult: {
      inserted: number;
      updated: number;
      skipped: number;
      reason: string;
    };
  }

  export function syncNcsaDashboard(options?: {
    writeSnapshot?: boolean;
    snapshotPath?: string;
    maxCampInviteThreads?: number;
  }): Promise<NcsaSyncOutput>;
}
