import { prisma } from "@/libs/db.js";
import { logger } from "@/libs/logger.js";
import { coingecko } from "@/services/coingecko/index.js";

import { mapCryptotokenToSnapshotCreateInput } from "./cryptotokens.mapper.js";
import type { CreateWeeklyCryptotokenSnapshotResult } from "./cryptotokens.types.js";

const createWeeklySnapshot =
  async (): Promise<CreateWeeklyCryptotokenSnapshotResult> => {
    const snapshotAt = new Date();
    const tokens = await coingecko.list();

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
  createWeeklySnapshot,
} as const;
