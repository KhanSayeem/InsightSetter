# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project commands
- Dev server
  - npm run dev
- Build and serve
  - SITEMAP_BASE_URL must be set to the public site origin, otherwise the postbuild sitemap step will fail.
  - Windows (PowerShell): $env:SITEMAP_BASE_URL = "https://insightsetter.manacorp.org"; npm run build
  - macOS/Linux (bash/zsh): SITEMAP_BASE_URL="https://insightsetter.manacorp.org" npm run build
  - Start production server: npm start
- Lint
  - npm run lint
- Type-check (no script defined)
  - npx tsc -p tsconfig.json --noEmit
- Generate sitemap manually (optional)
  - npm run sitemap -- --domain=https://insightsetter.manacorp.org --out=./public/sitemap.xml

Environment
- Required
  - DATABASE_URL: PostgreSQL connection string used by Prisma and sitemap dynamic routes.
  - ADMIN_PASSWORD: Plain text password for moderator login; hashed into a session token and stored in a secure cookie.
  - RESEND_API_KEY, RESEND_FROM_EMAIL: Needed to send welcome emails and digests.
  - SITEMAP_BASE_URL: Public origin for generating absolute URLs in sitemap (used during build poststep).
- Optional
  - APP_ORIGIN: Overrides the base URL used in outbound email links; defaults to https://insightsetter.manacorp.org.

Architecture overview
- Framework and runtime
  - Next.js (App Router) with TypeScript and React 19. Global RootLayout defines metadata, icons, OG, and a pre-hydration theme script.
  - Route groups split concerns: src/app/(site) for the public site shell, src/app/(admin)/admin for the editorial console.
  - UI composed from small primitives in src/components/ui (Button, Card, Tag) and feature components (newsletter form, digest sender, theme toggle, logo).
- Data and persistence
  - Prisma models in prisma/schema.prisma: Article and Subscriber with status enums for workflow. Runtime Prisma client is created in src/lib/prisma.ts.
  - Server components and server actions perform all database writes. Reads happen in route components and actions as needed.
- Auth (editorial console)
  - Password-only admin auth (no users):
    - ADMIN_PASSWORD is hashed (sha256) to a token; constant-time comparison prevents timing attacks.
    - Session token is stored as an httpOnly cookie ADMIN_COOKIE_NAME=insightsetter-admin with 12h maxAge.
    - Login flow lives in (admin)/admin via authenticateAdmin; actions enforce ensureAdmin for privileged mutations.
- Content workflow
  - Public submissions: src/app/(site)/submit uses a server action (src/app/actions.ts) to validate, slugify, and insert Article in PENDING state, then revalidates / and /admin.
  - Admin curation: (admin)/admin/actions.ts supports publish, reject, delete, and internal submit (with unique slug generation), revalidating relevant routes.
- Emailing and newsletters
  - Resend SDK is used in src/app/newsletter-actions.ts to send:
    - Welcome email on subscription.
    - Digest emails to all or a selected subset of active subscribers.
  - Email HTML is rendered via simple template functions in src/emails/*.ts (no JSX/templating engine).
- Static generation and SEO
  - Sitemap generator (generate-sitemap.js) scans pages in app/ (and pages/) and merges dynamic entries from scripts/sitemap-sources.js (published Article slugs via Prisma). Requires --domain or SITEMAP_BASE_URL. Output written to public/sitemap.xml.

Conventions and important details
- TypeScript paths: @/* -> ./src/* (see tsconfig.json).
- Styling: Tailwind CSS v4 via @tailwindcss/postcss; global styles in src/app/globals.css; theme stored in localStorage (key: insightsetter-theme) and applied pre-hydration.
- Next config: reactCompiler enabled; serverExternalPackages includes Prisma packages; outputFileTracingIncludes ensures .prisma client artifacts are traced.
- Revalidation: Server actions call revalidatePath after mutations to keep static paths and RSC data fresh.

Common development flows
- Bring up the editorial console: run dev, visit /admin, set ADMIN_PASSWORD in env first. Successful login establishes the cookie session; publish/reject/delete actions require this session.
- Test newsletter flows: set RESEND_API_KEY and RESEND_FROM_EMAIL; subscribe via the public form to receive the welcome email; use the Admin “Send digest” form to email active subscribers.
- Generate/refresh sitemap: ensure DATABASE_URL (for dynamic article routes) and SITEMAP_BASE_URL; run the sitemap script manually or via build.

Notes
- No test runner is configured; there is no npm test script.
- The sitemap postbuild step depends on SITEMAP_BASE_URL; builds will fail without it.
