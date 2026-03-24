# Fairway For Good - Golf Charity Subscription Platform

Production-oriented full-stack implementation of the Digital Heroes PRD.

## What This App Covers

- Public landing page with impact-first UX and clear subscription CTA.
- Subscriber flow:
  - Register/login
  - Subscription selection (monthly/yearly)
  - 5-score Stableford rolling storage (1-45)
  - Charity preference + independent donations
  - Winnings and proof submission
- Admin flow:
  - Analytics summary
  - Draw simulation/publishing (random + algorithmic)
  - Charity CRUD
  - Winner verification and payout tracking
  - User management and subscription status controls
- Structured PostgreSQL schema for Vercel Marketplace providers (Neon, Supabase, etc.).

## Tech Stack

- `Next.js 16` (App Router, TypeScript)
- `Prisma` + PostgreSQL (Vercel Marketplace/Supabase-ready)
- `Tailwind CSS v4`
- `Zod` validations
- Cookie + JWT session auth (`jsonwebtoken`, `bcryptjs`)

## Project Structure

```txt
src/
  app/
    page.tsx
    login/page.tsx
    register/page.tsx
    dashboard/*                # Subscriber panel pages
    admin/*                    # Admin panel pages
    actions/logout/route.ts
  components/
    action-feedback.tsx
    auth-card.tsx
    top-nav.tsx
    panel.tsx
    stat-card.tsx
  lib/
    auth.ts
    constants.ts
    page-params.ts
    prisma.ts
    utils.ts
    validators.ts
  server/
    actions/*                  # Server form actions
    services/*                 # Business/domain services
prisma/
  schema.prisma
  seed.ts
  supabase-schema.sql
docs/
  architecture.md
  prd-checklist.md
```

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env:
   ```bash
   cp .env.example .env
   ```
3. Set `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, and `JWT_SECRET` in `.env`.
   - `JWT_SECRET` should be at least 16 characters.
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Apply schema:
   ```bash
   npm run prisma:push
   ```
   For Supabase SQL Editor workflow, you can also run `prisma/supabase-schema.sql`.
6. Seed sample data:
   ```bash
   npm run prisma:seed
   ```
   If your environment blocks `tsx` process spawning, use SQL fallback:
   ```bash
   psql -h localhost -U postgres -d golf_charity_platform -f prisma/seed-local.sql
   ```
7. Run dev server:
   ```bash
   npm run dev
   ```

## Seed Credentials

- Admin: `admin@fairwayforgood.test` / `Admin@12345`
- Subscriber: `player@fairwayforgood.test` / `Player@12345`

## Vercel Deployment (App + Hosted Postgres)

1. Create/import this repo as a Vercel project.
2. In Vercel, open the project and add a Postgres provider from Marketplace (Neon recommended).
3. Add app environment variables in Vercel:
   - `POSTGRES_PRISMA_URL` = pooled Prisma URL
   - `POSTGRES_URL_NON_POOLING` = non-pooled/direct URL
   - (optional compatibility) `DATABASE_URL` = `POSTGRES_PRISMA_URL`, `DIRECT_URL` = `POSTGRES_URL_NON_POOLING`
   - `JWT_SECRET` = random 32+ char secret
   - `APP_URL` = production URL (for example `https://your-app.vercel.app`)
4. Run schema once against production DB:
   ```bash
   npm run prisma:push
   ```
5. (Optional) Seed initial demo data:
   ```bash
   npm run prisma:seed
   ```
6. Deploy.

## Scripts

- `npm run dev` - Start local development
- `npm run build` - Production build
- `npm run lint` - Linting
- `npm run typecheck` - TypeScript checks
- `npm run check` - Lint + typecheck + tests
- `npm run test` - Unit + integration tests with coverage
- `npm run test:watch` - Watch mode for tests
- `npm run audit:prod` - Production dependency vulnerability scan
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Apply Prisma schema directly to DB
- `npm run prisma:migrate` - Apply migrations (if using migrations workflow)
- `npm run prisma:seed` - Seed demo data

## PRD Notes

- Draw pool split enforced at `40/35/25` for `5/4/3` matches.
- Jackpot rollover logic included when no 5-match winner.
- Only last 5 scores are retained per user.
- Winner flow supports proof upload, admin review, and payout status updates.

See detailed mapping in:
- `docs/prd-checklist.md`
- `docs/architecture.md`
- `docs/testing.md`
