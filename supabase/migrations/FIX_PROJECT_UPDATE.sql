-- ==========================================================
-- FIX PROJECT UPDATE PERMISSIONS
-- Run this in Supabase SQL Editor to fix "Failed to update project"
-- ==========================================================

-- 1. Enable RLS on projects (if not already)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Enable update for project owners" ON public.projects;
DROP POLICY IF EXISTS "Projects update policy" ON public.projects;

-- 3. Create a comprehensive update policy
-- This allows a user to update a project IF:
--   a) They created it (created_by)
--   OR
--   b) They are a project member with role 'owner'
CREATE POLICY "Enable update for project owners" ON public.projects
  FOR UPDATE USING (
    auth.uid() = created_by 
    OR 
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- 4. Ensure the new columns are accessible (not strictly needed for superuser but good for clarity)
COMMENT ON COLUMN public.projects.start_date IS 'Project start timestamp';
COMMENT ON COLUMN public.projects.end_date IS 'Project end timestamp';
COMMENT ON COLUMN public.projects.goal IS 'Project goal description';
