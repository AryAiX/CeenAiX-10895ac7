-- Messaging helper RPCs for opening direct threads and marking messages as read.

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
  p_other_user_id uuid,
  p_subject text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid := auth.uid();
  v_conversation_id uuid;
BEGIN
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.';
  END IF;

  IF p_other_user_id IS NULL OR p_other_user_id = v_current_user_id THEN
    RAISE EXCEPTION 'A different participant is required.';
  END IF;

  SELECT id
  INTO v_conversation_id
  FROM public.conversations
  WHERE jsonb_array_length(participant_ids) = 2
    AND participant_ids @> jsonb_build_array(v_current_user_id::text, p_other_user_id::text)
  ORDER BY last_message_at DESC NULLS LAST, created_at DESC
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  INSERT INTO public.conversations (
    created_by,
    participant_ids,
    subject,
    last_message_at
  )
  VALUES (
    v_current_user_id,
    jsonb_build_array(v_current_user_id::text, p_other_user_id::text),
    COALESCE(NULLIF(btrim(p_subject), ''), 'Care conversation'),
    NULL
  )
  RETURNING id INTO v_conversation_id;

  RETURN v_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(p_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid := auth.uid();
  v_updated_count integer := 0;
BEGIN
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = p_conversation_id
      AND (
        created_by = v_current_user_id
        OR participant_ids ? v_current_user_id::text
      )
  ) THEN
    RAISE EXCEPTION 'Conversation not found.';
  END IF;

  UPDATE public.messages
  SET read_at = now()
  WHERE conversation_id = p_conversation_id
    AND sender_id <> v_current_user_id
    AND read_at IS NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_messages_read(uuid) TO authenticated;
