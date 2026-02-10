-- =====================================================
-- FINAL UNIFIED CHAT FIX: SCHEMA, RLS, AND PERFORMANCE
-- =====================================================

BEGIN;

-- 1. Ensure columns are consistent in messages table
DO $$ 
BEGIN
    -- Rename chat_room_id to room_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'chat_room_id') THEN
        ALTER TABLE messages RENAME COLUMN chat_room_id TO room_id;
    END IF;

    -- Rename user_id to sender_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'user_id') THEN
        ALTER TABLE messages RENAME COLUMN user_id TO sender_id;
    END IF;
    
    -- Ensure all columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'room_id') THEN
        ALTER TABLE messages ADD COLUMN room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
        ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_deleted') THEN
        ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_edited') THEN
        ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Drop all conflicting policies to start clean
DROP POLICY IF EXISTS "select_messages_in_project" ON messages;
DROP POLICY IF EXISTS "insert_messages_in_project" ON messages;
DROP POLICY IF EXISTS "update_own_messages" ON messages;
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
DROP POLICY IF EXISTS "project_members_can_view_messages" ON messages;
DROP POLICY IF EXISTS "project_members_can_send_messages" ON messages;
DROP POLICY IF EXISTS "users_can_edit_own_messages" ON messages;

-- 3. Create definitive, robust policies
-- SELECT: Users can see messages if they are in the project linked to the room
CREATE POLICY "chat_messages_select" ON messages
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

-- INSERT: Users can send messages if they are in the project linked to the room
CREATE POLICY "chat_messages_insert" ON messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
        SELECT 1 
        FROM chat_rooms cr
        JOIN project_members pm ON pm.project_id = cr.project_id
        WHERE cr.id = room_id
        AND pm.user_id = auth.uid()
    )
);

-- UPDATE: Users can only update their own messages
CREATE POLICY "chat_messages_update" ON messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- 4. Enable Realtime properly with FULL identity
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Ensure it's in the publication
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END $$;

-- 5. Fix chat_rooms policies too
DROP POLICY IF EXISTS "chat_rooms_select" ON chat_rooms;
DROP POLICY IF EXISTS "project_members_can_view_rooms" ON chat_rooms;

CREATE POLICY "chat_rooms_access" ON chat_rooms
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
);

COMMIT;
