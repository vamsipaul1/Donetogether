-- =====================================================
-- ADD AVATAR_URL TO PROFILES
-- Run this in Supabase SQL Editor
-- =====================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'avatar_url';

-- Create avatars bucket if not exists (This needs to be done via Supabase UI or API)
-- For now, we will use the existing 'chat-files' bucket or advice on creating 'avatars'
