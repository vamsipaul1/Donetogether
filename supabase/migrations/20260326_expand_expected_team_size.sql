-- Expand expected_team_size constraint to support startup founder teams (1-15)
-- This migration is safe to run multiple times.

DO $$
DECLARE
  c_name text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'expected_team_size'
  ) THEN
    -- Drop any existing CHECK constraint(s) that reference expected_team_size.
    FOR c_name IN
      SELECT con.conname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'public'
        AND rel.relname = 'projects'
        AND con.contype = 'c'
        AND pg_get_constraintdef(con.oid) ILIKE '%expected_team_size%'
    LOOP
      EXECUTE format('ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS %I', c_name);
    END LOOP;

    -- Create/replace constraint: allow 1..15 (inclusive)
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_expected_team_size_check
      CHECK (expected_team_size IS NULL OR (expected_team_size >= 1 AND expected_team_size <= 15));
  END IF;
END $$;
