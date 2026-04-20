-- -----------------------------------------------------------------------------
-- Populate status_label, category_color, trend_direction, and reference_zones
-- on Patient 1's lab_order_items so the Recent Results tab renders the Bolt
-- reference UI (test-specific status pills, colored accents, multi-band range
-- bar, authoritative trend direction).
--
-- Uses PostgreSQL escape-string literals (E'…') so the ⚠️ and ✅ emojis land as
-- real Unicode. Don't replace with the generic '…' form or Supabase's SQL
-- pipeline will persist them as literal \\u26A0 / \\u2705 text.
-- -----------------------------------------------------------------------------

-- HbA1c recent (5 March 2026): 6.8% pre-diabetic, improving from 7.4% → 6.8%.
UPDATE public.lab_order_items
SET
  status_label    = E'\u26A0\uFE0F Pre-diabetic',
  category_color  = '#F59E0B',
  trend_direction = 'improving',
  reference_zones = '[
    {"label": "Normal",       "max": 5.7,               "color": "#059669"},
    {"label": "Pre-diabetic", "min": 5.7, "max": 6.4,   "color": "#F59E0B"},
    {"label": "Diabetic",     "min": 6.5,               "color": "#EF4444"}
  ]'::jsonb
WHERE id = 'bbbbbbb1-0000-4000-8000-000000000001';

-- Fasting Glucose 118 mg/dL — elevated (pre-diabetic range), improving.
UPDATE public.lab_order_items
SET
  status_label    = E'\u26A0\uFE0F Elevated',
  category_color  = '#F59E0B',
  trend_direction = 'improving',
  reference_zones = '[
    {"label": "Normal",       "max": 100,               "color": "#059669"},
    {"label": "Pre-diabetic", "min": 100, "max": 125,   "color": "#F59E0B"},
    {"label": "Diabetic",     "min": 126,               "color": "#EF4444"}
  ]'::jsonb
WHERE id = 'bbbbbbb1-0000-4000-8000-000000000002';

-- Lipid Panel parent — all sub-tests normal; rendered as a table, no zones.
UPDATE public.lab_order_items
SET
  status_label    = E'\u2705 All Normal',
  category_color  = '#059669',
  trend_direction = 'stable'
WHERE id = 'bbbbbbb1-0000-4000-8000-000000000003';

-- Vitamin D 22 ng/mL — insufficient, improving from 18 in Dec 2025.
UPDATE public.lab_order_items
SET
  status_label    = E'\u26A0\uFE0F Insufficient',
  category_color  = '#F59E0B',
  trend_direction = 'improving',
  reference_zones = '[
    {"label": "Deficient",    "max": 20,                "color": "#EF4444"},
    {"label": "Insufficient", "min": 20, "max": 29,     "color": "#F59E0B"},
    {"label": "Sufficient",   "min": 30, "max": 80,     "color": "#059669"}
  ]'::jsonb
WHERE id = 'bbbbbbb1-0000-4000-8000-000000000004';

-- CBC parent — all normal.
UPDATE public.lab_order_items
SET
  status_label    = E'\u2705 All Normal',
  category_color  = '#059669',
  trend_direction = 'stable'
WHERE id = 'bbbbbbb1-0000-4000-8000-000000000005';

-- CRP 3.2 mg/L — mild elevation, monitor.
UPDATE public.lab_order_items
SET
  status_label    = E'\u26A0\uFE0F Monitor',
  category_color  = '#F59E0B',
  trend_direction = 'stable',
  reference_zones = '[
    {"label": "Low Risk", "max": 3.0,                   "color": "#059669"},
    {"label": "Monitor",  "min": 3.0, "max": 10.0,      "color": "#F59E0B"},
    {"label": "High",     "min": 10.0,                  "color": "#EF4444"}
  ]'::jsonb
WHERE id = 'bbbbbbb1-0000-4000-8000-000000000006';

-- Historical HbA1c rows (older visits) keep amber accent + improving direction
-- so the Trends tab stays visually consistent.
UPDATE public.lab_order_items
SET
  category_color  = '#F59E0B',
  trend_direction = 'improving',
  reference_zones = '[
    {"label": "Normal",       "max": 5.7,               "color": "#059669"},
    {"label": "Pre-diabetic", "min": 5.7, "max": 6.4,   "color": "#F59E0B"},
    {"label": "Diabetic",     "min": 6.5,               "color": "#EF4444"}
  ]'::jsonb
WHERE id IN (
  'bbbbbbb2-2026-4000-0110-000000000001',  -- HbA1c 7.0 (Jan 2026)
  'bbbbbbb3-2025-4114-0000-000000000001',  -- HbA1c 7.1 (Dec 2025)
  'bbbbbbb4-2025-4922-0000-000000000001'   -- HbA1c 7.4 (Sep 2025)
);

-- Historical Vitamin D 18 ng/mL (Dec 2025).
UPDATE public.lab_order_items
SET
  category_color  = '#F59E0B',
  trend_direction = 'improving',
  reference_zones = '[
    {"label": "Deficient",    "max": 20,                "color": "#EF4444"},
    {"label": "Insufficient", "min": 20, "max": 29,     "color": "#F59E0B"},
    {"label": "Sufficient",   "min": 30, "max": 80,     "color": "#059669"}
  ]'::jsonb
WHERE id = 'bbbbbbb2-2026-4000-0110-000000000002';

-- Upcoming lab order parent rows — soft cyan accent so no finding is implied.
UPDATE public.lab_order_items
SET category_color = '#06B6D4'
WHERE id::text LIKE 'ccccccc5-2026-4304-%';
