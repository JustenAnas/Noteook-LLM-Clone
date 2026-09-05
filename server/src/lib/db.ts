import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });
    pool.query("SELECT 1")
  .then(() => console.log("🔥 DATABASE RUNTIME CONNECTED"))
  .catch((err) => console.error("🔥 DATABASE RUNTIME ERROR:", err));
    const adapter = new PrismaPg(pool as any);

    return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;