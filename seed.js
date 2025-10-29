import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.article.create({
    data: {
      title: "First Insight Article",
      content: "This is your first seeded article.",
      authorName: "Murphy Law",
      slug: "first-insight-article",
      status: "PUBLISHED",
    },
  });
  console.log("✅ Seeded an article!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
