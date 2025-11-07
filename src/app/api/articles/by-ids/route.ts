import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ items: [] });
    }
    const rows = await prisma.article.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        slug: true,
        authorName: true,
        publishedAt: true,
        createdAt: true,
        category: true,
        tags: true,
        summary: true,
        content: true,
      },
    });
    // Preserve the order of ids
    const index = new Map<string, number>(ids.map((id: string, i: number) => [id, i] as const));
    rows.sort((a, b) => (index.get(a.id) ?? 0) - (index.get(b.id) ?? 0));
    return NextResponse.json({ items: rows });
  } catch (err) {
    return NextResponse.json({ items: [] });
  }
}
