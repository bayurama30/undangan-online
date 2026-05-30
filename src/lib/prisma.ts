import { PrismaClient } from "@/generated/prisma/client";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import { resolve } from "node:path";

const dbUrl = process.env.DATABASE_URL || resolve(process.cwd(), "dev.db");
const adapter = new PrismaSqlite({ url: dbUrl });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;