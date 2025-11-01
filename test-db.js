import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const test = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected successfully");
    
    const articles = await prisma.article.findMany({ take: 3 });
    console.log("✅ Query succeeded:", articles);
  } catch (err) {
    console.error("❌ Query failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
};

test();
