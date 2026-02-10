-- ==============================================================================
-- 📦 RESTORE CODE-BULLS DATA
-- ==============================================================================
-- Run this AFTER Running FINAL_DATABASE_FIX.sql
-- This restores your original members: Anil Kumar and Dhanunjaya Rao.

DO $$
DECLARE
    v_project_id UUID;
    v_owner_id UUID;
    v_anil_id UUID := '00000000-0000-0000-0000-000000000001';
    v_dhanunjaya_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    -- 0. Get your ID
    v_owner_id := auth.uid();
    IF v_owner_id IS NULL THEN
        SELECT id INTO v_owner_id FROM public.users LIMIT 1;
    END IF;

    -- 1. Create Project
    INSERT INTO public.projects (title, team_name, domain, goal, join_code, expected_team_size, is_team_complete, created_by)
    VALUES ('Code-Bulls-AI', 'Code-Bulls-AI', 'AI', 'HELLO AI', 'BULLS-' || upper(substring(gen_random_uuid()::text, 1, 4)), 4, true, v_owner_id)
    ON CONFLICT (team_name) DO UPDATE SET goal = EXCLUDED.goal
    RETURNING id INTO v_project_id;

    -- 2. Add Original Users
    -- We use DO UPDATE to ensure names are correct if they were partially created
    INSERT INTO public.users (id, email, full_name, onboarding_completed)
    VALUES (v_anil_id, 'anil@done.together', 'Anil Kumar', true),
           (v_dhanunjaya_id, 'dhanunjaya@done.together', 'Dhanunjaya Rao', true)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, onboarding_completed = true;

    -- 3. Add to Project Members
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_owner_id, 'owner'),
           (v_project_id, v_anil_id, 'member'),
           (v_project_id, v_dhanunjaya_id, 'member')
    ON CONFLICT (project_id, user_id) DO NOTHING;

    -- 4. Initial Real Tasks
    DELETE FROM public.tasks WHERE project_id = v_project_id;
    INSERT INTO public.tasks (project_id, title, assigned_to, assigned_by, status, due_date) VALUES 
    (v_project_id, 'Setup AI Infrastructure', v_owner_id, v_owner_id, 'in_progress', CURRENT_DATE - INTERVAL '1 day'), 
    (v_project_id, 'Design System UI', v_anil_id, v_owner_id, 'in_progress', CURRENT_DATE + INTERVAL '2 days'),
    (v_project_id, 'API Integration', v_dhanunjaya_id, v_owner_id, 'in_progress', CURRENT_DATE + INTERVAL '3 days');

    RAISE NOTICE '✅ Restoration Complete!';
END $$;
