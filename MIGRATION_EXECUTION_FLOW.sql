-- ============================================
-- WorkCommandCenter & ExecutionFlow Migration
-- ============================================

-- 1. Extend tasks table for intelligence
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS estimate_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

-- 2. Create task_blockers table
CREATE TABLE IF NOT EXISTS public.task_blockers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('user', 'dependency')),
    reason TEXT NOT NULL,
    blocked_by_id UUID REFERENCES auth.users(id), -- Points to the user causing the block or assigned to resolve it
    blocked_since TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create activities (Signal Stream) table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    entity_type VARCHAR(50), -- 'task', 'blocker', 'project'
    entity_id UUID,
    action VARCHAR(100), -- 'status_transition', 'blocker_added', 'ownership_change'
    diff_payload JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS on new tables
ALTER TABLE public.task_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 6. Basic RLS Policies (Simplified - assumes project member access)
-- Note: Replace with specific project-based policies if needed
CREATE POLICY "Members can view task blockers" ON public.task_blockers FOR SELECT USING (true);
CREATE POLICY "Members can manage task blockers" ON public.task_blockers FOR ALL USING (true);

CREATE POLICY "Members can view subtasks" ON public.subtasks FOR SELECT USING (true);
CREATE POLICY "Members can manage subtasks" ON public.subtasks FOR ALL USING (true);

CREATE POLICY "Members can view signals" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Members can log signals" ON public.activities FOR INSERT WITH CHECK (true);

-- 7. Update existing statuses to match new model
UPDATE public.tasks SET status = 'backlog' WHERE status = 'not_started';
UPDATE public.tasks SET status = 'active' WHERE status = 'in_progress';
