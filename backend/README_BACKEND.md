# Backend Setup Guide for InterviewCoach

## 1. PostgreSQL Database Setup

- Make sure PostgreSQL is installed and running.
- Create a database (e.g., `interviewcoach`).
- Run the migration script in `backend/sql/001_init.sql` to create tables:
  ```sh
  psql -U <your_user> -d interviewcoach -f backend/sql/001_init.sql
  ```
- Update your `backend/.env` with your DB credentials if you want to use your own DB (currently, Supabase is used for storage and auth).

## 2. Supabase Setup

- Go to https://app.supabase.com/ and create a project.
- In your Supabase project, go to **Storage** > **Create a new bucket**:
  - Name: `interview-videos`
  - Public: Yes (or configure signed URLs if you want private access)
- In **Project Settings > API**, copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- In **Project Settings > Service Role**, copy your `SUPABASE_SERVICE_ROLE` key (for server-side use only).
- Update your `backend/.env` with these values.

## 3. Environment Variables

Your `backend/.env` should look like:

```
PORT=5000
JWT_SECRET=supersecret_change_me
JWT_EXPIRES=1d
SUPABASE_URL=... (from Supabase)
SUPABASE_ANON_KEY=... (from Supabase)
SUPABASE_SERVICE_ROLE=... (from Supabase)
SUPABASE_BUCKET=interview-videos
```

## 4. Running the Backend

From the `backend/` folder:

```sh
npm install
npm start
```

## 5. API Endpoints

- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login
- `POST /auth/logout` — Logout
- `POST /candidate/session` — Create session & upload video
- `GET /candidate/session/:id/status` — Get session status
- `POST /candidate/webrtc/upload` — WebRTC video upload

## 6. Supabase Storage Integration

- Video files uploaded via `/candidate/session` or `/candidate/webrtc/upload` are stored in the `interview-videos` bucket.
- The public URL of the uploaded file is saved in the database for each session.

---

**If you need help with any step, let your team know!**
