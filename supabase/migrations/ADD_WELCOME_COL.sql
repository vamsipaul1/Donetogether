-- Add has_seen_welcome column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS has_seen_welcome BOOLEAN DEFAULT false;
