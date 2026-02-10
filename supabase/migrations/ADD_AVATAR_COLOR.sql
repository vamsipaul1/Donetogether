-- Add avatar_color column to users table

-- 1. Add avatar_color column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT 'bg-emerald-500';

-- 2. Ensure users table has RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Ensure users can update their own data
DROP POLICY IF EXISTS "u_all_own" ON public.users;
CREATE POLICY "u_all_own" ON public.users 
FOR ALL TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Also add a specific update policy for avatar_color
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users 
FOR UPDATE TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_avatar_color ON public.users(avatar_color);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Avatar color system setup complete!';
  RAISE NOTICE '   - Column: avatar_color (TEXT)';
  RAISE NOTICE '   - Default: bg-emerald-500';
  RAISE NOTICE '   - RLS policies: ENABLED';
  RAISE NOTICE '   - Users can update their own color: YES';
  RAISE NOTICE '   - Index created for performance';
END $$;
