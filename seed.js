import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "markets-macro" },
    update: {},
    create: {
      label: "Markets & Macro",
      slug: "markets-macro",
      description: "Rate moves, liquidity signals, and policy decisions shaping the macro backdrop.",
      railTitle: "Markets & Macro",
    },
  });

  await prisma.article.create({
    data: {
      title: "First Insight Article",
      content: "This is your first seeded article.",
      authorName: "Murphy Law",
      slug: "first-insight-article",
      status: "PUBLISHED",
      categoryId: category.id,
    },
  });
  console.log("✅ Seeded an article!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
