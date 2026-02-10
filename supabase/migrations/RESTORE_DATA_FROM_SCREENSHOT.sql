-- ============================================
-- 🛠️ RESTORE PREVIOUS DATA: Code-Bulls-AI (REVISED)
-- ============================================
-- Use this script to restore the members, activity, and project state
-- as seen in the previous screenshot. This version fixes the Foreign Key error.

-- 0. Fix the constraint issue for localhost (Safe for development)
-- We drop the FK constraint that requires users to exist in auth.users
-- so we can create dummy members for display in your dashboard.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

DO $$
DECLARE
    v_project_id UUID;
    v_owner_id UUID;
    -- Fixed deterministic IDs so we can rerun the script safely
    v_anil_id UUID := '00000000-0000-0000-0000-000000000001';
    v_dhanunjaya_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    -- 1. Get the current user ID (you)
    v_owner_id := auth.uid();
    
    IF v_owner_id IS NULL THEN
        -- If running in SQL editor without auth context, try to find the first user
        SELECT id INTO v_owner_id FROM public.users LIMIT 1;
    END IF;

    -- 2. Ensure team_name column and index exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'team_name') THEN
        ALTER TABLE public.projects ADD COLUMN team_name TEXT;
    END IF;
    
    CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_team_name_unique ON public.projects (team_name) WHERE team_name IS NOT NULL;

    -- 3. Create or Find the Project "Code-Bulls-AI"
    SELECT id INTO v_project_id FROM public.projects WHERE team_name = 'Code-Bulls-AI';
    
    IF v_project_id IS NULL THEN
        INSERT INTO public.projects (
            title, 
            team_name, 
            domain, 
            goal, 
            join_code,
            expected_team_size, 
            is_team_complete,
            created_by,
            created_at
        )
        VALUES (
            'Code-Bulls-AI', 
            'Code-Bulls-AI', 
            'AI', 
            'HELLO AI', 
            'BULLS-' || upper(substring(gen_random_uuid()::text, 1, 4)),
            3, -- Matches the 3 members in screenshot
            true, 
            v_owner_id,
            NOW() - INTERVAL '5 days'
        )
        RETURNING id INTO v_project_id;
    END IF;

    -- 4. Restore Users (Anil and Dhanunjaya)
    -- We can insert these now because we dropped the FK constraint
    INSERT INTO public.users (id, email, full_name, created_at)
    VALUES (v_anil_id, 'anil.kumar@localhost.dev', 'Anil Kumar', NOW() - INTERVAL '4 days')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    INSERT INTO public.users (id, email, full_name, created_at)
    VALUES (v_dhanunjaya_id, 'dhanunjaya.rao@localhost.dev', 'Dhanunjaya Rao', NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- 5. Restore Project Memberships
    -- Add You (if not already there)
    IF v_owner_id IS NOT NULL THEN
        INSERT INTO public.project_members (project_id, user_id, role, joined_at)
        VALUES (v_project_id, v_owner_id, 'owner', NOW() - INTERVAL '5 days')
        ON CONFLICT (project_id, user_id) DO NOTHING;
    END IF;

    -- Add Anil (Joined 4 days ago)
    INSERT INTO public.project_members (project_id, user_id, role, joined_at)
    VALUES (v_project_id, v_anil_id, 'member', NOW() - INTERVAL '4 days')
    ON CONFLICT (project_id, user_id) DO NOTHING;

    -- Add Dhanunjaya (Joined 1 day ago)
    INSERT INTO public.project_members (project_id, user_id, role, joined_at)
    VALUES (v_project_id, v_dhanunjaya_id, 'member', NOW() - INTERVAL '1 day')
    ON CONFLICT (project_id, user_id) DO NOTHING;

    -- 6. Restore Tasks to match screenshot counts exactly:
    -- Vamsi (Leader): 2 Active, 1 Due/Overdue
    -- Anil (Member): 1 Active, 0 Due
    -- Dhanunjaya (Member): 1 Active, 0 Due
    
    DELETE FROM public.tasks WHERE project_id = v_project_id;

    -- VAMSI: 2 active (one overdue)
    INSERT INTO public.tasks (project_id, title, assigned_to, assigned_by, status, due_date)
    VALUES 
        (v_project_id, 'AI Architecture Design', v_owner_id, v_owner_id, 'in_progress', CURRENT_DATE - INTERVAL '2 days'), -- OVERDUE
        (v_project_id, 'Initial Sprint Planning', v_owner_id, v_owner_id, 'not_started', CURRENT_DATE + INTERVAL '5 days'); -- ACTIVE

    -- ANIL: 1 active
    INSERT INTO public.tasks (project_id, title, assigned_to, assigned_by, status, due_date)
    VALUES 
        (v_project_id, 'UI Library Selection', v_anil_id, v_owner_id, 'in_progress', CURRENT_DATE + INTERVAL '3 days');

    -- DHANUNJAYA: 1 active
    INSERT INTO public.tasks (project_id, title, assigned_to, assigned_by, status, due_date)
    VALUES 
        (v_project_id, 'Database Performance Tuning', v_dhanunjaya_id, v_owner_id, 'in_progress', CURRENT_DATE + INTERVAL '4 days');

    RAISE NOTICE '✅ Restoration Complete: Code-Bulls-AI is back with correct counts!';
END $$;
