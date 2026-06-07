import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

// Only initialize PostgreSQL client pool on server-side when database configuration is active
if (typeof window === "undefined" && process.env.DATABASE_URL) {
  try {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

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
