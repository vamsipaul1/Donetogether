-- Add task_number column to tasks table for user-friendly task IDs

-- 1. Drop existing constraint and trigger if they exist
DROP TRIGGER IF EXISTS trigger_assign_task_number ON public.tasks;
DROP INDEX IF EXISTS idx_tasks_project_task_number;
DROP FUNCTION IF EXISTS public.assign_task_number();

-- 2. Add task_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'task_number'
  ) THEN
    ALTER TABLE public.tasks ADD COLUMN task_number INTEGER;
  END IF;
END $$;

-- 3. Update existing tasks with task numbers (only if they don't have one)
DO $$
DECLARE
  project_record RECORD;
  task_record RECORD;
  task_num INT;
BEGIN
  -- For each project
  FOR project_record IN SELECT DISTINCT project_id FROM public.tasks
  LOOP
    task_num := 1;
    -- Assign task numbers to existing tasks that don't have one
    FOR task_record IN 
      SELECT id, task_number FROM public.tasks 
      WHERE project_id = project_record.project_id 
        AND (task_number IS NULL OR task_number = 0)
      ORDER BY created_at
    LOOP
      -- Find next available task number for this project
      SELECT COALESCE(MAX(task_number), 0) + 1
      INTO task_num
      FROM public.tasks
      WHERE project_id = project_record.project_id;
      
      UPDATE public.tasks 
      SET task_number = task_num 
      WHERE id = task_record.id;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '✅ Task numbers assigned to existing tasks';
END $$;

-- 4. Create unique index on task_number per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_project_task_number 
ON public.tasks(project_id, task_number)
WHERE task_number IS NOT NULL;

-- 5. Function to auto-assign task numbers per project
CREATE OR REPLACE FUNCTION public.assign_task_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if task_number is not already set
  IF NEW.task_number IS NULL THEN
    -- Get the next task number for this project
    SELECT COALESCE(MAX(task_number), 0) + 1
    INTO NEW.task_number
    FROM public.tasks
    WHERE project_id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-assign task numbers
CREATE TRIGGER trigger_assign_task_number
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_task_number();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Task Number System Setup Complete!';
  RAISE NOTICE '   - task_number column added';
  RAISE NOTICE '   - Auto-increment trigger created';
  RAISE NOTICE '   - Existing tasks numbered';
END $$;
