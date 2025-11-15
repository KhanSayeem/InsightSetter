import { prisma } from '../src/lib/prisma.js';

async function main() {
  const titlePrefix = process.argv.slice(2).join(' ') || 'The Liquidity Mirage';
  const found = await prisma.article.findMany({
    where: { title: { startsWith: titlePrefix } },
    select: {
      id: true,
      title: true,
      category: {
        select: {
          id: true,
          label: true,
          slug: true,
        },
      },
      status: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log(JSON.stringify(found, null, 2));
}

main().finally(() => prisma.$disconnect());
