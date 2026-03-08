# Tech Stack Reference

> Decisions already made. Follow these when implementing.

## Frontend

- **React 18** with **TypeScript** (strict mode)
- **Vite 5** for dev server and builds
- **Tailwind CSS 3** for styling — utility-first, no CSS modules or styled-components
- **React Router 7** for routing — file-based route structure under `src/pages/`
- **Lucide React** for icons
- **react-i18next** for i18n (Phase 2, but structure code for it from the start)

## State Management

- **React Context** for auth state (current user, role, profile)
- **Supabase client** for server state — query directly, no Redux/TanStack Query in MVP
- **Supabase Realtime** subscriptions for live updates (messages, notifications, appointment status)

## Backend (Supabase)

- **PostgreSQL 15+** — all business data
- **Supabase Auth (GoTrue)** — email/password + phone OTP
- **Supabase Storage** — file uploads (medical docs, photos, insurance cards)
- **Supabase Edge Functions (Deno)** — AI proxy, webhooks, scheduled jobs
- **PostgREST** — auto-generated REST API from Postgres schema
- **Row-Level Security (RLS)** — ALL tables must have RLS enabled; access scoped by `auth.uid()` and role

## AI Integration

- All AI calls go through **Edge Functions** — never call OpenAI from the frontend
- **GPT-4o** for chat, clinical support, document analysis
- **GPT-4o Vision** for photo/document OCR
- **Whisper API** for speech-to-text (Phase 2)
- **text-embedding-3-small** for semantic search
- Stream AI responses via **SSE** (Server-Sent Events)

## File Structure Convention

```
src/
  components/        — Shared UI components
  pages/
    public/          — Home, AIChat, FindDoctor, FindClinic, Insurance, HealthEducation
    auth/            — Login, Register, ForgotPassword, VerifyOTP, Onboarding
    patient/         — All patient pages
    doctor/          — All doctor pages
    admin/           — All admin pages
    system/          — 404, AccessDenied
  lib/
    supabase.ts      — Supabase client instance
    router.tsx       — Route definitions
    auth-context.tsx — Auth provider with user/role state
    ai.ts            — AI Edge Function client helpers
  hooks/             — Custom React hooks
  types/             — TypeScript type definitions
  utils/             — Utility functions
```

## Coding Conventions

- TypeScript strict mode — no `any` types
- Functional components only — no class components
- Named exports — no default exports (except pages for lazy loading)
- Tailwind for all styling — no inline styles or CSS files
- Supabase queries in custom hooks (`useAppointments`, `usePatientProfile`, etc.)
- Error boundaries around major page sections
- Loading skeletons instead of spinners
