import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const articles = await prisma.article.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      publishedAt: true,
    },
  });

  console.table(articles);
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}
