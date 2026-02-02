-- ============================================
-- ADD AVATAR_URL TO PROJECTS TABLE
-- ============================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.projects ADD COLUMN avatar_url TEXT;
        COMMENT ON COLUMN public.projects.avatar_url IS 'Group profile photo URL';
    END IF;
END $$;
