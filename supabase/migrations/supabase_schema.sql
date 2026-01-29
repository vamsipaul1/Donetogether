-- DoneTogether Supabase Schema
-- Final Recursion-Proof "Flat" Security Model with Auto-User Sync

-- 1. Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  goal TEXT,
  duration TEXT,
  join_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project Members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 4. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 5. User Sync TRIGGER (Industry Standard for Supabase)
-- This ensures the public.users table is ALWAYS in sync with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ULTRA-SPEED POLICIES (No Recursion)
CREATE POLICY "p_owner_all" ON public.projects FOR ALL TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "p_read_all" ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "m_read_all" ON public.project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "m_insert_all" ON public.project_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "m_delete_own" ON public.project_members FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "u_read_all" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "u_all_own" ON public.users FOR ALL TO authenticated USING (auth.uid() = id);
