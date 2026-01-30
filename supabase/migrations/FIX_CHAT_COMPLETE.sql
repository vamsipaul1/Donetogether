-- =====================================================
-- COMPREHENSIVE CHAT SYSTEM FIX
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create chat_rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id)
);

-- 2. Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false
);

-- 3. Create message_reads table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- 4. Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- 5. DROP all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view chat rooms for their projects" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms for their projects" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their project rooms" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their project rooms" ON messages;
DROP POLICY IF EXISTS "Users can manage their read receipts" ON message_reads;

-- 6. Create PERMISSIVE policies for chat_rooms
CREATE POLICY "Anyone can view chat rooms for their projects"
ON chat_rooms FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
);

CREATE POLICY "Anyone can create chat rooms for their projects"
ON chat_rooms FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
);

-- 7. Create PERMISSIVE policies for messages
CREATE POLICY "Anyone can view messages in their project rooms"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM chat_rooms
        JOIN project_members ON project_members.project_id = chat_rooms.project_id
        WHERE chat_rooms.id = messages.room_id
        AND project_members.user_id = auth.uid()
    )
);

CREATE POLICY "Anyone can insert messages in their project rooms"
ON messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_rooms
        JOIN project_members ON project_members.project_id = chat_rooms.project_id
        WHERE chat_rooms.id = messages.room_id
        AND project_members.user_id = auth.uid()
    )
);

-- 8. Create PERMISSIVE policies for message_reads
CREATE POLICY "Anyone can view their read receipts"
ON message_reads FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert their read receipts"
ON message_reads FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_project_id ON chat_rooms(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);

-- 10. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;

-- Done! Your chat should now work 🚀
