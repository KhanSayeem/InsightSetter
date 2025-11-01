import { PrismaClient } from '@prisma/client';

/**
 * Fetch dynamic routes for the sitemap.
 * Currently pulls published article slugs from the database via Prisma.
 */
export async function fetchDynamicRoutes() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      '[sitemap] DATABASE_URL is not set. Skipping dynamic article routes.',
    );
    return [];
  }

  const prisma = new PrismaClient();

  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    return articles.map((article) => ({
      routePath: `/articles/${article.slug}`,
      lastModified: article.updatedAt ?? article.publishedAt,
      changefreq: 'daily',
      priority: '0.8',
    }));
  } catch (error) {
    console.warn(
      `[sitemap] Unable to fetch published articles for sitemap: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return [];
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
