-- Ensure Chat Rooms policies
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat rooms for their projects"
ON chat_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = chat_rooms.project_id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chat rooms for their projects"
ON chat_rooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = chat_rooms.project_id
    AND project_members.user_id = auth.uid()
  )
);

-- Ensure Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their project rooms"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms
    JOIN project_members ON project_members.project_id = chat_rooms.project_id
    WHERE chat_rooms.id = messages.room_id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their project rooms"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms
    JOIN project_members ON project_members.project_id = chat_rooms.project_id
    WHERE chat_rooms.id = messages.room_id
    AND project_members.user_id = auth.uid()
  )
);

-- Ensure Message Reads policies
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their read receipts"
ON message_reads FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
