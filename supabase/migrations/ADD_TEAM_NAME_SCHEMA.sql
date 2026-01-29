-- ============================================
-- ADD TEAM NAME TO PROJECTS (FIXED ORDER)
-- ============================================

-- 1. Enable extension FIRST (required for gin_trgm_ops)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ADD team_name column
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS team_name TEXT;

-- 3. CREATE unique index for team_name
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_team_name_unique ON public.projects (team_name) WHERE team_name IS NOT NULL;

-- 4. CREATE searchable index for team_name
-- This index enables extra fast fuzzy searching for squad names
CREATE INDEX IF NOT EXISTS idx_projects_team_name_search ON public.projects USING gin (team_name gin_trgm_ops) WHERE team_name IS NOT NULL;

-- 5. ANALYZE for performance
ANALYZE public.projects;
