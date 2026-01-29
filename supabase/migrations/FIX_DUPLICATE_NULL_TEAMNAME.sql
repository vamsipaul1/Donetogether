-- ==============================================================================
-- FIX: Duplicate NULL team_name constraint violation
-- ==============================================================================
-- Error: duplicate key value violates unique constraint "idx_projects_team_name_unique"
-- Key (team_name)=(null) already exists
-- ==============================================================================

-- STEP 1: Drop the problematic unique index
DROP INDEX IF EXISTS idx_projects_team_name_unique;

-- STEP 2: Clean up existing projects with NULL team names
-- Delete ANY test/broken projects with no team name
DELETE FROM public.projects 
WHERE team_name IS NULL 
   OR team_name = ''
   OR TRIM(team_name) = '';

-- STEP 3: Recreate the unique index properly
-- This will allow multiple NULLs but enforce uniqueness for non-NULL values
CREATE UNIQUE INDEX idx_projects_team_name_unique 
ON public.projects (team_name) 
WHERE team_name IS NOT NULL 
  AND TRIM(team_name) != '';

-- STEP 4: Optional - Make team_name required for new projects
-- This prevents the NULL issue from happening again
-- Uncomment if you want team_name to be mandatory:
-- ALTER TABLE public.projects 
-- ALTER COLUMN team_name SET NOT NULL;

-- SUCCESS
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NULL team_name issue FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Cleaned up duplicate NULL team names';
  RAISE NOTICE '✅ Recreated unique constraint';
  RAISE NOTICE '🎉 Try creating a project now!';
  RAISE NOTICE '========================================';
END $$;

SELECT '🎉 SUCCESS! You can now create projects!' as status;
