-- ==========================================================
-- FIX ALL DATABASE ISSUES (NEAT & CLEAN)
-- Run this in Supabase SQL Editor to fix "column does not exist" errors
-- ==========================================================

-- 1. Fix Tasks Table: Add 'start_date' if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'start_date') THEN
        ALTER TABLE public.tasks ADD COLUMN start_date timestamp with time zone;
        COMMENT ON COLUMN public.tasks.start_date IS 'Task start timeline';
    END IF;
END $$;

-- 2. Fix Tasks Table: Add 'completed_at' if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_at') THEN
        ALTER TABLE public.tasks ADD COLUMN completed_at timestamp with time zone;
    END IF;
END $$;

-- 3. Fix Projects Table: Add timeline columns if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'start_date') THEN
        ALTER TABLE public.projects ADD COLUMN start_date timestamp with time zone;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'end_date') THEN
        ALTER TABLE public.projects ADD COLUMN end_date timestamp with time zone;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'goal') THEN
        ALTER TABLE public.projects ADD COLUMN goal text;
    END IF;
END $$;

-- 4. Enable RLS and Fix Policies (Safe & Idempotent)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 5. Re-apply polished policies (Drop first to avoid duplication errors)
DROP POLICY IF EXISTS "Enable update for project owners" ON public.projects;
CREATE POLICY "Enable update for project owners" ON public.projects
  FOR UPDATE USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = id AND user_id = auth.uid() AND role = 'owner'
    )
  );

-- Output success message
SELECT 'Database schema successfully updated and fixed.' as status;
