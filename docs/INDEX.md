# CeenAiX Documentation Index

## Agent Quick-Reference (`docs/agent/`)

Start here when developing. These are condensed, action-oriented summaries.

| File | Purpose |
|---|---|
| [overview.md](agent/overview.md) | Platform summary, tech stack, roles, architecture decisions |
| [mvp-scope.md](agent/mvp-scope.md) | What to build in Phase 1 — pages, features, tables, infrastructure |
| [schema-reference.md](agent/schema-reference.md) | Database tables with columns, types, and relationships |
| [routes-reference.md](agent/routes-reference.md) | All MVP routes with components and data sources |
| [tech-stack.md](agent/tech-stack.md) | Technology choices, file structure, coding conventions |
| [ai-reference.md](agent/ai-reference.md) | AI features, Edge Function patterns, model usage |
| [bolt-code-audit.md](agent/bolt-code-audit.md) | Bolt prototype conflicts, table mapping, migration guide |
| [ui-parity-plan.md](agent/ui-parity-plan.md) | UI parity pass (UX-4-6-3): ground rules, tiers, execution order, screenshot workflow |

## Detailed Specifications (`docs/specs/`)

Full product design spec — consult when you need complete feature details.

| File | Section |
|---|---|
| [01-purpose-and-scope.md](specs/01-purpose-and-scope.md) | Document purpose, platform identity |
| [02-user-roles.md](specs/02-user-roles.md) | All user roles with complete feature tables |
| [03-platform-sitemap.md](specs/03-platform-sitemap.md) | Platform zones, page inventory per role |
| [04-user-flows.md](specs/04-user-flows.md) | 13 step-by-step user flows |
| [05-ai-capabilities.md](specs/05-ai-capabilities.md) | AI capability matrix by role |
| [06-privacy-and-compliance.md](specs/06-privacy-and-compliance.md) | Consent, data residency, AI transparency |
| [07-glossary.md](specs/07-glossary.md) | Term definitions |
| [08-technical-architecture.md](specs/08-technical-architecture.md) | System architecture, tech stack, security, multi-tenancy |
| [09-data-model.md](specs/09-data-model.md) | Full data model, entity list, relationships, schema decisions |
| [10-integrations.md](specs/10-integrations.md) | All 9 external integrations |
| [11-non-functional-requirements.md](specs/11-non-functional-requirements.md) | Performance, scalability, availability, accessibility, i18n, retention |
| [13-phased-roadmap.md](specs/13-phased-roadmap.md) | 4-phase delivery plan with feature checklists |
| [14-route-map.md](specs/14-route-map.md) | Complete route map (90+ routes across all roles and phases) |

## Runbooks (`docs/runbooks/`)

Operational notes for configuration and platform setup that are not stored in source code.

| File | Purpose |
|---|---|
| [manual-environment-configuration.md](runbooks/manual-environment-configuration.md) | Tracks manual Supabase, Vercel, GitHub, DNS, and auth-related configuration required per environment |

## Root Files

| File | Purpose |
|---|---|
| [AGENTS.md](../AGENTS.md) | AI agent instructions — read this first |
| [CHECKLIST.md](../CHECKLIST.md) | Development tracker — current status, what to build next |
| [.cursor/rules/ceenaix.mdc](../.cursor/rules/ceenaix.mdc) | Cursor-specific coding rules |
