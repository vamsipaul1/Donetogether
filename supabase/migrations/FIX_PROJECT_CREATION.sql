-- ==============================================================================
-- FIX PROJECT CREATION - Add Missing Columns to Projects Table
-- ==============================================================================
-- This migration adds all required columns for project creation to work properly
-- Run this in Supabase SQL Editor to fix "Failed to create project" error
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add team_name column with unique constraint
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Create unique index for team_name (allows NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_team_name_unique 
ON public.projects (team_name) 
WHERE team_name IS NOT NULL;

-- Create searchable index for team_name fuzzy search
CREATE INDEX IF NOT EXISTS idx_projects_team_name_search 
ON public.projects USING gin (team_name gin_trgm_ops) 
WHERE team_name IS NOT NULL;

-- 3. Add project timeline columns
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- 4. Add team metadata columns
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS expected_team_size INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS is_team_complete BOOLEAN DEFAULT false;

-- 5. Ensure onboarding_completed column exists in users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 6. Update existing projects with default values
UPDATE public.projects 
SET expected_team_size = 4 
WHERE expected_team_size IS NULL;

UPDATE public.projects 
SET is_team_complete = false 
WHERE is_team_complete IS NULL;

-- 7. Analyze tables for performance optimization
ANALYZE public.projects;
ANALYZE public.users;

-- Success message
SELECT 'Project creation schema successfully fixed! You can now create projects.' as status;
