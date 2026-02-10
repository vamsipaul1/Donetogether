-- =====================================================
-- FIX MESSAGE PERSISTENCE - Keep Messages Forever
-- Run this in Supabase SQL Editor
-- =====================================================

-- This migration ensures messages are NEVER auto-deleted
-- even if projects or users are removed

-- 1. Drop existing foreign key constraints
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_room_id_fkey;

ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- 2. Re-add foreign keys with NO ACTION (prevents cascade delete)
ALTER TABLE messages
ADD CONSTRAINT messages_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE NO ACTION;

ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE NO ACTION;

-- 3. Same for chat_rooms - prevent project deletion from deleting rooms
ALTER TABLE chat_rooms
DROP CONSTRAINT IF EXISTS chat_rooms_project_id_fkey;

ALTER TABLE chat_rooms
ADD CONSTRAINT chat_rooms_project_id_fkey
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE NO ACTION;

-- 4. Add a "soft delete" column for projects if needed
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 5. Update DELETE policies to only allow soft deletes
-- Users can only mark their own messages as deleted, not actually delete them
DROP POLICY IF EXISTS "users_delete_own_messages" ON messages;

CREATE POLICY "users_soft_delete_own_messages" ON messages
FOR UPDATE USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- 6. Verify no auto-delete functions exist
-- Check for any triggers that might delete messages
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages';

-- Done! ✅
SELECT 'Messages will now persist forever! 🎉' as status;
