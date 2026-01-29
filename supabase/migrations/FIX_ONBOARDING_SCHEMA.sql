-- ==============================================================================
-- FIX ONBOARDING SCHEMA
-- This script sets up the necessary tables and RLS policies for the new onboarding flow.
-- Run this in Supabase SQL Editor.
-- ==============================================================================

-- 1. Update Users Table (profiles) logic
-- We assume a public table 'users' exists (linked to auth.users). 
-- If your table is named 'profiles', please adjust the name below.
-- We add 'role' to store if they are a LEADER or MEMBER, and 'onboarding_completed' flag.

DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('LEADER', 'MEMBER'));
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_team_id uuid REFERENCES public.projects(id);
    END IF;
END $$;

-- 2. Create Join Requests Table
-- Handles users requesting to join a specific team
CREATE TABLE IF NOT EXISTS public.join_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    team_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own requests
CREATE POLICY "Users can view own join requests" ON public.join_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create join requests" ON public.join_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Team Leaders (Owners) can view requests for their projects
-- (Complexity: assumes project_members table links owners)
CREATE POLICY "Team users can view requests" ON public.join_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = join_requests.team_id
            AND pm.user_id = auth.uid()
            AND pm.role = 'owner'
        )
    );

-- Policy: Team Leaders can update requests (approve/reject)
CREATE POLICY "Team leaders can update requests" ON public.join_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = join_requests.team_id
            AND pm.user_id = auth.uid()
            AND pm.role = 'owner'
        )
    );


-- 3. Create Invites Table
-- Handles pre-generated invites for emails
CREATE TABLE IF NOT EXISTS public.invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'member',
    invite_code text, -- Optional alphanumeric code
    status text DEFAULT 'pending', -- pending, accepted, expired
    expires_at timestamptz,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view invites for their team
CREATE POLICY "Team members view invites" ON public.invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = invites.team_id
            AND pm.user_id = auth.uid()
        )
    );

-- Policy: Team leaders can create invites
CREATE POLICY "Team leaders create invites" ON public.invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = invites.team_id
            AND pm.user_id = auth.uid()
            AND pm.role = 'owner'
        )
    );

-- Policy: Anyone valid can see invites matching their email (for accepting)
CREATE POLICY "User view own invites" ON public.invites
    FOR SELECT USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );


-- 4. Helper function to approve join request (Optional but neat)
CREATE OR REPLACE FUNCTION approve_join_request(request_id uuid)
RETURNS void AS $$
DECLARE
    req_record record;
BEGIN
    -- Get request
    SELECT * INTO req_record FROM public.join_requests WHERE id = request_id;
    
    IF req_record.status = 'pending' THEN
        -- Add to project members
        INSERT INTO public.project_members (project_id, user_id, role)
        VALUES (req_record.team_id, req_record.user_id, 'member');
        
        -- Update request status
        UPDATE public.join_requests SET status = 'approved' WHERE id = request_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
