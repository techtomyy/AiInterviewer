-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Users table (if not already created by Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'candidate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    title TEXT,
    video_url TEXT,
    status TEXT DEFAULT 'created',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Conversions table to track video conversion status
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, converting, completed, failed
    original_url TEXT,
    converted_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for interview_sessions table
DROP POLICY IF EXISTS "Users can view their own sessions" ON interview_sessions;
CREATE POLICY "Users can view their own sessions" ON interview_sessions
    FOR SELECT USING (auth.email() = user_email);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON interview_sessions;
CREATE POLICY "Users can insert their own sessions" ON interview_sessions
    FOR INSERT WITH CHECK (auth.email() = user_email OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update their own sessions" ON interview_sessions;
CREATE POLICY "Users can update their own sessions" ON interview_sessions
    FOR UPDATE USING (auth.email() = user_email);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON interview_sessions;
CREATE POLICY "Users can delete their own sessions" ON interview_sessions
    FOR DELETE USING (auth.email() = user_email);

-- RLS Policies for conversions table (allow all authenticated users to read, but restrict writes)
DROP POLICY IF EXISTS "Authenticated users can view conversions" ON conversions;
CREATE POLICY "Authenticated users can view conversions" ON conversions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Storage bucket policies for interview-videos
-- Make sure the bucket is public for video access
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-videos', 'interview-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for interview-videos bucket
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

CREATE POLICY "Users can upload their own videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'interview-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'interview-videos');

CREATE POLICY "Users can update their own videos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'interview-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own videos" ON storage.objects
    FOR DELETE USING (bucket_id = 'interview-videos' AND auth.role() = 'authenticated');

-- Note: Video conversion is now handled by the backend API calling the Edge Function directly
-- after file upload, rather than using database triggers.
