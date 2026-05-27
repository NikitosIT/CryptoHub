import { prisma } from "@/libs/db.js";
import { logger } from "@/libs/logger.js";
import { cryptotokens } from "@/modules/cryptotokens/cryptotokens.service.js";

import { mapCryptotokenToSnapshotCreateInput } from "./snapshots.mapper.js";
import type { RefreshCryptotokenSnapshotsResult } from "./snapshots.types.js";

const refreshWeeklySnapshot =
  async (): Promise<RefreshCryptotokenSnapshotsResult> => {
    const snapshotAt = new Date();
    const tokens = await cryptotokens.list();

    const data = tokens.map((token) =>
      mapCryptotokenToSnapshotCreateInput(token, snapshotAt),
    );

    const result = await prisma.cryptotokenSnapshot.createMany({
      data,
    });

    logger.info(
      {
        createdCount: result.count,
        snapshotAt,
      },
      "Cryptotoken snapshots refreshed",
    );

    return {
      createdCount: result.count,
      snapshotAt,
    };
  };

export const snapshotsService = {
  refreshWeeklySnapshot,
} as const;
