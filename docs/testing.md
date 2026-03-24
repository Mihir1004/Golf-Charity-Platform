# Testing Strategy

## Goals

- Protect critical business logic from regressions.
- Validate edge cases in draw, score, and winner workflows.
- Keep test runtime lightweight for CI and local runs.

## Tooling

- `Vitest` for fast TypeScript-native tests.
- Coverage via `@vitest/coverage-v8`.

## Test Suites

- `tests/unit/draw-engine.test.ts`
  - Draw pool distribution
  - Match counting
  - Tier winner counting
  - Payout and rollover logic
  - Random/algorithmic number generation rules
- `tests/unit/validators.test.ts`
  - Input validation for score, draw month key, proof URL, charity schema
- `tests/integration/score-service.integration.test.ts`
  - Rolling 5-score retention
  - Range guard errors
  - Owner-only score updates
- `tests/integration/winner-service.integration.test.ts`
  - Approval requires proof
  - Payout state transitions
  - Reject invalid payment progression

## Run Tests

```bash
npm run test
```

## Coverage Expectations

Coverage thresholds are enforced in `vitest.config.ts` for critical business modules:

- lines: 70%
- functions: 70%
- branches: 60%
- statements: 70%
