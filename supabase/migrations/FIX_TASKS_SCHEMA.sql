-- ==========================================================
-- FIX TASKS SCHEMA
-- Run this in Supabase SQL Editor to fix "column 'start_date' does not exist"
-- ==========================================================

-- 1. Add start_date column to tasks table if it doesn't exist
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone;

-- 2. Add comment for clarity
COMMENT ON COLUMN public.tasks.start_date IS 'Task start timestamp';

-- 3. Verify indexes (optional but good for performance if filtering by start_date)
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON public.tasks(start_date);
