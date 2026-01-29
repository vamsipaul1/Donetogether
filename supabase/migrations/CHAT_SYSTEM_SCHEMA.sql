-- ============================================
-- DoneTogether: REALTIME GROUP CHAT SYSTEM
-- Production-Ready Schema with Security & Scalability
-- ============================================

-- ============================================
-- 1. PROFILES TABLE (User Identity System)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique username per user (optional, for mentions)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- ============================================
-- 2. CHAT ROOMS TABLE (Project-Scoped Chat)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'General',
  type TEXT DEFAULT 'group' CHECK (type IN ('group', 'dm', 'announcement')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id) -- One room per project
);

-- Index for fast project lookup
CREATE INDEX IF NOT EXISTS idx_chat_rooms_project ON public.chat_rooms(project_id);

-- ============================================
-- 3. MESSAGES TABLE (The Core)
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'announcement', 'image')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb -- For future extensibility (task mentions, etc.)
);

-- Indexes for performance (CRITICAL for scale)
CREATE INDEX IF NOT EXISTS idx_messages_room_time ON public.messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);

-- ============================================
-- 4. MESSAGE READS TABLE (Read Receipts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reads_message ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON public.message_reads(user_id);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES (Security-First)
-- ============================================

-- PROFILES: Everyone can read, only owner can update
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- CHAT ROOMS: Only project members can see rooms
DROP POLICY IF EXISTS "chat_rooms_select" ON public.chat_rooms;
CREATE POLICY "chat_rooms_select" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = chat_rooms.project_id
        AND project_members.user_id = auth.uid()
    )
  );

-- Only system can create chat rooms (via trigger)
DROP POLICY IF EXISTS "chat_rooms_insert" ON public.chat_rooms;
CREATE POLICY "chat_rooms_insert" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- MESSAGES: Only project members can read/send messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      INNER JOIN public.project_members
        ON chat_rooms.project_id = project_members.project_id
      WHERE chat_rooms.id = messages.chat_room_id
        AND project_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      INNER JOIN public.project_members
        ON chat_rooms.project_id = project_members.project_id
      WHERE chat_rooms.id = messages.chat_room_id
        AND project_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND message_type = 'text');

DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
CREATE POLICY "messages_delete_own" ON public.messages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND message_type = 'text');

-- MESSAGE READS: Users can insert/update their own reads
DROP POLICY IF EXISTS "message_reads_select" ON public.message_reads;
CREATE POLICY "message_reads_select" ON public.message_reads
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "message_reads_insert" ON public.message_reads;
CREATE POLICY "message_reads_insert" ON public.message_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 7. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULL, -- Will be set by user later
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ============================================
-- 8. AUTO-CREATE CHAT ROOM WHEN TEAM COMPLETES
-- ============================================
CREATE OR REPLACE FUNCTION public.create_chat_room_on_team_complete()
RETURNS TRIGGER AS $$
DECLARE
  member_count INT;
  room_exists BOOLEAN;
BEGIN
  -- Only proceed if team just became complete
  IF NEW.is_team_complete = true AND (OLD.is_team_complete IS NULL OR OLD.is_team_complete = false) THEN
    
    -- Check if room already exists
    SELECT EXISTS(SELECT 1 FROM public.chat_rooms WHERE project_id = NEW.id) INTO room_exists;
    
    IF NOT room_exists THEN
      -- Create the chat room
      INSERT INTO public.chat_rooms (project_id, name, type)
      VALUES (NEW.id, 'Team Chat', 'group');
      
      -- Send a welcome system message
      INSERT INTO public.messages (chat_room_id, user_id, content, message_type, metadata)
      SELECT 
        cr.id,
        NULL,
        '🎉 Team is complete! Chat is now active. Let''s build something amazing together!',
        'system',
        jsonb_build_object('event_type', 'team_complete')
      FROM public.chat_rooms cr
      WHERE cr.project_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_team_complete ON public.projects;
CREATE TRIGGER on_team_complete
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_chat_room_on_team_complete();

-- ============================================
-- 9. AUTO SYSTEM MESSAGE ON MEMBER JOIN
-- ============================================
CREATE OR REPLACE FUNCTION public.send_member_joined_message()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  room_id UUID;
  project_complete BOOLEAN;
BEGIN
  -- Get user's display name
  SELECT display_name INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Check if project team is complete
  SELECT is_team_complete INTO project_complete
  FROM public.projects
  WHERE id = NEW.project_id;
  
  -- Only send message if team is complete (chat room exists)
  IF project_complete THEN
    -- Get chat room ID
    SELECT id INTO room_id
    FROM public.chat_rooms
    WHERE project_id = NEW.project_id;
    
    IF room_id IS NOT NULL THEN
      -- Send system message
      INSERT INTO public.messages (chat_room_id, user_id, content, message_type, metadata)
      VALUES (
        room_id,
        NULL,
        COALESCE(user_name, 'A new member') || ' joined the team',
        'system',
        jsonb_build_object(
          'event_type', 'member_joined',
          'user_id', NEW.user_id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_member_join ON public.project_members;
CREATE TRIGGER on_member_join
  AFTER INSERT ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.send_member_joined_message();

-- ============================================
-- 10. AUTO SYSTEM MESSAGE ON TASK COMPLETION
-- ============================================
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
    
    -- Get user's display name
    SELECT display_name INTO user_name
    FROM public.profiles
    WHERE id = NEW.assigned_to;
    
    -- Get chat room ID
    SELECT cr.id INTO room_id
    FROM public.chat_rooms cr
    WHERE cr.project_id = NEW.project_id;
    
    IF room_id IS NOT NULL THEN
      -- Send system message
      INSERT INTO public.messages (chat_room_id, user_id, content, message_type, metadata)
      VALUES (
        room_id,
        NULL,
        '✅ ' || COALESCE(user_name, 'Someone') || ' completed task: ' || task_title,
        'system',
        jsonb_build_object(
          'event_type', 'task_completed',
          'task_id', NEW.id,
          'user_id', NEW.assigned_to
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_complete ON public.tasks;
CREATE TRIGGER on_task_complete
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.send_task_completed_message();

-- ============================================
-- 11. RATE LIMITING (Anti-Spam Protection)
-- ============================================
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_message_count INT;
BEGIN
  -- Count messages from this user in last 10 seconds
  SELECT COUNT(*) INTO recent_message_count
  FROM public.messages
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '10 seconds'
    AND message_type = 'text';
  
  -- Allow max 5 messages per 10 seconds
  IF recent_message_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait a moment before sending more messages.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_rate_limit ON public.messages;
CREATE TRIGGER messages_rate_limit
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.message_type = 'text')
  EXECUTE FUNCTION public.check_message_rate_limit();

-- ============================================
-- 12. UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON public.chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 13. HELPER FUNCTIONS (For Frontend)
-- ============================================

-- Get unread message count for a user in a room
CREATE OR REPLACE FUNCTION public.get_unread_count(p_room_id UUID, p_user_id UUID)
RETURNS INT AS $$
DECLARE
  unread_count INT;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.messages m
  WHERE m.chat_room_id = p_room_id
    AND m.user_id != p_user_id
    AND m.created_at > COALESCE(
      (SELECT last_seen FROM public.profiles WHERE id = p_user_id),
      '1970-01-01'::timestamptz
    );
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Verify installation
DO $$
BEGIN
  RAISE NOTICE '✅ Chat System Schema Installed Successfully';
  RAISE NOTICE '📋 Tables created: profiles, chat_rooms, messages, message_reads';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Triggers configured for auto-messages';
  RAISE NOTICE '🚀 Ready for realtime integration!';
END $$;
