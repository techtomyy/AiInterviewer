-- Users Table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- store hashed password
  role TEXT NOT NULL CHECK (role IN ('candidate', 'admin')), -- you can add 'recruiter' later if needed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview Sessions Table
CREATE TABLE interview_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  video_url TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed'))
);

-- AI Feedback Table
CREATE TABLE ai_feedback (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT REFERENCES interview_sessions(id) ON DELETE CASCADE,
  clarity_score NUMERIC(5,2),
  filler_words_count INT,
  eye_contact_score NUMERIC(5,2),
  posture_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  feedback_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings Table (Optional: lets user rate their session)
CREATE TABLE ratings (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
