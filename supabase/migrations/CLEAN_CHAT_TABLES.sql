-- =====================================================
-- CLEAN SLATE - Drop and Recreate Chat Tables
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Drop existing tables in correct order (due to foreign keys)
DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;

-- 2. Create chat_rooms table
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id)
);

-- 3. Create messages table with CORRECT schema
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false
);

-- 4. Create message_reads table
CREATE TABLE message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- 5. Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for chat_rooms
CREATE POLICY "project_members_select_chat_rooms" ON chat_rooms
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
);

CREATE POLICY "project_members_insert_chat_rooms" ON chat_rooms
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
);

-- 7. Create policies for messages
CREATE POLICY "project_members_select_messages" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_rooms
        JOIN project_members ON project_members.project_id = chat_rooms.project_id
        WHERE chat_rooms.id = messages.room_id
        AND project_members.user_id = auth.uid()
    )
);

CREATE POLICY "project_members_insert_messages" ON messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_rooms
        JOIN project_members ON project_members.project_id = chat_rooms.project_id
        WHERE chat_rooms.id = messages.room_id
        AND project_members.user_id = auth.uid()
    )
);

-- 8. Create policies for message_reads
CREATE POLICY "users_select_message_reads" ON message_reads
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_insert_message_reads" ON message_reads
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 9. Create indexes
CREATE INDEX idx_chat_rooms_project_id ON chat_rooms(project_id);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);

-- 10. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;

-- Done! ✅
SELECT 'Chat tables created successfully!' as status;
