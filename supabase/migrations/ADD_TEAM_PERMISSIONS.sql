-- ============================================
-- PROJECT GOVERNANCE & PERMISSIONS MIGRATION
-- ============================================

-- 1. EXTEND project_members with permission flags for granular control
-- Using individual columns for easier RLS integration, but could also use JSONB if preferred.
-- Let's use columns for speed and RLS simplicity as requested.
ALTER TABLE public.project_members
ADD COLUMN IF NOT EXISTS can_manage_tasks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_invite_members BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_view_analytics BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_edit_project_details BOOLEAN DEFAULT false;

-- 2. INITIALIZE permissions based on role
-- Owners get everything
UPDATE public.project_members
SET can_manage_tasks = true,
    can_invite_members = true,
    can_view_analytics = true,
    can_edit_project_details = true
WHERE role = 'owner';

-- Regular members get task management and analytics by default
UPDATE public.project_members
SET can_manage_tasks = true,
    can_invite_members = false,
    can_view_analytics = true,
    can_edit_project_details = false
WHERE role != 'owner';

-- 3. FUNCTION: Safe Leadership Transfer
-- Transfers ownership from one user to another and demotes the previous owner to 'member'
CREATE OR REPLACE FUNCTION public.transfer_project_ownership(p_id UUID, new_owner_id UUID)
RETURNS VOID AS $$
DECLARE
    current_owner_id UUID;
BEGIN
    -- 1. Verify caller is the current owner (handled by RLS or explicit check)
    -- We assume the application logic or RLS handles the permission to call this.
    
    SELECT user_id INTO current_owner_id 
    FROM public.project_members 
    WHERE project_id = p_id AND role = 'owner';

    IF current_owner_id = auth.uid() THEN
        -- 2. Demote current owner
        UPDATE public.project_members
        SET role = 'member',
            can_edit_project_details = false,
            can_invite_members = false
        WHERE project_id = p_id AND user_id = current_owner_id;

        -- 3. Promote new owner
        UPDATE public.project_members
        SET role = 'owner',
            can_manage_tasks = true,
                can_invite_members = true,
                can_view_analytics = true,
                can_edit_project_details = true
        WHERE project_id = p_id AND user_id = new_owner_id;
    ELSE
        RAISE EXCEPTION 'Only the current project owner can transfer leadership.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. UPDATE RLS: Update task creation to check for can_manage_tasks
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.tasks.project_id 
          AND user_id = auth.uid()
          AND can_manage_tasks = true
    )
    AND is_team_complete(project_id)
  );

-- 5. SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Team Governance System Deployed';
  RAISE NOTICE '   - Granular permissions added to project_members';
  RAISE NOTICE '   - Leadership transfer function ready';
  RAISE NOTICE '   - RLS updated for task permissions';
END $$;
