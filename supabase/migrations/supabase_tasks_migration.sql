-- ============================================
-- DoneTogether Task Management Migration
-- Implements: Team Size Gating + Task System + RLS
-- ============================================

-- 1. EXTEND projects table with team size gating
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS expected_team_size INT CHECK (expected_team_size IN (4, 5, 6)),
  ADD COLUMN IF NOT EXISTS is_team_complete BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS goal TEXT;

-- 2. CREATE tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  status TEXT CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'blocked', 'deleted')
  ) DEFAULT 'not_started',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  start_date DATE,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

-- 4. Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. FUNCTION: Auto-complete task timestamp
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_task_completion ON public.tasks;
CREATE TRIGGER trigger_task_completion
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();

-- 6. FUNCTION: Check team completion after member joins
CREATE OR REPLACE FUNCTION public.check_team_completion()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  expected_size INT;
BEGIN
  -- Get current member count and expected size
  SELECT COUNT(*), p.expected_team_size
  INTO current_count, expected_size
  FROM public.project_members pm
  JOIN public.projects p ON p.id = pm.project_id
  WHERE pm.project_id = NEW.project_id
  GROUP BY p.expected_team_size;

  -- If team is complete, update project
  IF current_count >= expected_size THEN
    UPDATE public.projects
    SET is_team_complete = true,
        updated_at = NOW()
    WHERE id = NEW.project_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_team_completion ON public.project_members;
CREATE TRIGGER trigger_check_team_completion
  AFTER INSERT ON public.project_members
  FOR EACH ROW EXECUTE FUNCTION public.check_team_completion();

-- 7. FUNCTION: Helper to check if user is project owner
CREATE OR REPLACE FUNCTION public.is_project_owner(p_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id 
      AND user_id = u_id 
      AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 8. FUNCTION: Helper to check if user is project member
CREATE OR REPLACE FUNCTION public.is_project_member(p_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id 
      AND user_id = u_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. FUNCTION: Helper to check if project team is complete
CREATE OR REPLACE FUNCTION public.is_team_complete(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_id 
      AND is_team_complete = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- ROW LEVEL SECURITY POLICIES FOR TASKS
-- ============================================

-- DROP existing task policies if any
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

-- SELECT: Can view tasks only if team member AND team complete
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    is_project_member(project_id, auth.uid())
    AND is_team_complete(project_id)
  );

-- INSERT: Only project owner can create tasks, AND team must be complete
CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    is_project_owner(project_id, auth.uid())
    AND is_team_complete(project_id)
  );

-- UPDATE: 
-- - Owner can update any task field
-- - Member can only update status of their assigned tasks
CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    is_team_complete(project_id)
    AND (
      is_project_owner(project_id, auth.uid())
      OR (
        assigned_to = auth.uid()
        -- Member restriction: Can only change status field
        -- This is enforced in application logic since RLS can't check which fields changed
      )
    )
  );

-- DELETE: Only project owner can delete tasks
CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    is_project_owner(project_id, auth.uid())
    AND is_team_complete(project_id)
  );

-- ============================================
-- VIEWS FOR EASIER QUERYING
-- ============================================

-- View: Tasks with computed overdue status
CREATE OR REPLACE VIEW public.tasks_with_status AS
SELECT 
  t.*,
  CASE 
    WHEN t.status = 'completed' THEN 'completed'
    WHEN t.status = 'blocked' THEN 'blocked'
    WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 'overdue'
    ELSE t.status
  END as computed_status,
  CASE
    WHEN t.status = 'completed' AND t.completed_at <= t.due_date THEN 'on_time'
    WHEN t.status = 'completed' AND t.completed_at > t.due_date THEN 'late'
    WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 'overdue'
    WHEN t.due_date = CURRENT_DATE AND t.status != 'completed' THEN 'due_today'
    ELSE 'upcoming'
  END as timeline_status
FROM public.tasks t;

-- View: Project overview with member count
CREATE OR REPLACE VIEW public.projects_overview AS
SELECT 
  p.*,
  COUNT(pm.id) as current_member_count,
  CASE 
    WHEN p.is_team_complete THEN 'active'
    WHEN COUNT(pm.id) < p.expected_team_size THEN 'waiting'
    ELSE 'unknown'
  END as project_status
FROM public.projects p
LEFT JOIN public.project_members pm ON pm.project_id = p.id
GROUP BY p.id;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.tasks_with_status TO authenticated;
GRANT SELECT ON public.projects_overview TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Task Management Migration Complete';
  RAISE NOTICE '   - Tasks table created';
  RAISE NOTICE '   - Team completion logic activated';
  RAISE NOTICE '   - RLS policies enforced';
  RAISE NOTICE '   - Helper functions deployed';
END $$;
