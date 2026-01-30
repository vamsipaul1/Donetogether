ALTER TABLE project_members
ADD COLUMN IF NOT EXISTS can_manage_tasks BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_invite_members BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_view_analytics BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_edit_project_details BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_timeline BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_restore_tasks BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_resources BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_post_messages BOOLEAN DEFAULT FALSE;

UPDATE project_members
SET
  can_manage_tasks = TRUE,
  can_invite_members = TRUE,
  can_view_analytics = TRUE,
  can_edit_project_details = TRUE,
  can_manage_timeline = TRUE,
  can_restore_tasks = TRUE,
  can_manage_resources = TRUE,
  can_post_messages = TRUE
WHERE role = 'owner';
