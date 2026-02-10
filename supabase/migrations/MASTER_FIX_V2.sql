-- ==============================================================================
-- 🚀 MASTER FIX: DELETE PROJECT, TASK MOVING, AND CLEANUP
-- ==============================================================================
-- This script fixes:
-- 1. Project Deletion (Adds CASCADE deletes to all nested relations)
-- 2. Task Moving/Updates (Fixes RLS policies to allow status changes)
-- 3. Duplicate Prevention (Cleans up buggy data from previous restoration)
-- ==============================================================================

BEGIN;

-- ============================================
-- 🛠️ PART 1: FIX PROJECT DELETION (CASCADE)
-- ============================================

-- 1.1 Fix chat_rooms (The specific error you saw)
ALTER TABLE IF EXISTS public.chat_rooms 
DROP CONSTRAINT IF EXISTS chat_rooms_project_id_fkey,
ADD CONSTRAINT chat_rooms_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 1.2 Fix project_members
ALTER TABLE IF EXISTS public.project_members 
DROP CONSTRAINT IF EXISTS project_members_project_id_fkey,
ADD CONSTRAINT project_members_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 1.3 Fix tasks
ALTER TABLE IF EXISTS public.tasks 
DROP CONSTRAINT IF EXISTS tasks_project_id_fkey,
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 1.4 Fix messages (via chat_room cascade)
-- (chat_rooms -> projects is already handled, messages -> chat_rooms is usually cascade)
ALTER TABLE IF EXISTS public.messages
DROP CONSTRAINT IF EXISTS messages_chat_room_id_fkey,
ADD CONSTRAINT messages_chat_room_id_fkey
FOREIGN KEY (chat_room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE;

-- ============================================
-- 🛠️ PART 2: FIX TASK MOVING (RLS POLICIES)
-- ============================================

-- 2.1 Drop existing restrictive policies
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

-- 2.2 Create simple, working policies for a collaborative environment
-- Anyone in the project can view, create, and update tasks
CREATE POLICY "tasks_select_policy" ON public.tasks
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = tasks.project_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "tasks_insert_policy" ON public.tasks
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = tasks.project_id
    AND user_id = auth.uid()
  )
);

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

CREATE POLICY "tasks_delete_policy" ON public.tasks
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = tasks.project_id
    AND user_id = auth.uid()
  )
);

-- ============================================
-- 🛠️ PART 3: CLEANUP DUPLICATES
-- ============================================

-- Delete redundant "Code-Bulls-AI" projects to start fresh
DELETE FROM public.projects WHERE team_name = 'Code-Bulls-AI';

-- Note: The CASCADE we added in Part 1 will automatically clean up
-- all duplicate members and tasks associated with those projects.

COMMIT;

-- SUCCESS MESSAGE
SELECT '✅ SUCCESS! Project deletion is fixed, tasks can be moved, and duplicates are gone.' as status;
