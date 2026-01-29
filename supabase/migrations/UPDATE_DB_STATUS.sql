-- Run this SQL in your Supabase SQL Editor to enable the 'deleted' status for History functionality

-- 1. If you are using a Check Constraint (Most likely if you created the table via Table Editor)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'deleted'));

-- 2. If you are using a Postgres ENUM Type (Advanced setup)
-- ALTER TYPE "TaskStatus" ADD VALUE 'deleted';
