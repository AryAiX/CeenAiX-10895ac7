# 11. Non-Functional Requirements

---

## 11.1 Performance

| Metric | Target | Measurement |
|---|---|---|
| Page Load (initial) | < 2 seconds (LCP) | Lighthouse CI |
| Page Navigation (SPA) | < 300ms | React Profiler + Sentry |
| API Response (Supabase REST) | < 200ms (p95) | Supabase dashboard |
| AI Chat First Token | < 1 second | Edge Function instrumentation |
| AI Chat Full Response | < 8 seconds (p95) | Edge Function instrumentation |
| Video Call Connection | < 3 seconds | LiveKit metrics |
| Search Results | < 500ms | PostgREST query timing |
| File Upload (< 10MB) | < 5 seconds | Supabase Storage metrics |
| Database Query (complex) | < 100ms (p95) | pg_stat_statements |

**Optimization strategies**: Code splitting (React.lazy), WebP images with lazy loading, database indexes on FKs and filtered columns, CDN caching (Vercel Edge), AI response streaming (SSE).

---

## 11.2 Scalability

| Dimension | Year 1 | Year 3 | Scaling Approach |
|---|---|---|---|
| Registered Users | 50,000 | 500,000 | Supabase Pro/Enterprise; read replicas |
| Concurrent Users | 2,000 | 20,000 | Edge CDN + PgBouncer connection pooling |
| Daily Appointments | 1,000 | 25,000 | Database partitioning by date |
| Active AI Chat Sessions | 200 concurrent | 2,000 concurrent | Edge Function horizontal scaling |
| Video Consultations | 50 concurrent | 500 concurrent | LiveKit cloud auto-scaling |
| Storage (files) | 500 GB | 10 TB | Supabase Storage (S3-backed) |
| Database Size | 50 GB | 500 GB | Partitioning + archival strategy |

---

## 11.3 Availability & Reliability

**Target**: 99.9% uptime (~8.7 hours downtime/year)

**Degradation hierarchy** (if components fail):
1. AI unavailable → manual workflows remain operational
2. Video unavailable → fallback to audio-only → asynchronous messaging
3. Payment unavailable → "pay later" option; retry on recovery
4. SMS unavailable → email fallback for OTP and notifications
5. Database degraded → read replica serves dashboards; writes queued

**Disaster recovery**: PITR with 7-day retention; daily snapshots for 30 days; RTO < 4 hours; RPO < 1 hour.

---

## 11.4 Accessibility

**Target**: WCAG 2.1 Level AA

- All interactive elements keyboard-navigable with visible focus indicators
- Color contrast minimum 4.5:1 (normal text), 3:1 (large text)
- Meaningful alt text on all images and icons
- Form inputs with associated labels; programmatic error linking
- Semantic HTML (landmarks, heading hierarchy, ARIA roles)
- Touch targets minimum 44x44px
- Video consultations: closed captioning via AI transcription
- AI chat: voice input option for motor impairments
- Respect `prefers-reduced-motion`
- Testing: axe-core in CI + manual screen reader testing (VoiceOver, NVDA)

---

## 11.5 Localization

**Launch languages**: English (default), Arabic (full RTL)

**Phase 2**: Urdu, Hindi, Tagalog, Malayalam

**Implementation**:
- `react-i18next` with namespace-based translation files
- Tailwind CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`) for RTL
- Date/time displayed in user locale; stored as UTC
- Locale-aware number formatting
- AI auto-detects language; can be explicitly set in preferences
- Health articles and templates maintained in all supported languages

---

## 11.6 Data Retention

| Data Category | Retention | Archival |
|---|---|---|
| Clinical records (PHR) | Indefinite | Active DB; partitioned by year after 5 years |
| Consultation transcripts | 10 years | Cold storage (S3 Glacier) after 2 years |
| Audio recordings | Deleted after transcription | Not retained |
| AI chat sessions (guest) | 30 days | Auto-deleted via scheduled job |
| AI chat sessions (authenticated) | 5 years | Cold storage after 1 year |
| Audit logs | 7 years | Partitioned by month; cold storage after 1 year |
| Payment records | 7 years | Financial compliance requirement |
| Temporary uploads (guest) | Session-scoped | Deleted when session ends or after 24 hours |
