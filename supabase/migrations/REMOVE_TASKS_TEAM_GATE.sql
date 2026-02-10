-- ============================================
-- Fix: Remove Team Completion Gating from Tasks
-- Goal: Allow members to manage tasks even before the team is full
-- ============================================

-- 1. Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

-- 2. SELECT: Members can always see tasks in their project
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.tasks.project_id 
          AND user_id = auth.uid()
    )
  );

-- 3. INSERT: Members with permission can create tasks
CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.tasks.project_id 
          AND user_id = auth.uid()
          AND (role = 'owner' OR can_manage_tasks = true)
    )
  );

-- 4. UPDATE: Owners can update anything, Assigned users can update their tasks anytime
CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.tasks.project_id 
          AND user_id = auth.uid()
          AND (role = 'owner' OR can_manage_tasks = true)
    )
    OR (assigned_to = auth.uid())
  );

-- 5. DELETE: Owners or those with permission can delete
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

-- 6. Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Task RLS Policies updated: Team gating REMOVED. Collaboration is now unrestricted.';
END $$;
