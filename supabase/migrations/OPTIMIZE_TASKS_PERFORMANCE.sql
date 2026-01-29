-- Optimization: Add indexes for faster task queries and updates
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at);

-- Analyze the table to update statistics for the query planner
ANALYZE public.tasks;
