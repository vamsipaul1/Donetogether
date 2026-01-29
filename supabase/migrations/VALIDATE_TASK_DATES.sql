-- ==========================================================
-- VALIDATE TASK DEADLINES AGAINST PROJECT TIMELINE
-- Run this in Supabase SQL Editor to prevent invalid task dates
-- ==========================================================

CREATE OR REPLACE FUNCTION public.validate_task_deadline()
RETURNS TRIGGER AS $$
DECLARE
  proj_end TIMESTAMPTZ;
  proj_start TIMESTAMPTZ;
BEGIN
  -- Fetch project start and end dates
  SELECT start_date, end_date INTO proj_start, proj_end
  FROM public.projects
  WHERE id = NEW.project_id;

  -- Validation 1: Task deadline cannot be after Project End Date
  -- We cast to DATE to compare just the days, ignoring time parts if needed, 
  -- but since inputs are usually dates, direct comparison often works.
  IF proj_end IS NOT NULL AND NEW.due_date > proj_end THEN
    RAISE EXCEPTION 'Task deadline cannot be after the project end date (%)', proj_end::DATE;
  END IF;

  -- Validation 2: Task deadline must be reasonable (e.g. not before project start)
  IF proj_start IS NOT NULL AND NEW.due_date < proj_start THEN
     RAISE EXCEPTION 'Task deadline cannot be before the project start date (%)', proj_start::DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create the trigger
DROP TRIGGER IF EXISTS trigger_validate_task_deadline ON public.tasks;
CREATE TRIGGER trigger_validate_task_deadline
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.validate_task_deadline();

DO $$
BEGIN
  RAISE NOTICE '✅ Task validation logic applied successfully.';
END $$;
