-- Insert basic content filters for auto-moderation
INSERT INTO public.content_filters (filter_type, pattern, is_regex, severity, is_active) VALUES
-- Profanity filters
('profanity', 'spam', false, 2, true),
('profanity', 'scam', false, 3, true),
('profanity', 'phishing', false, 3, true),
('profanity', 'hack', false, 2, true),

-- Spam patterns
('spam', 'CLICK HERE NOW', false, 2, true),
('spam', 'FREE MONEY', false, 2, true),
('spam', 'URGENT!!!', false, 1, true),
('spam', '(.)\1{6,}', true, 2, true), -- 7+ repeated characters

-- Keyword filters
('keyword', 'virus', false, 1, true),
('keyword', 'malware', false, 2, true),
('keyword', 'password', false, 1, true),

-- Regex patterns for advanced detection
('spam', 'https?://[^\s]+\s+https?://[^\s]+\s+https?://[^\s]+', true, 3, true), -- 3+ URLs
('profanity', '\b[A-Z]{10,}\b', true, 1, true); -- 10+ consecutive capitals