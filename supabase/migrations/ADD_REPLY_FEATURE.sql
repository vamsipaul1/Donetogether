-- =====================================================
-- ADD REPLY FEATURE TO MESSAGES
-- Run this in Supabase SQL Editor
-- =====================================================

BEGIN;

-- Add reply_to column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name = 'reply_to';

COMMIT;

SELECT '✅ Reply feature enabled! Column "reply_to" added to messages table.' as status;
