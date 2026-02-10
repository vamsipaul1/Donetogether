-- ============================================
-- Fix: Project Member Management RLS
-- Goal: Allow Owners to Delete Members from Their Project
-- ============================================

-- 1. Drop existing restricted delete policy if needed (optional, we'll keep it so members can still leave)
-- DROP POLICY IF EXISTS "m_delete_own" ON public.project_members;

-- 2. Add policy for owners to delete members in their projects
CREATE POLICY "m_owner_delete" ON public.project_members
  FOR DELETE TO authenticated
  USING (
    is_project_owner(project_id, auth.uid())
  );

-- 3. Add policy for owners to update member permissions
-- The current schema might already allow it if it's "all" but let's be explicit
DROP POLICY IF EXISTS "m_update_owner" ON public.project_members;
CREATE POLICY "m_update_owner" ON public.project_members
  FOR UPDATE TO authenticated
  USING (
    is_project_owner(project_id, auth.uid())
  )
  WITH CHECK (
    is_project_owner(project_id, auth.uid())
  );

-- 4. Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Project Member Management RLS Policies Updated.';
END $$;
