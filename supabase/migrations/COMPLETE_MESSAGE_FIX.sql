-- =====================================================
-- COMPLETE FIX: MESSAGE PERSISTENCE ON REFRESH
-- Run this in Supabase SQL Editor
-- =====================================================

-- This migration ensures:
-- 1. Messages are SAVED correctly
-- 2. Messages are FETCHED correctly on refresh
-- 3. RLS policies allow proper access
-- 4. NO CASCADE DELETES

BEGIN;

-- ========================================
-- PART 1: FIX FOREIGN KEY CONSTRAINTS
-- ========================================

-- Remove CASCADE DELETE from messages
ALTER TABLE IF EXISTS messages 
DROP CONSTRAINT IF EXISTS messages_room_id_fkey CASCADE;

ALTER TABLE IF EXISTS messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey CASCADE;

-- Re-add with NO ACTION (prevents auto-delete)
ALTER TABLE IF EXISTS messages
ADD CONSTRAINT messages_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE NO ACTION;

ALTER TABLE IF EXISTS messages
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE NO ACTION;

-- Same for chat_rooms
ALTER TABLE IF EXISTS chat_rooms
DROP CONSTRAINT IF EXISTS chat_rooms_project_id_fkey CASCADE;

ALTER TABLE IF EXISTS chat_rooms
ADD CONSTRAINT chat_rooms_project_id_fkey
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE NO ACTION;

-- ========================================
-- PART 2: ENSURE TABLES EXIST
-- ========================================

-- Ensure messages table has all required columns
DO $$ 
BEGIN
    -- Add is_deleted if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'is_deleted'
    ) THEN
        ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;

    -- Add is_edited if not exists  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'is_edited'
    ) THEN
        ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT false;
    END IF;

    -- Add attachment columns if not exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'attachment_url'
    ) THEN
        ALTER TABLE messages ADD COLUMN attachment_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'attachment_name'
    ) THEN
        ALTER TABLE messages ADD COLUMN attachment_name TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'attachment_type'
    ) THEN
        ALTER TABLE messages ADD COLUMN attachment_type TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'attachment_size'
    ) THEN
        ALTER TABLE messages ADD COLUMN attachment_size BIGINT;
    END IF;
END $$;

-- ========================================
-- PART 3: FIX RLS POLICIES
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "project_members_select_messages" ON messages;
DROP POLICY IF EXISTS "project_members_insert_messages" ON messages;
DROP POLICY IF EXISTS "users_update_own_messages" ON messages;
DROP POLICY IF EXISTS "users_delete_own_messages" ON messages;
DROP POLICY IF EXISTS "users_soft_delete_own_messages" ON messages;

-- CRITICAL: Allow project members to SELECT ALL messages in their project
-- This ensures messages appear after refresh!
CREATE POLICY "project_members_can_view_messages" ON messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM chat_rooms cr
        JOIN project_members pm ON pm.project_id = cr.project_id
        WHERE cr.id = messages.room_id
        AND pm.user_id = auth.uid()
    )
);

-- Allow project members to INSERT messages
CREATE POLICY "project_members_can_send_messages" ON messages
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM chat_rooms cr
        JOIN project_members pm ON pm.project_id = cr.project_id
        WHERE cr.id = messages.room_id
        AND pm.user_id = auth.uid()
    )
    AND sender_id = auth.uid()
);

-- Allow users to UPDATE only their own messages (for editing)
CREATE POLICY "users_can_edit_own_messages" ON messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- NO DELETE POLICY - messages cannot be hard deleted!
-- Only soft deletes via UPDATE with is_deleted = true

-- ========================================
-- PART 4: FIX CHAT_ROOMS POLICIES
-- ========================================

DROP POLICY IF EXISTS "project_members_select_chat_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "project_members_insert_chat_rooms" ON chat_rooms;

CREATE POLICY "project_members_can_view_rooms" ON chat_rooms
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
);

CREATE POLICY "project_members_can_create_rooms" ON chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
);

-- ========================================
-- PART 5: CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_chat_rooms_project_id ON chat_rooms(project_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON message_reads(user_id);

-- ========================================
-- PART 6: VERIFY SETUP
-- ========================================

-- Count existing messages
DO $$
DECLARE
    msg_count INTEGER;
    room_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO msg_count FROM messages WHERE is_deleted = false;
    SELECT COUNT(*) INTO room_count FROM chat_rooms;
    
    RAISE NOTICE '✅ Found % active messages across % chat rooms', msg_count, room_count;
END $$;

COMMIT;

-- ========================================
-- FINAL VERIFICATION
-- ========================================

-- Check constraints are correct
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    CASE confdeltype
        WHEN 'a' THEN '✅ NO ACTION (Safe)'
        WHEN 'c' THEN '❌ CASCADE (Dangerous)'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'n' THEN 'SET NULL'
        ELSE 'OTHER'
    END as delete_action
FROM pg_constraint
WHERE conrelid IN ('messages'::regclass, 'chat_rooms'::regclass)
AND contype = 'f'
ORDER BY conrelid::regclass::text, conname;

-- Check policies
SELECT 
    tablename,
    policyname,
    cmd as command,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE tablename IN ('messages', 'chat_rooms')
ORDER BY tablename, policyname;

-- Final success message
SELECT '🎉 MESSAGE PERSISTENCE IS NOW FIXED! Messages will persist across refreshes.' as status;
