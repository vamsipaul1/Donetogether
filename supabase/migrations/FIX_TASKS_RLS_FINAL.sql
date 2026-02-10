-- ============================================
-- Fix: Task Management RLS Policies
-- Goal: Allow Owners to Manage Tasks Even if Team is Incomplete
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
    is_project_member(project_id, auth.uid())
  );

-- 3. INSERT: Owners can always create tasks. 
-- Standard members can only insert if the team is complete AND they have permission (defaulted to true for now)
CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    is_project_owner(project_id, auth.uid())
    OR (
      is_project_member(project_id, auth.uid())
      AND is_team_complete(project_id)
    )
  );

-- 4. UPDATE: 
-- - Owner can update any task at any time
-- - Assigned user can update status ONLY IF team is complete
CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    is_project_owner(project_id, auth.uid())
    OR (
      is_team_complete(project_id)
      AND (assigned_to = auth.uid())
    )
  );

-- 5. DELETE: Only project owner can delete tasks
CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    is_project_owner(project_id, auth.uid())
  );

-- 6. Ensure RLS is enabled
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 7. Add Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Task RLS Policies Updated to allow Owner management regardless of team completion.';
END $$;
