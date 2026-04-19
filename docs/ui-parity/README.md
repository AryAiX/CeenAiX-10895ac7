# UI Parity Pass — Visual Verification

This directory is the on-disk record for the UI parity pass
(`CHECKLIST.md` section 17, plan in `docs/agent/ui-parity-plan.md`).
Every port is backed by **before/after screenshots per route per
viewport**:

```
docs/ui-parity/<route-id>/<viewport>/
  before.png     canonical CeenAiX BEFORE the port   (baseline)
  after.png      canonical CeenAiX AFTER the port    (what we ship)
  reference.png  local design reference render       (eyeball only; not shipped)
```

- `<route-id>` matches entries in `scripts/ui-parity-routes.json`
  (e.g. `patient-dashboard`, `doctor-messages`).
- `<viewport>` is one of `desktop`, `tablet`, `mobile` (widths
  1440 / 1024 / 390 — see the `viewports` block in the JSON).
- `reference.png` is generated from a local, git-ignored design
  reference snapshot and is **never committed**. It exists only as a
  local aid while porting.

## How it is produced

1. Start both dev servers side-by-side (canonical on `:5173`, reference
   on `:5174`):

   ```bash
   npm run ui-parity:up
   ```

2. Capture the **before** baselines once per tier before any porting:

   ```bash
   npm run ui-parity:before
   # scoped: node scripts/ui-parity-capture.mjs --phase=before --route=patient-dashboard
   ```

3. Port the UI on `UX-4-6-3` per the ground rules in
   `docs/agent/ui-parity-plan.md`. Never modify data fetching, hooks,
   types, Supabase client calls, router config, or auth context during
   tiers 1–5.

4. Capture the **after** render:

   ```bash
   npm run ui-parity:after
   # scoped while iterating: --route=patient-dashboard --viewport=desktop
   ```

5. Diff `before.png` vs `after.png` (optionally against
   `reference.png`). `after.png` should present the refreshed,
   unified visual treatment while preserving every feature visible
   in `before.png`. PNGs are git-ignored — reviewers regenerate them
   locally on demand.

## Acceptance criteria (per UIP row)

A parity row in `CHECKLIST.md` section 17 moves to `done` only when
**all** are true:

- `before.png` and `after.png` exist for the route across every
  applicable viewport.
- `after.png` preserves every feature visible in `before.png`. The
  refresh is visual only — no feature surface is hidden or removed to
  make the layout cleaner.
- `git diff src/hooks src/lib/supabase.ts src/lib/auth-context.tsx src/types src/lib/router.tsx`
  is empty for the port commit during tiers 1–5 (safety rail — proves
  no functional drift). Tiers 6–7 may add new routes; those router
  edits are narrowly scoped and called out in the commit message.
- `npm run typecheck` and `npm run lint` pass.
- The commit message is scoped to the tier (e.g.
  `feat(ui-parity): global chrome tokens + sidebar/topnav polish`).

## Canonical-only routes

Some routes exist only on the canonical side (e.g.
`/patient/appointments/book`, `/auth/verify-otp`). Those routes are
captured as `before.png` / `after.png` only; `reference.png` is
absent. The `null` in `scripts/ui-parity-routes.json` signals "no
reference counterpart."

## Auth-gated routes

Canonical routes under `/patient/*` and `/doctor/*` redirect
unauthenticated visitors to `/auth/login`. The capture script seeds a
real Supabase session via `UI_PARITY_PATIENT_EMAIL` /
`UI_PARITY_PATIENT_PASSWORD` (and doctor equivalents) when those env
vars are set, so gated pages render their real content. When the env
vars are not set, the capture falls back to the redirect — still
useful for verifying the auth-page treatment.
