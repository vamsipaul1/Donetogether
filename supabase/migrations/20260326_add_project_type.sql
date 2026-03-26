-- Add project_type to projects to distinguish student vs startup founder teams

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'projects'
  ) THEN
    ALTER TABLE public.projects
      ADD COLUMN IF NOT EXISTS project_type text;

    -- constrain allowed values (nullable for backward compatibility)
    ALTER TABLE public.projects
      DROP CONSTRAINT IF EXISTS projects_project_type_check;

    ALTER TABLE public.projects
      ADD CONSTRAINT projects_project_type_check
      CHECK (project_type IS NULL OR project_type IN ('student', 'founder'));
  END IF;
END $$;
