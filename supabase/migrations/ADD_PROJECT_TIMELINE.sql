-- Migration: Add Project Timeline and Team Metadata
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expected_team_size INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS is_team_complete BOOLEAN DEFAULT false;

-- Update existing projects to have default values if needed
UPDATE public.projects SET expected_team_size = 4 WHERE expected_team_size IS NULL;
UPDATE public.projects SET is_team_complete = false WHERE is_team_complete IS NULL;
