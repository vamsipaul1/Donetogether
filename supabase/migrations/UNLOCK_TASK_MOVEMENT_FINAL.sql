-- =====================================================
-- 🛠️ TASK MOVEMENT UNLOCKER: FIXING BROKEN TRIGGERS
-- This fix resolves the "Failed to move task" error caused by
-- a background trigger trying to use a non-existent column (chat_room_id).
-- =====================================================

-- 1. FIX: Task Completion Notification Trigger
CREATE OR REPLACE FUNCTION public.send_task_completed_message()
RETURNS TRIGGER AS $$
DECLARE
  task_title TEXT;
  user_name TEXT;
  room_id UUID;
BEGIN
  -- Only when task is marked as completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get task title
    SELECT title INTO task_title FROM public.tasks WHERE id = NEW.id;
    
    -- Get user's full name (from users table as it is more reliable)
    SELECT full_name INTO user_name
    FROM public.users
    WHERE id = NEW.assigned_to;
    
    -- Get chat room ID
    SELECT id INTO room_id
    FROM public.chat_rooms
    WHERE project_id = NEW.project_id;
    
    IF room_id IS NOT NULL THEN
      -- Send system message (using corrected column: room_id)
      INSERT INTO public.messages (room_id, sender_id, content, is_deleted)
      VALUES (
        room_id,
        auth.uid(), -- Mark it as being sent by the current user or NULL for system
        '✅ ' || COALESCE(user_name, 'Someone') || ' completed task: ' || task_title,
        false
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FIX: Member Joined Notification Trigger
CREATE OR REPLACE FUNCTION public.send_member_joined_message()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  target_room_id UUID;
  project_complete BOOLEAN;
BEGIN
  -- Get user's full name
  SELECT full_name INTO user_name
  FROM public.users
  WHERE id = NEW.user_id;
  
  -- Get chat room ID
  SELECT id INTO target_room_id
  FROM public.chat_rooms
  WHERE project_id = NEW.project_id;
    
  IF target_room_id IS NOT NULL THEN
    -- Send system message
    INSERT INTO public.messages (room_id, sender_id, content, is_deleted)
    VALUES (
      target_room_id,
      NEW.user_id,
      COALESCE(user_name, 'A new member') || ' joined the team',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FIX: Welcome Message on Team Complete
CREATE OR REPLACE FUNCTION public.create_chat_room_on_team_complete()
RETURNS TRIGGER AS $$
DECLARE
  room_id UUID;
  room_exists BOOLEAN;
BEGIN
  -- Only proceed if team just became complete
  IF NEW.is_team_complete = true AND (OLD.is_team_complete IS NULL OR OLD.is_team_complete = false) THEN
    
    -- Check if room already exists
    SELECT id INTO room_id FROM public.chat_rooms WHERE project_id = NEW.id;
    
    IF room_id IS NULL THEN
      -- Create the chat room
      INSERT INTO public.chat_rooms (project_id)
      VALUES (NEW.id)
      RETURNING id INTO room_id;
    END IF;

    -- Send a welcome system message
    INSERT INTO public.messages (room_id, sender_id, content, is_deleted)
    VALUES (
      room_id,
      NEW.created_by,
      '🎉 Team is complete! Chat is now active. Let''s build something amazing together!',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FIX: Unread Count Function
CREATE OR REPLACE FUNCTION public.get_unread_count(p_room_id UUID, p_user_id UUID)
RETURNS INT AS $$
DECLARE
  unread_count INT;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.messages m
  WHERE m.room_id = p_room_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
        SELECT 1 FROM message_reads mr 
        WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success Message
SELECT '✅ Task Movement Unlocked! Background triggers have been updated to use the correct schema.' as status;
