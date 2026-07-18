# @fitnest/mobile

Expo (React Native) app for FitNest — iOS + Android from one TypeScript codebase,
sharing the pricing engines in `@fitnest/core` with the web app.

## Why it lives outside the pnpm workspace

`apps/mobile` is **deliberately excluded** from `pnpm-workspace.yaml`. React Native
and Expo pull a large, React-19-leaning dependency graph whose peer requirements
conflict with the web app's React 18. Keeping mobile out of the workspace means
its install can never change the web app's lockfile or resolution — the web
production build stays completely insulated. `@fitnest/core` is still shared, via
Metro `watchFolders` + a resolver alias to `packages/core/src` (see
`metro.config.js`), so there is exactly one pricing source of truth.

## Run it

```bash
cd apps/mobile
pnpm install          # isolated install, does not touch the root lockfile
pnpm start            # Expo dev server; press i / a for iOS / Android
```

Requires a dev environment with Xcode (iOS) or Android Studio, or Expo Go on a
device. This scaffold has **not** been run against a simulator in CI — treat the
first `pnpm start` as the smoke test.

## What's here (skeleton)

- `app/index.tsx` — the two doors (Programmes, Compose ton plan)
- `app/plans.tsx` — programmes overview (static; configurator is Phase 2)
- `app/compose.tsx` — **the live composer**: fetches the public `/api/compose`
  catalog, prices every change locally with `priceComposedMeal` from
  `@fitnest/core`, and shows live macros + total. This proves the shared-core +
  public-API pattern end to end.
- `lib/api.ts` — public JSON client (base URL from `app.json` → `extra.apiBaseUrl`)
- `lib/theme.ts` — design tokens (migrate into `@fitnest/core` in Phase 0)

## Not here yet (needs auth activation first)

Cart, checkout, orders, subscription management, and account flows depend on the
Supabase Auth cutover (`docs/supabase-auth-cutover.md`). Per the build plan, do
not start those before auth is live on web. Push notifications (the 20h cutoff
reminder) and Realtime delivery tracking are Phase 3.
