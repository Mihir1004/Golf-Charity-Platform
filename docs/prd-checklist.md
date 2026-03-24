# PRD Checklist Mapping

## Subscription & Payment

- Monthly/yearly plans: implemented.
- Lifecycle states (active/canceled/lapsed): implemented.
- Access gating: non-auth users redirected; admin/subscriber role routes enforced.
- Stripe placeholder:
  - current build uses `manual-demo` provider field.
  - ready to replace with Stripe webhooks and checkout sessions.

## Score Management

- Score input validated between `1-45`.
- Score date required.
- Rolling retention of latest 5 scores implemented.
- Reverse chronological display implemented.
- User and admin score visibility included.

## Draw & Rewards

- Draw tiers: 5, 4, 3 matches.
- Logic modes:
  - Random
  - Algorithmic (frequency-weighted)
- Simulation and publish operation via admin.
- Monthly `monthKey` operation.
- Jackpot rollover logic implemented.

## Prize Pool Logic

- Fixed percentage of active subscription value feeds draw pool.
- Tier split enforced:
  - 5 match -> 40%
  - 4 match -> 35%
  - 3 match -> 25%
- Equal split among same-tier winners implemented.

## Charity

- Charity directory listing implemented.
- Featured charity support implemented.
- User charity selection + contribution percentage implemented.
- Independent donation flow implemented.

## Winner Verification

- Winner proof URL upload implemented.
- Admin approve/reject implemented.
- Payment state progression (`PENDING` -> `PAID`) implemented.

## User Dashboard

- Subscription status and renewal display.
- Score entry/edit section.
- Charity preference module.
- Participation and winnings overview.

## Admin Dashboard

- User management and status controls.
- Draw run/simulation/publish.
- Charity CRUD.
- Winner review and payout tracking.
- Analytics summary (users, pools, charity totals, draw counts).

## Technical Requirements

- Responsive mobile-first UI.
- Server-side validations and structured service layer.
- Unit and integration test coverage for critical flows.
- Deployment docs for Vercel + Supabase.
- Environment template and SQL schema included.

## Remaining Optional Enhancements

- Real Stripe integration (checkout + webhooks).
- Email notifications (draw results, winner alerts).
- File upload storage (Supabase Storage) instead of proof URL.
