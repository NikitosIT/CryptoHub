export type RefreshCryptotokenSnapshotsJobData = {
  requestedBy: "scheduler";
};

export type RefreshCryptotokenSnapshotsResult = {
  createdCount: number;
  snapshotAt: Date;
};
