-- =====================================================
-- ADD PROPER ATTACHMENT SUPPORT TO MESSAGES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add attachment columns to messages table if they don't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT, -- 'image', 'document', 'video', 'audio'
ADD COLUMN IF NOT EXISTS attachment_size BIGINT; -- Size in bytes

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_with_attachments 
ON messages(room_id, created_at DESC) 
WHERE attachment_url IS NOT NULL;

-- Comment for clarity
COMMENT ON COLUMN messages.attachment_url IS 'Public URL to the uploaded file in Supabase Storage';
COMMENT ON COLUMN messages.attachment_name IS 'Original filename';
COMMENT ON COLUMN messages.attachment_type IS 'File type: image, document, video, audio';
COMMENT ON COLUMN messages.attachment_size IS 'File size in bytes';
