import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/config/env.js";

import type { Prisma } from "../../prisma/generated/prisma/client.js";
import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { logger } from "./logger.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ err: error }, "Database connection failed");
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export type DbTransaction = Prisma.TransactionClient;

export { connectDB, disconnectDB, prisma };
