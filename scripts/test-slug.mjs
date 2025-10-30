import { PrismaClient, ArticleStatus } from "@prisma/client";

const prisma = new PrismaClient();

const run = async () => {
  const slugs = [
    "fast-take-liquidity-jolts",
    "fast-take-ai-infra-spend",
    "fast-take-b2b-pricing-power",
    "first-insight-article"
  ];

  for (const slug of slugs) {
    const article = await prisma.article.findFirst({
      where: { slug, status: ArticleStatus.PUBLISHED },
      select: { title: true, slug: true }
    });
    console.log(slug, "=>", article?.title);
  }
};

run()
  .catch((err) => {
    console.error(err);
  })
  .finally(() => prisma.$disconnect());
