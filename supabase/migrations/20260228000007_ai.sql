-- AI chat sessions and messages

CREATE TABLE ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),  -- nullable for guest sessions
  session_token uuid NOT NULL DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  context_patient_id uuid REFERENCES auth.users(id),  -- for family member acting on behalf (Phase 2)
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_chat_sessions_token_unique UNIQUE (session_token)
);

CREATE TABLE ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role ai_message_role NOT NULL,
  content text NOT NULL,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_sessions_user ON ai_chat_sessions(user_id);
CREATE INDEX idx_ai_sessions_token ON ai_chat_sessions(session_token);
CREATE INDEX idx_ai_messages_session ON ai_chat_messages(session_id);
CREATE INDEX idx_ai_messages_created ON ai_chat_messages(created_at);

-- RLS
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Authenticated users see their own sessions
CREATE POLICY "users_own_ai_sessions" ON ai_chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Guest sessions accessible via session_token (handled at Edge Function level with service role)
-- Anon users can create sessions
CREATE POLICY "anon_create_ai_sessions" ON ai_chat_sessions
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Messages accessible if user owns the session
CREATE POLICY "users_own_ai_messages" ON ai_chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ai_chat_sessions
      WHERE ai_chat_sessions.id = ai_chat_messages.session_id
        AND ai_chat_sessions.user_id = auth.uid()
    )
  );

-- Edge Functions use service role for guest message insert/read
