-- ==============================================================================
-- 🛠️ FINAL DATABASE FIX - RUN THIS FIRST
-- ==============================================================================
-- This script repairs the schema to ensure Project Creation and Deletion work.
-- Run this in your Supabase SQL Editor.

-- 1. FIX PROJECTS TABLE COLUMNS
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expected_team_size INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS is_team_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. FIX USERS TABLE COLUMNS
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 3. DROP RESTRICTIVE CONSTRAINTS (Crucial for fixing "Failed to create project")
-- This removes the "4, 5, 6" restriction and the unique constraint issues
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_expected_team_size_check;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_team_name_key;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_team_name_unique;

-- 4. ADD CLEAN CONSTRAINTS
-- Add a proper unique constraint for team_name so "ON CONFLICT" works
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_team_name_unique') THEN
        ALTER TABLE public.projects ADD CONSTRAINT projects_team_name_unique UNIQUE (team_name);
    END IF;
END $$;

-- 5. FIX PROJECT DELETION (Enable CASCADE so sub-items are deleted)
ALTER TABLE IF EXISTS public.chat_rooms 
DROP CONSTRAINT IF EXISTS chat_rooms_project_id_fkey,
ADD CONSTRAINT chat_rooms_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.project_members 
DROP CONSTRAINT IF EXISTS project_members_project_id_fkey,
ADD CONSTRAINT project_members_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.tasks 
DROP CONSTRAINT IF EXISTS tasks_project_id_fkey,
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 6. FIX RLS POLICIES (Simplified for smooth working)
DROP POLICY IF EXISTS "p_owner_all" ON public.projects;
DROP POLICY IF EXISTS "p_read_all" ON public.projects;
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;

CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid() AND role = 'owner'));
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 7. FIX TASK RLS (Allows dragging/moving)
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

CREATE POLICY "tasks_access" ON public.tasks FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.project_members WHERE project_id = tasks.project_id AND user_id = auth.uid()));

-- Success Message
SELECT '✅ Database Schema Successfully Fixed!' as status;
