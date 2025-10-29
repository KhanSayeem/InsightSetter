import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const test = async () => {
  try {
    const articles = await prisma.article.findMany({ take: 3 });
    console.log("✅ Query succeeded:", articles);
  } catch (err) {
    console.error("❌ Query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
};

test();
