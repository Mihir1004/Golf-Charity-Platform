-- Local PostgreSQL seed for environments where `npm run prisma:seed` is blocked.

-- Charities
INSERT INTO "Charity" (
  "id",
  "name",
  "slug",
  "description",
  "isFeatured",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'seed_charity_jff',
    'Junior Fairway Foundation',
    'junior-fairway-foundation',
    'Supports golf access for underrepresented youth through coaching and course-day sponsorships.',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    'seed_charity_gfr',
    'Greens For Recovery',
    'greens-for-recovery',
    'Funds rehabilitation and mental wellness programs through sport-led community events.',
    false,
    true,
    NOW(),
    NOW()
  ),
  (
    'seed_charity_cbt',
    'Community Birdie Trust',
    'community-birdie-trust',
    'Delivers local grant support for families facing medical and educational hardship.',
    false,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "isFeatured" = EXCLUDED."isFeatured",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Users (passwords match README credentials)
INSERT INTO "User" (
  "id",
  "email",
  "passwordHash",
  "fullName",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'seed_admin',
    'admin@fairwayforgood.test',
    '$2b$12$i0uJAJw8znMfE0JP.NPyo.TpHWBCQzKJB/yhHQcYidkQ7Tv1AU99O',
    'Platform Admin',
    'ADMIN',
    NOW(),
    NOW()
  ),
  (
    'seed_player',
    'player@fairwayforgood.test',
    '$2b$12$bWaj27goWxw77Q.y0s7m.eaQtT8Mm3CABjBXKb.kkKomonaQEGi1m',
    'Demo Subscriber',
    'SUBSCRIBER',
    NOW(),
    NOW()
  )
ON CONFLICT ("email") DO UPDATE
SET
  "passwordHash" = EXCLUDED."passwordHash",
  "fullName" = EXCLUDED."fullName",
  "role" = EXCLUDED."role",
  "updatedAt" = NOW();

-- Subscriber charity preference
INSERT INTO "CharityPreference" (
  "id",
  "userId",
  "charityId",
  "contributionPercent",
  "createdAt",
  "updatedAt"
)
SELECT
  'seed_pref_player',
  u."id",
  c."id",
  12,
  NOW(),
  NOW()
FROM "User" u
JOIN "Charity" c ON c."slug" = 'junior-fairway-foundation'
WHERE u."email" = 'player@fairwayforgood.test'
ON CONFLICT ("userId") DO UPDATE
SET
  "charityId" = EXCLUDED."charityId",
  "contributionPercent" = EXCLUDED."contributionPercent",
  "updatedAt" = NOW();

-- Active monthly subscription for demo player
INSERT INTO "Subscription" (
  "id",
  "userId",
  "plan",
  "status",
  "amount",
  "charityPercent",
  "provider",
  "providerRef",
  "startedAt",
  "renewalDate",
  "createdAt",
  "updatedAt"
)
SELECT
  'seed_sub_player',
  u."id",
  'MONTHLY',
  'ACTIVE',
  49.00,
  12,
  'seed',
  'seed-static',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
FROM "User" u
WHERE u."email" = 'player@fairwayforgood.test'
AND NOT EXISTS (
  SELECT 1
  FROM "Subscription" s
  WHERE s."userId" = u."id"
    AND s."status" = 'ACTIVE'
);

-- Starter scores (insert only if player has no scores yet)
INSERT INTO "ScoreEntry" ("id", "userId", "score", "playedOn", "createdAt")
SELECT
  CONCAT('seed_score_', i::text),
  u."id",
  score_data.score,
  NOW() - score_data.delta,
  NOW()
FROM "User" u
JOIN (
  VALUES
    (1, 21, INTERVAL '0 days'),
    (2, 29, INTERVAL '7 days'),
    (3, 34, INTERVAL '14 days'),
    (4, 18, INTERVAL '21 days'),
    (5, 40, INTERVAL '28 days')
) AS score_data(i, score, delta) ON TRUE
WHERE u."email" = 'player@fairwayforgood.test'
AND NOT EXISTS (
  SELECT 1
  FROM "ScoreEntry" s
  WHERE s."userId" = u."id"
);
