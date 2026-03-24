# Architecture Overview

## Layers

- `src/app`:
  - Route-level UI and page composition.
  - Uses server components + form actions for SSR-friendly UX.
- `src/server/actions`:
  - Form entry points.
  - Validates input, enforces authorization, triggers service operations, handles redirects.
- `src/server/services`:
  - Domain/business rules:
    - rolling score retention
    - draw generation and prize allocation
    - charity preferences and contributions
    - winner verification and payout handling
- `src/server/domain`:
  - Pure business logic layer for deterministic calculations (draw engine).
- `src/lib`:
  - Shared infrastructure:
    - Prisma singleton
    - auth/session helpers
    - search param/action feedback parsing helpers
    - constants and validators
    - environment validation

## Data Design

PostgreSQL via Prisma models:

- `User` + `role` (`SUBSCRIBER` / `ADMIN`)
- `Subscription` (plan, amount, lifecycle status)
- `ScoreEntry` (stableford score + played date, user-owned)
- `Draw` + `DrawResult` (winning numbers, tier pools, outcomes)
- `Charity` + `CharityPreference`
- `Donation` (subscription-linked or independent)
- `WinnerProof` + payout/verification statuses

## Security + Access

- Cookie-based JWT session.
- Password hashing with bcrypt.
- Defensive action-level error handling and safe redirects.
- Guard helpers:
  - `requireUser()`
  - `requireAdmin()`
- Role-aware page routing and admin action protection.

## Draw Engine Behavior

- Supports:
  - Random mode (lottery-style)
  - Algorithmic mode (frequency-informed selection)
- Pool calculation:
  - fixed subscription percentage -> monthly pool
  - split 40% / 35% / 25% across match tiers
- Jackpot rollover:
  - if no 5-match winner in published draw, 5-match tier carries to next cycle.

## Deployability

- Vercel-ready Next.js app.
- Supabase-ready schema SQL file at `prisma/supabase-schema.sql`.
- Environment-driven setup with `.env.example`.
