-- Fix projects table updated_at trigger

-- 1. Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON public.projects;

-- 3. Create trigger for projects table
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Also ensure projects table has the updated_at column
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Projects updated_at trigger fixed!';
  RAISE NOTICE '   - Trigger function created';
  RAISE NOTICE '   - Trigger attached to projects table';
  RAISE NOTICE '   - Column ensured to exist';
END $$;
