# Manual Environment Configuration

This runbook tracks platform and environment configuration that is **not stored in code, migrations, or committed project files** and must be enabled manually in each environment.

Use this whenever setting up a new environment such as local, preview, staging, or production.

## What Belongs Here

Include configuration that lives in:

- Supabase project settings
- Vercel project settings
- GitHub repository settings and secrets
- DNS and custom domain providers
- Third-party dashboards used by auth, messaging, or deployment

Do not use this document for:

- source-controlled application code
- SQL migrations in `supabase/migrations/`
- committed environment templates
- product requirements or feature specs

## Current Manual Configuration

| Area | Manual Configuration | Environment(s) | Where It Is Configured | Status | Notes |
|---|---|---|---|---|---|
| Supabase Auth | Enable email auth provider | All envs | Supabase project Auth configuration | done | Already enabled on the current project |
| Supabase Auth | Enable phone OTP auth provider | All envs | Supabase project Auth configuration | done | Enabled on the current project |
| Supabase Auth | Local redirect allow-list | Local, preview | Supabase Auth URL configuration | done | Includes `http://localhost:5173/**`, `http://127.0.0.1:5173/**`, `https://*.vercel.app/**` |
| Supabase Auth | Development test OTP mapping | Local/dev only | Supabase Auth configuration | done | Previously used on the current project for development validation; removed after Twilio Verify was configured for real SMS delivery |
| Supabase Auth | Real SMS provider credentials | Staging, production | Supabase Auth SMS provider settings | done | Current project is configured with Twilio Verify for real phone OTP delivery; replicate credentials per environment through secure secrets management |
| Twilio Admin | Account recovery code custody | Shared ops ownership | Company password manager / secure vault | pending | Store Twilio recovery codes in a secure vault only; never commit recovery codes, auth tokens, or backup codes to the repository |
| Supabase Auth | Site URL for auth emails and redirects | Staging, production | Supabase Auth URL configuration | pending | Should use the final deployed app domain instead of local defaults |
| Supabase Auth | Redirect URL allow-list for final domains | Preview, staging, production | Supabase Auth URL configuration | pending | Add exact custom-domain URLs and any approved preview URLs |
| Vercel | Project creation and linking | Each deployed env | Vercel dashboard / Vercel CLI | done | Current project is linked to `aryaix/ceenaix` |
| Vercel | Frontend environment variables | Each deployed env | Vercel project environment settings | done | Must include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Vercel | Custom domain connection | Production | Vercel Domains settings + DNS provider | pending | Required for final auth redirects and branded production access |
| GitHub Actions | Deploy secrets for Vercel | Repo / env specific | GitHub repository secrets | done | Includes `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, and Vercel auth token secret(s) |
| GitHub Actions | Build secrets for Supabase client env vars | Repo / env specific | GitHub repository secrets | done | Includes `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |

## Environment Setup Checklist

### Supabase

For each Supabase project:

1. Enable email auth
2. Enable phone auth if OTP login is required
3. Configure allowed redirect URLs for the environment
4. Set the correct `site_url`
5. For development-only testing, optionally configure a test OTP mapping
6. For production OTP, configure a real SMS provider

### Vercel

For each Vercel environment:

1. Create or link the Vercel project
2. Set all required frontend environment variables
3. Verify the production and preview build commands
4. Connect the custom domain when the environment is ready

### GitHub Actions

For each repository or deployment target:

1. Add all required Vercel secrets
2. Add all required Supabase frontend env-var secrets
3. Verify `main` production deploy and pull request preview deploy both succeed

## Production Readiness Items Still Manual

These items are still not complete for a production-grade auth rollout:

- Replicate the Twilio Verify configuration in each deployed environment as needed
- Store Twilio admin recovery codes in a secure vault outside the repository
- Connect the final custom domain in Vercel
- Update Supabase `site_url` to the final custom domain
- Add final custom-domain redirect URLs to the Supabase allow-list
- Remove the temporary development OTP mapping

## Related Files

- `CHECKLIST.md`
- `docs/agent/mvp-scope.md`
- `docs/specs/08-technical-architecture.md`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
