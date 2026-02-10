-- Create ai_logs table for tracking AI interactions
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response JSONB NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI logs
CREATE POLICY "Users can view own AI logs"
  ON ai_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own AI logs
CREATE POLICY "Users can create own AI logs"
  ON ai_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS ai_logs_user_id_idx ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS ai_logs_project_id_idx ON ai_logs(project_id);
CREATE INDEX IF NOT EXISTS ai_logs_created_at_idx ON ai_logs(created_at DESC);
