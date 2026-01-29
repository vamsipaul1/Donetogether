-- ============================================
-- DEBUG HELPER - Check Join Codes
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. See all your projects and their join codes
SELECT 
    id,
    title,
    join_code,
    expected_team_size,
    is_team_complete,
    created_at,
    (SELECT COUNT(*) FROM project_members WHERE project_id = projects.id) as current_members
FROM projects
WHERE created_by = auth.uid()
ORDER BY created_at DESC;

-- 2. Check if specific join code exists (replace 'UNOVXP' with your actual code)
SELECT 
    id,
    title,
    join_code,
    expected_team_size,
    is_team_complete
FROM projects
WHERE join_code = 'UNOVXP';  -- Replace with your code

-- 3. See all members of a specific project (replace project_id)
SELECT 
    pm.role,
    u.email,
    u.full_name,
    pm.joined_at
FROM project_members pm
LEFT JOIN users u ON u.id = pm.user_id
WHERE pm.project_id = 'YOUR_PROJECT_ID_HERE'
ORDER BY pm.joined_at;

-- 4. Check RLS policies are working
-- This should return true if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'project_members', 'tasks');
