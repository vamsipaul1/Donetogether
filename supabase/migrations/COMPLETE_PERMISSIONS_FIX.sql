-- ============================================
-- FINAL PERMISSIONS & GOVERNANCE FIX
-- Ensures all columns exist and RLS respects them
-- ============================================

-- 1. Ensure all permission columns exist in project_members
ALTER TABLE public.project_members
ADD COLUMN IF NOT EXISTS can_manage_tasks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_invite_members BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_view_analytics BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_edit_project_details BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_timeline BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_restore_tasks BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_resources BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_post_messages BOOLEAN DEFAULT true;

-- 2. Grant full access to Owners
UPDATE public.project_members
SET can_manage_tasks = true,
    can_invite_members = true,
    can_view_analytics = true,
    can_edit_project_details = true,
    can_manage_timeline = true,
    can_restore_tasks = true,
    can_manage_resources = true,
    can_post_messages = true
WHERE role = 'owner';

-- 3. Update RLS for Tasks to respect can_manage_tasks
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.tasks.project_id 
          AND user_id = auth.uid()
          AND (role = 'owner' OR can_manage_tasks = true)
    )
    AND (
        is_project_owner(project_id, auth.uid()) 
        OR is_team_complete(project_id)
    )
  );

DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.tasks.project_id 
          AND user_id = auth.uid()
          AND (role = 'owner' OR can_manage_tasks = true)
    )
    OR (
        is_team_complete(project_id)
        AND assigned_to = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.tasks.project_id 
          AND user_id = auth.uid()
          AND (role = 'owner' OR can_manage_tasks = true)
    )
  );

-- 4. Update RLS for Project Details (Setting)
-- We'll assume project updates are allowed if can_edit_project_details is true
DROP POLICY IF EXISTS "p_update_policy" ON public.projects;
CREATE POLICY "p_update_policy" ON public.projects
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.projects.id 
          AND user_id = auth.uid()
          AND (role = 'owner' OR can_edit_project_details = true)
    )
  );

-- 5. Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Team Permissions System Fully Activated';
END $$;
