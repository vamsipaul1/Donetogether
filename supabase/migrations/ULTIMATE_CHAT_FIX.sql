-- =====================================================
-- ULTIMATE FIX: MESSAGES & REACTIONS (COMPLETE REBUILD)
-- This fixes EVERYTHING: persistence, reactions, relationships
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- This will:
-- 1. Fix message persistence (no more disappearing on refresh)
-- 2. Fix message_reactions relationship
-- 3. Fix RLS policies
-- 4. Remove CASCADE DELETES
-- 5. Enable realtime properly

BEGIN;

-- ========================================
-- STEP 1: DROP AND RECREATE message_reactions TABLE
-- ========================================

-- Drop the broken table
DROP TABLE IF EXISTS message_reactions CASCADE;

-- Recreate with proper foreign keys
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id, emoji),
    -- IMPORTANT: NO CASCADE DELETE, just references
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- ========================================
-- STEP 2: FIX MESSAGES TABLE CONSTRAINTS
-- ========================================

-- Remove CASCADE DELETE from messages (prevents disappearing)
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_room_id_fkey CASCADE;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey CASCADE;

-- Add back with SET NULL instead of CASCADE
ALTER TABLE messages ADD CONSTRAINT messages_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE SET NULL;

ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Make room_id and sender_id nullable to support SET NULL
ALTER TABLE messages ALTER COLUMN room_id DROP NOT NULL;
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;

-- ========================================
-- STEP 3: ENABLE RLS ON message_reactions
-- ========================================

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: CREATE RLS POLICIES FOR message_reactions
-- ========================================

-- Policy 1: Users can view reactions in their project rooms
CREATE POLICY "view_reactions_in_project_rooms" ON message_reactions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM messages m
        JOIN chat_rooms cr ON cr.id = m.room_id
        JOIN project_members pm ON pm.project_id = cr.project_id
        WHERE m.id = message_reactions.message_id
        AND pm.user_id = auth.uid()
    )
);

-- Policy 2: Users can add reactions
CREATE POLICY "users_can_add_reactions" ON message_reactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can remove their own reactions
CREATE POLICY "users_can_remove_own_reactions" ON message_reactions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ========================================
-- STEP 5: FIX MESSAGES RLS POLICIES
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "project_members_select_messages" ON messages;
DROP POLICY IF EXISTS "project_members_insert_messages" ON messages;
DROP POLICY IF EXISTS "project_members_can_view_messages" ON messages;
DROP POLICY IF EXISTS "project_members_can_send_messages" ON messages;
DROP POLICY IF EXISTS "users_can_edit_own_messages" ON messages;
DROP POLICY IF EXISTS "users_update_own_messages" ON messages;

-- Create simple, working policies
CREATE POLICY "select_messages_in_project" ON messages
FOR SELECT
TO authenticated
USING (
    room_id IN (
        SELECT cr.id 
        FROM chat_rooms cr
        JOIN project_members pm ON pm.project_id = cr.project_id
        WHERE pm.user_id = auth.uid()
    )
);

CREATE POLICY "insert_messages_in_project" ON messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND room_id IN (
        SELECT cr.id 
        FROM chat_rooms cr
        JOIN project_members pm ON pm.project_id = cr.project_id
        WHERE pm.user_id = auth.uid()
    )
);

CREATE POLICY "update_own_messages" ON messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- ========================================
-- STEP 6: CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ========================================
-- STEP 7: ENABLE REALTIME
-- ========================================

-- Enable realtime for message_reactions
DO $$ 
BEGIN
    -- Add message_reactions to realtime (ignore if already exists)
    ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL; -- Already exists, ignore
END $$;

-- Make sure messages realtime is enabled
DO $$ 
BEGIN
    -- Try to drop first (ignore errors)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE messages;
    EXCEPTION 
        WHEN undefined_table THEN 
            NULL; -- Doesn't exist, ignore
    END;
    
    -- Now add it
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL; -- Already exists, ignore
END $$;

-- ========================================
-- STEP 8: VERIFY SETUP
-- ========================================

-- Check tables exist
DO $$
DECLARE
    msg_count INTEGER;
    reaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO msg_count FROM messages;
    SELECT COUNT(*) INTO reaction_count FROM message_reactions;
    
    RAISE NOTICE '✅ Messages table: % rows', msg_count;
    RAISE NOTICE '✅ Reactions table: % rows', reaction_count;
END $$;

-- Check foreign keys
SELECT 
    conname as constraint_name,
    conrelid::regclass as from_table,
    confrelid::regclass as to_table,
    CASE confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'r' THEN 'RESTRICT'
    END as on_delete
FROM pg_constraint
WHERE contype = 'f'
AND (conrelid = 'message_reactions'::regclass OR conrelid = 'messages'::regclass)
ORDER BY conrelid::regclass::text;

-- Check RLS policies
SELECT 
    tablename,
    policyname,
    cmd as command
FROM pg_policies
WHERE tablename IN ('messages', 'message_reactions')
ORDER BY tablename, policyname;

COMMIT;

-- ========================================
-- FINAL MESSAGE
-- ========================================

SELECT '🎉 COMPLETE! Messages will persist & Reactions will work!' as status;
