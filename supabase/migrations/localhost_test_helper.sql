-- ============================================
-- QUICK TEST: Add 3 Members to Complete Team
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Run QUERY 1 first
-- 2. Copy the project ID from results
-- 3. Paste it in QUERY 2 (replace YOUR_PROJECT_ID)
-- 4. Run QUERY 2
-- 5. Refresh your dashboard!
-- 
-- ============================================

-- ============================================
-- QUERY 1: Get Your Project ID
-- ============================================

SELECT 
    id as project_id,
    title,
    join_code,
    expected_team_size,
    (SELECT COUNT(*) FROM project_members WHERE project_id = projects.id) as current_members,
    is_team_complete
FROM projects
WHERE created_by = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- ⬇️ COPY THE 'project_id' FROM ABOVE ⬇️
-- It looks like: 123e4567-e89b-12d3-a456-426614174000


-- ============================================
-- QUERY 2: Add 3 Members (PASTE YOUR ID BELOW)
-- ============================================

DO $$
DECLARE
    target_project_id UUID := 'PASTE_YOUR_PROJECT_ID_HERE'; -- ⚠️ CHANGE THIS!
    fake_user_1 UUID := gen_random_uuid();
    fake_user_2 UUID := gen_random_uuid();
    fake_user_3 UUID := gen_random_uuid();
BEGIN
    -- Insert 3 fake users
    INSERT INTO public.users (id, email, full_name)
    VALUES 
        (fake_user_1, 'alice.test@localhost.dev', 'Alice Test'),
        (fake_user_2, 'bob.test@localhost.dev', 'Bob Test'),
        (fake_user_3, 'carol.test@localhost.dev', 'Carol Test')
    ON CONFLICT (id) DO NOTHING;

    -- Add them to the project
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES 
        (target_project_id, fake_user_1, 'member'),
        (target_project_id, fake_user_2, 'member'),
        (target_project_id, fake_user_3, 'member')
    ON CONFLICT (project_id, user_id) DO NOTHING;

    RAISE NOTICE '✅ Added 3 test members to project!';
END $$;


-- ============================================
-- QUERY 3: Verify Team Completed
-- ============================================

SELECT 
    p.title,
    p.expected_team_size,
    COUNT(pm.*) as current_members,
    p.is_team_complete as team_complete,
    CASE 
        WHEN p.is_team_complete THEN '✅ UNLOCKED! Refresh dashboard'
        ELSE '⏳ Still waiting...'
    END as status
FROM projects p
LEFT JOIN project_members pm ON pm.project_id = p.id
WHERE p.created_by = auth.uid()
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 1;


-- ============================================
-- BONUS: See All Members
-- ============================================

SELECT 
    pm.role,
    u.email,
    u.full_name,
    pm.joined_at
FROM project_members pm
JOIN users u ON u.id = pm.user_id
JOIN projects p ON p.id = pm.project_id
WHERE p.created_by = auth.uid()
ORDER BY pm.joined_at;


-- ============================================
-- CLEANUP (if you want to start over)
-- ============================================

-- Uncomment and run this if you want to remove test members:
/*
DELETE FROM project_members
WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@localhost.dev'
);

DELETE FROM users 
WHERE email LIKE '%@localhost.dev';

UPDATE projects 
SET is_team_complete = false
WHERE created_by = auth.uid();
*/
