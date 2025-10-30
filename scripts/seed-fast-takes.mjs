import { PrismaClient, ArticleCategory, ArticleStatus } from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();

const fastTakes = [
  {
    title: "Liquidity jolts ahead of FOMC",
    summary: "Funding spreads are widening while dealers hoard cash. Expect shorter-term issuance to stay volatile.",
    content: `The latest Treasury refunding put a bid under the front end, but dealer balance sheets are still strained. Watch the 3m-10y spread and GC repo prints into the meeting week; the desks we track are net sellers of duration for the first time in two quarters.`,
    authorName: "InsightSetter Desk",
    slug: "fast-take-liquidity-jolts",
    status: ArticleStatus.PUBLISHED,
    category: ArticleCategory.FAST_TAKE,
    tags: ["macro", "liquidity"],
    publishedAt: now,
  },
  {
    title: "AI infra spend is re-accelerating",
    summary: "Four hyperscalers just raised capex guidance; watch the margins on power-heavy workloads.",
    content: `AWS, Azure, Google Cloud, and Oracle all nudged FY capex higher this week. The mix is skewing to datacenter buildouts with bespoke accelerators. Power purchase agreements are locking in at 12-15 year tenors, so margin compression shows up in FY26 unless pricing resets.`,
    authorName: "InsightSetter Desk",
    slug: "fast-take-ai-infra-spend",
    status: ArticleStatus.PUBLISHED,
    category: ArticleCategory.FAST_TAKE,
    tags: ["ai", "infrastructure"],
    publishedAt: now,
  },
  {
    title: "Pricing power pockets in B2B SaaS",
    summary: "Net retention above 115% is clustering in vertical tools with embedded payments.",
    content: `Quarterly disclosures from Toast, Procore, and Veeva show the same pattern: usage-based tiers with payments attached are holding price while generic workflow seats get renegotiated. Expect mid-market vendors without payments hooks to lean on services or new SKU bundles to close the gap.`,
    authorName: "InsightSetter Desk",
    slug: "fast-take-b2b-pricing-power",
    status: ArticleStatus.PUBLISHED,
    category: ArticleCategory.FAST_TAKE,
    tags: ["saas", "pricing"],
    publishedAt: now,
  },
];

async function run() {
  for (const data of fastTakes) {
    await prisma.article.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }

  console.log(`Seeded ${fastTakes.length} FAST_TAKE posts.`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
