import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const titlePrefix = process.argv.slice(2).join(' ') || 'The Liquidity Mirage';

const article = await prisma.article.findFirst({
  where: { title: { startsWith: titlePrefix } },
  select: { id: true, category: true },
});

if (!article) {
  console.log('Not found');
  process.exit(0);
}

const category = await prisma.category.findUnique({ where: { slug: 'case-studies' }, select: { id: true } });
if (!category) {
  console.error("Category 'case-studies' not found.");
  process.exit(1);
}

await prisma.article.update({ where: { id: article.id }, data: { categoryId: category.id } });

const updated = await prisma.article.findUnique({ where: { id: article.id }, select: { id: true, category: true } });
console.log(updated);

await prisma.$disconnect();
