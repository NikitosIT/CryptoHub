import { PrismaPg } from "@prisma/adapter-pg";

import { logger } from "@/libs/logger.js";

import { PrismaClient } from "../../prisma/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

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

export { connectDB, disconnectDB, prisma };
