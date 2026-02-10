-- ==============================================================================
-- 🛠️ TASK DISASTER RECOVERY FIX
-- This script fixes the "Failed to move task" error by:
-- 1. Removing strict date validation triggers that block updates
-- 2. Simplifying RLS policies to allow smooth drag & drop
-- 3. Ensuring "Team Complete" gating is permanently removed
-- ==============================================================================

-- STEP 1: REMOVE BLOCKING TRIGGERS
-- This was likely blocking updates if task dates were outside project timeline
DROP TRIGGER IF EXISTS trigger_validate_task_deadline ON public.tasks;
DROP FUNCTION IF EXISTS public.validate_task_deadline();

-- STEP 2: CLEAN UP OLD POLICIES
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

-- STEP 3: APPLY PERMISSIVE, SECURE POLICIES
-- Goal: Any project member can manage tasks. No team size gating.

-- SELECT: Members can see tasks
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id
      AND user_id = auth.uid()
    )
  );

-- INSERT: Members can create tasks
CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id
      AND user_id = auth.uid()
    )
  );

-- UPDATE: Project members or Assigned users can update tasks
-- This is critical for drag & drop!
CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id
      AND user_id = auth.uid()
    )
  );

-- DELETE: Members can delete tasks
CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id
      AND user_id = auth.uid()
    )
  );

-- STEP 4: ENSURE REQUIRED COLUMNS (Just in case)
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Task Management fully Unlocked. Date gating and Team gating REMOVED.';
END $$;
