-- ============================================
-- AI Logs Table for DoneTogether
-- ============================================
-- This script is idempotent (safe to run multiple times)

-- Create ai_logs table to track AI assistant interactions
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, -- 'task_assistant', 'progress_analyst', 'team_mentor', 'reflection_coach'
  prompt TEXT NOT NULL,
  response JSONB NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_project_id ON ai_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_mode ON ai_logs(mode);

-- Enable Row Level Security
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Users can view their own AI logs" ON ai_logs;
DROP POLICY IF EXISTS "Service role can insert AI logs" ON ai_logs;
DROP POLICY IF EXISTS "Users can delete their own AI logs" ON ai_logs;

-- RLS Policies for ai_logs

-- Users can view their own AI logs
CREATE POLICY "Users can view their own AI logs"
  ON ai_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own AI logs (via edge function)
CREATE POLICY "Service role can insert AI logs"
  ON ai_logs
  FOR INSERT
  WITH CHECK (true); -- Edge function uses service role

-- Users can delete their own AI logs (optional - for privacy)
CREATE POLICY "Users can delete their own AI logs"
  ON ai_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation (safe to re-run)
COMMENT ON TABLE ai_logs IS 'Logs all AI assistant interactions for analytics and debugging';
COMMENT ON COLUMN ai_logs.mode IS 'AI mode: task_assistant, progress_analyst, team_mentor, or reflection_coach';
COMMENT ON COLUMN ai_logs.response IS 'Structured AI response in JSON format';
COMMENT ON COLUMN ai_logs.tokens_used IS 'Number of tokens consumed by this AI request';
