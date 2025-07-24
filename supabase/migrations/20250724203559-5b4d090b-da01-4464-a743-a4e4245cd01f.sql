-- Create performance-optimized indexes for high-traffic queries

-- Index for message loading (most common query)
CREATE INDEX IF NOT EXISTS idx_messages_created_at_not_deleted 
ON public.messages (created_at DESC) 
WHERE is_deleted = false;

-- Index for message search functionality
CREATE INDEX IF NOT EXISTS idx_messages_content_search 
ON public.messages USING gin(to_tsvector('english', content))
WHERE is_deleted = false;

-- Index for user's own messages (for edit/delete operations)
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
ON public.messages (sender_id) 
WHERE sender_id IS NOT NULL AND is_deleted = false;

-- Index for reactions by message (for loading reactions)
CREATE INDEX IF NOT EXISTS idx_reactions_message_id 
ON public.message_reactions (message_id);

-- Index for user reactions (to check if user already reacted)
CREATE INDEX IF NOT EXISTS idx_reactions_user_message 
ON public.message_reactions (user_id, message_id);

-- Index for reports by status (for moderation)
CREATE INDEX IF NOT EXISTS idx_reports_status 
ON public.message_reports (status, created_at DESC);

-- Index for private messages efficiency
CREATE INDEX IF NOT EXISTS idx_private_messages_participants 
ON public.private_messages (sender_id, receiver_id, created_at DESC);

-- Analyze tables to update statistics
ANALYZE public.messages;
ANALYZE public.message_reactions;
ANALYZE public.message_reports;
ANALYZE public.private_messages;