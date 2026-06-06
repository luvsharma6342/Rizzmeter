import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

// Only initialize PostgreSQL client pool on server-side when database configuration is active
if (typeof window === "undefined" && process.env.DATABASE_URL) {
  try {
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    
    prismaInstance = new PrismaClient({ adapter });
  } catch (err) {
    console.error("Failed to initialize Prisma adapter-pg:", err);
    prismaInstance = new PrismaClient();
  }
} else {
  prismaInstance = new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
