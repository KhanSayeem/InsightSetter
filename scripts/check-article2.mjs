import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const titlePrefix = process.argv.slice(2).join(' ') || 'The Liquidity Mirage';

const found = await prisma.article.findMany({
  where: { title: { startsWith: titlePrefix } },
  select: {
    id: true,
    title: true,
    category: true,
    status: true,
    tags: true,
    slug: true,
    publishedAt: true,
    createdAt: true,
  },
  orderBy: { createdAt: 'desc' },
  take: 5,
});

console.log(JSON.stringify(found, null, 2));

await prisma.$disconnect();
