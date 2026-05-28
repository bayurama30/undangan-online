import "dotenv/config";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import { PrismaClient } from "./src/generated/prisma/client/index.js";
import bcrypt from "bcryptjs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const dbUrl = resolve(__dirname, "dev.db");
const adapter = new PrismaSqlite({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const password = bcrypt.hashSync("admin123", 10);

try {
  const existing = await prisma.admin.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("Admin user already exists.");
  } else {
    await prisma.admin.create({
      data: { username: "admin", password },
    });
    console.log("Admin user created: admin / admin123");
  }
} catch (e) {
  console.error("Seed error:", e);
} finally {
  await prisma.$disconnect();
}
