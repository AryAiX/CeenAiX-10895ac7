# CeenAiX

[![CI](https://github.com/AryAiX/CeenAiX-10895ac7/actions/workflows/ci.yml/badge.svg)](https://github.com/AryAiX/CeenAiX-10895ac7/actions/workflows/ci.yml)
[![Deploy to Vercel](https://github.com/AryAiX/CeenAiX-10895ac7/actions/workflows/deploy.yml/badge.svg)](https://github.com/AryAiX/CeenAiX-10895ac7/actions/workflows/deploy.yml)
[![Vercel](https://img.shields.io/badge/deployment-vercel-black?logo=vercel)](https://www.ceenaix.com)
[![React](https://img.shields.io/badge/frontend-React%2018-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

AI-native healthcare platform for the UAE market, built with React, TypeScript, Vite, Supabase, and Vercel.

## Overview

CeenAiX is an MVP-focused healthcare product that supports:

- patient authentication with email/password and phone OTP
- role-based patient and doctor portals
- doctor discovery and appointment booking
- doctor schedule and availability management
- canonical Supabase-backed clinical and identity data models

The current implementation follows a simple rule:

- Bolt remains the visual reference
- product specs define routing, schema, auth, and business logic
- all new MVP work must use the canonical schema only

## Current Status

Completed or live foundations include:

- Supabase Phase 1 schema and RLS baseline
- shared TypeScript types and query hooks
- auth context, route guards, and onboarding flow
- patient appointment booking against real doctor schedules
- doctor schedule management and canonical appointment views
- Vercel hosting plus GitHub Actions CI/CD

The active delivery tracker lives in `CHECKLIST.md`.

## Tech Stack

- Frontend: React 18, TypeScript, Vite 5, Tailwind CSS 3
- Routing: React Router 7
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions, Realtime)
- Hosting: Vercel
- Notifications/Auth integrations: Twilio, Resend, FCM

## Repository Structure

```text
src/
  components/
  hooks/
  lib/
  pages/
    auth/
    patient/
    doctor/
    public/
    admin/
    system/
  types/
supabase/
  migrations/
docs/
  agent/
  specs/
  runbooks/
  report/
```

## Getting Started

### Requirements

- Node.js 20+
- npm
- a Supabase project with the Phase 1 migrations applied
- Vercel CLI only if you need to manage deployments locally

### Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from `env.template.dev`.

For Vite, the app expects:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:5173`.

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run preview
```

## Database and Environment Notes

- Canonical schema migrations live in `supabase/migrations/`
- scheduling and appointment delivery depend on the canonical `appointments`, `doctor_availability`, `blocked_slots`, `specializations`, and `doctor_specializations` tables
- manual environment setup belongs in `docs/runbooks/manual-environment-configuration.md`
- Vercel and Supabase secrets must never be committed to the repo

## Documentation Map

Start here:

- `CHECKLIST.md` — current delivery tracker
- `docs/INDEX.md` — documentation index
- `docs/agent/overview.md` — platform summary and architecture
- `docs/agent/mvp-scope.md` — what is in scope for Phase 1
- `docs/agent/schema-reference.md` — canonical database tables
- `docs/agent/routes-reference.md` — route and data-source reference
- `docs/agent/tech-stack.md` — coding conventions and structure
- `AGENTS.md` — agent implementation rules for this repo

## Deployment

- Production hosting is on Vercel
- CI and deploy workflows live in `.github/workflows/`
- SPA routing is handled through `vercel.json`

If custom domains or production env vars are changed, also review:

- `docs/runbooks/manual-environment-configuration.md`

## Reports

Executive summaries are stored in `docs/report/`.
