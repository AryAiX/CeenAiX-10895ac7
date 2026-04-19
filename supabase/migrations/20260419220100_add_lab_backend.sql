-- Lab role backend: labs, lab assignment on orders, role-gated RLS, and RPCs
-- for the lab worklist (claim order, start processing, save results, release).
--
-- All new tables use `IF NOT EXISTS` and policies are replaced idempotently so
-- the migration is rerunnable.

-- ---------------------------------------------------------------------------
-- lab_profiles: one row per physical lab the platform serves. A user with the
-- `lab` role works on behalf of a single lab (1:many staff -> lab).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lab_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  city text,
  address text,
  phone text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_profiles_active
  ON public.lab_profiles(is_active);

DROP TRIGGER IF EXISTS trg_lab_profiles_updated_at ON public.lab_profiles;
CREATE TRIGGER trg_lab_profiles_updated_at
  BEFORE UPDATE ON public.lab_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.lab_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_profiles_read_authenticated" ON public.lab_profiles;
CREATE POLICY "lab_profiles_read_authenticated"
  ON public.lab_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "lab_profiles_admin_manage" ON public.lab_profiles;
CREATE POLICY "lab_profiles_admin_manage"
  ON public.lab_profiles
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

-- ---------------------------------------------------------------------------
-- lab_staff: join between auth users with role = 'lab' and a lab_profile.
-- Lab staff only see orders assigned to their lab.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lab_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES public.lab_profiles(id) ON DELETE CASCADE,
  role_label text NOT NULL DEFAULT 'technician',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lab_staff_user_lab_unique UNIQUE (user_id, lab_id)
);

CREATE INDEX IF NOT EXISTS idx_lab_staff_user ON public.lab_staff(user_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_lab_staff_lab ON public.lab_staff(lab_id) WHERE is_active;

DROP TRIGGER IF EXISTS trg_lab_staff_updated_at ON public.lab_staff;
CREATE TRIGGER trg_lab_staff_updated_at
  BEFORE UPDATE ON public.lab_staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.lab_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_staff_read_self" ON public.lab_staff;
CREATE POLICY "lab_staff_read_self"
  ON public.lab_staff
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lab_staff_admin_manage" ON public.lab_staff;
CREATE POLICY "lab_staff_admin_manage"
  ON public.lab_staff
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

-- ---------------------------------------------------------------------------
-- Add assigned_lab_id to lab_orders so labs can filter their worklist.
-- Existing orders keep assigned_lab_id = NULL ("unassigned").
-- ---------------------------------------------------------------------------

ALTER TABLE public.lab_orders
  ADD COLUMN IF NOT EXISTS assigned_lab_id uuid REFERENCES public.lab_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lab_orders_assigned_lab
  ON public.lab_orders(assigned_lab_id, status)
  WHERE NOT is_deleted;

-- ---------------------------------------------------------------------------
-- Helper: boolean "is the current user a member of this lab?"
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_current_user_in_lab(target_lab_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lab_staff ls
    WHERE ls.user_id = auth.uid()
      AND ls.lab_id = target_lab_id
      AND ls.is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_in_lab(uuid) TO authenticated;

-- Helper: current user's primary lab_id (the first active membership)
CREATE OR REPLACE FUNCTION public.current_user_lab_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ls.lab_id
  FROM public.lab_staff ls
  WHERE ls.user_id = auth.uid()
    AND ls.is_active = true
  ORDER BY ls.created_at
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_lab_id() TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS: lab role can see lab_orders + lab_order_items for their assigned lab
-- (or unassigned orders -- they act as a queue the lab can claim).
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "lab_staff_read_lab_orders" ON public.lab_orders;
CREATE POLICY "lab_staff_read_lab_orders"
  ON public.lab_orders
  FOR SELECT
  USING (
    NOT is_deleted
    AND (
      assigned_lab_id IS NULL
      OR public.is_current_user_in_lab(assigned_lab_id)
    )
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'lab'
    )
  );

DROP POLICY IF EXISTS "lab_staff_update_lab_orders" ON public.lab_orders;
CREATE POLICY "lab_staff_update_lab_orders"
  ON public.lab_orders
  FOR UPDATE
  USING (
    NOT is_deleted
    AND (
      assigned_lab_id IS NULL
      OR public.is_current_user_in_lab(assigned_lab_id)
    )
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'lab'
    )
  )
  WITH CHECK (
    NOT is_deleted
    AND assigned_lab_id IS NOT NULL
    AND public.is_current_user_in_lab(assigned_lab_id)
  );

DROP POLICY IF EXISTS "lab_staff_read_lab_items" ON public.lab_order_items;
CREATE POLICY "lab_staff_read_lab_items"
  ON public.lab_order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_orders lo
      WHERE lo.id = lab_order_items.lab_order_id
        AND NOT lo.is_deleted
        AND (
          lo.assigned_lab_id IS NULL
          OR public.is_current_user_in_lab(lo.assigned_lab_id)
        )
    )
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'lab'
    )
  );

DROP POLICY IF EXISTS "lab_staff_update_lab_items" ON public.lab_order_items;
CREATE POLICY "lab_staff_update_lab_items"
  ON public.lab_order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_orders lo
      WHERE lo.id = lab_order_items.lab_order_id
        AND NOT lo.is_deleted
        AND lo.assigned_lab_id IS NOT NULL
        AND public.is_current_user_in_lab(lo.assigned_lab_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lab_orders lo
      WHERE lo.id = lab_order_items.lab_order_id
        AND NOT lo.is_deleted
        AND lo.assigned_lab_id IS NOT NULL
        AND public.is_current_user_in_lab(lo.assigned_lab_id)
    )
  );

-- Allow the lab to also read basic patient + doctor user_profiles rows for
-- orders they are working on, so the worklist can show names.
DROP POLICY IF EXISTS "lab_staff_read_user_profiles" ON public.user_profiles;
CREATE POLICY "lab_staff_read_user_profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.lab_orders lo
      WHERE NOT lo.is_deleted
        AND (
          lo.assigned_lab_id IS NULL
          OR public.is_current_user_in_lab(lo.assigned_lab_id)
        )
        AND (lo.patient_id = user_profiles.user_id OR lo.doctor_id = user_profiles.user_id)
    )
    AND EXISTS (
      SELECT 1 FROM public.user_profiles self
      WHERE self.user_id = auth.uid() AND self.role = 'lab'
    )
  );

-- ---------------------------------------------------------------------------
-- RPC: lab_claim_order
-- Assign an unassigned (or already-assigned-to-current-lab) order to the
-- current user's lab and move it into the 'collected' status.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.lab_claim_order(target_order_id uuid)
RETURNS public.lab_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_lab uuid;
  updated_row public.lab_orders%ROWTYPE;
BEGIN
  current_lab := public.current_user_lab_id();

  IF current_lab IS NULL THEN
    RAISE EXCEPTION 'You are not a member of any lab.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_orders lo
  SET assigned_lab_id = current_lab,
      status = CASE WHEN lo.status = 'ordered' THEN 'collected'::lab_order_status ELSE lo.status END,
      updated_at = now()
  WHERE lo.id = target_order_id
    AND NOT lo.is_deleted
    AND (lo.assigned_lab_id IS NULL OR lo.assigned_lab_id = current_lab)
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'Order not found or already claimed by another lab.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_order_items
  SET status = CASE WHEN status = 'ordered' THEN 'collected'::lab_order_status ELSE status END,
      updated_at = now()
  WHERE lab_order_id = updated_row.id;

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lab_claim_order(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: lab_start_processing — move a claimed order into processing.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.lab_start_processing(target_order_id uuid)
RETURNS public.lab_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_lab uuid;
  updated_row public.lab_orders%ROWTYPE;
BEGIN
  current_lab := public.current_user_lab_id();

  IF current_lab IS NULL THEN
    RAISE EXCEPTION 'You are not a member of any lab.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_orders lo
  SET status = 'processing'::lab_order_status,
      updated_at = now()
  WHERE lo.id = target_order_id
    AND NOT lo.is_deleted
    AND lo.assigned_lab_id = current_lab
    AND lo.status IN ('ordered', 'collected')
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'Order not found or not claimed by your lab.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_order_items
  SET status = CASE WHEN status IN ('ordered', 'collected') THEN 'processing'::lab_order_status ELSE status END,
      updated_at = now()
  WHERE lab_order_id = updated_row.id;

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lab_start_processing(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: lab_save_item_result — write a per-test result without releasing the
-- whole order. The lab uses this for structured result entry.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.lab_save_item_result(
  target_item_id uuid,
  result_value text,
  result_unit text,
  reference_range text,
  is_abnormal boolean
)
RETURNS public.lab_order_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_lab uuid;
  target_order_id uuid;
  updated_row public.lab_order_items%ROWTYPE;
BEGIN
  current_lab := public.current_user_lab_id();

  IF current_lab IS NULL THEN
    RAISE EXCEPTION 'You are not a member of any lab.' USING ERRCODE = 'P0001';
  END IF;

  SELECT loi.lab_order_id INTO target_order_id
  FROM public.lab_order_items loi
  JOIN public.lab_orders lo ON lo.id = loi.lab_order_id
  WHERE loi.id = target_item_id
    AND NOT lo.is_deleted
    AND lo.assigned_lab_id = current_lab
  LIMIT 1;

  IF target_order_id IS NULL THEN
    RAISE EXCEPTION 'Lab item not found or not assigned to your lab.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_order_items loi
  SET result_value = lab_save_item_result.result_value,
      result_unit = lab_save_item_result.result_unit,
      reference_range = lab_save_item_result.reference_range,
      is_abnormal = lab_save_item_result.is_abnormal,
      status = 'resulted'::lab_order_status,
      resulted_at = COALESCE(loi.resulted_at, now()),
      updated_at = now()
  WHERE loi.id = target_item_id
  RETURNING * INTO updated_row;

  -- When every item on the order has been resulted, move the order itself
  -- into 'resulted' (the doctor still needs to 'review' it).
  UPDATE public.lab_orders lo
  SET status = 'resulted'::lab_order_status,
      updated_at = now()
  WHERE lo.id = target_order_id
    AND lo.status IN ('ordered', 'collected', 'processing')
    AND NOT EXISTS (
      SELECT 1 FROM public.lab_order_items loi2
      WHERE loi2.lab_order_id = target_order_id
        AND loi2.status NOT IN ('resulted', 'reviewed')
    );

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lab_save_item_result(uuid, text, text, text, boolean) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: lab_release_order — when all items are resulted the lab marks the
-- whole order as 'resulted' (final release) so it shows up for the patient
-- + doctor. Idempotent: if the order was already released it is a no-op.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.lab_release_order(target_order_id uuid)
RETURNS public.lab_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_lab uuid;
  incomplete_count int;
  updated_row public.lab_orders%ROWTYPE;
BEGIN
  current_lab := public.current_user_lab_id();

  IF current_lab IS NULL THEN
    RAISE EXCEPTION 'You are not a member of any lab.' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*)
  INTO incomplete_count
  FROM public.lab_order_items loi
  JOIN public.lab_orders lo ON lo.id = loi.lab_order_id
  WHERE lo.id = target_order_id
    AND lo.assigned_lab_id = current_lab
    AND NOT lo.is_deleted
    AND loi.status NOT IN ('resulted', 'reviewed');

  IF incomplete_count > 0 THEN
    RAISE EXCEPTION 'Some tests on this order do not have results yet.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_orders lo
  SET status = 'resulted'::lab_order_status,
      updated_at = now()
  WHERE lo.id = target_order_id
    AND lo.assigned_lab_id = current_lab
    AND NOT lo.is_deleted
    AND lo.status IN ('ordered', 'collected', 'processing')
  RETURNING * INTO updated_row;

  -- If no row was updated because the order was already 'resulted' / 'reviewed'
  -- just re-read and return it (idempotent).
  IF updated_row.id IS NULL THEN
    SELECT * INTO updated_row
    FROM public.lab_orders lo2
    WHERE lo2.id = target_order_id
      AND lo2.assigned_lab_id = current_lab
      AND NOT lo2.is_deleted;

    IF updated_row.id IS NULL THEN
      RAISE EXCEPTION 'Order not found or not assigned to your lab.' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- Notify the patient that their results are ready.
  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  VALUES (
    updated_row.patient_id,
    'lab_result',
    'Your lab results are ready',
    'Open the lab results page to review and, if needed, ask the AI assistant for a plain-language explanation.',
    '/patient/lab-results'
  );

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lab_release_order(uuid) TO authenticated;
