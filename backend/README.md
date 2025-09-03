# InterviewCoach Backend

Backend for InterviewCoach application using Node.js, Express, and Supabase.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env`:
   - SUPABASE_URL: Your Supabase project URL
   - SUPABASE_ANON_KEY: Your Supabase anon key
   - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (for server-side operations)
   - JWT_SECRET: A secret for JWT (if needed)
   - PORT: Port to run the server (default 5000)

3. Set up Supabase:
   - Create a Supabase project.
   - Create a storage bucket named `interview-videos`.
   - Run the SQL in `schema.sql` in your Supabase SQL editor to create tables and policies.

4. Run the server:
   ```
   npm start
   ```
   or for development:
   ```
   npm run dev
   ```

## Testing the API

1. Start the server.

2. Use a tool like Postman or curl to test endpoints.

### Auth Tests
- Signup: POST to http://localhost:5000/api/auth/signup with JSON body: {"email": "test@example.com", "password": "password123", "role": "candidate"}
- Login: POST to http://localhost:5000/api/auth/login with JSON body: {"email": "test@example.com", "password": "password123"}
- Logout: POST to http://localhost:5000/api/auth/logout (include Authorization header: Bearer <token>)

### Session Tests
- Create Session: POST to http://localhost:5000/api/candidate/session with form-data: video (file), title (text), and Authorization header.
- Get Sessions: GET to http://localhost:5000/api/candidate/sessions with Authorization header.
- Get Status: GET to http://localhost:5000/api/candidate/session/1/status with Authorization header.
- Delete Session: DELETE to http://localhost:5000/api/candidate/session/1 with Authorization header.

## Troubleshooting

### Schema Cache Error
If you encounter the error "Could not find the 'title' column of 'interview_sessions' in the schema cache":
1. Go to your Supabase Dashboard > SQL Editor.
2. Re-run the `schema.sql` file to refresh the schema.
3. Alternatively, restart your Supabase project to clear the cache.
4. If using local Supabase, restart the local development server.

### Authentication Issues
- Ensure the Authorization header is in the format: `Bearer <token>`
- The token is obtained from the login response.
- For database operations, the service role key is used, but user authentication is verified with the anon key.

### Video Upload Issues
- Ensure the `interview-videos` bucket exists in Supabase Storage.
- Check that the bucket is public or has appropriate policies.
- Verify the file is a valid video format.

## API Endpoints

### Auth
- POST /api/auth/signup: Sign up a new user
- POST /api/auth/login: Log in
- POST /api/auth/logout: Log out

### Candidate
- POST /api/candidate/session: Create a new interview session and upload video
- GET /api/candidate/session/:id/status: Get session status (mock)
- GET /api/candidate/sessions: Get user's sessions
- DELETE /api/candidate/session/:id: Delete a session

## Notes
- Authentication uses Supabase Auth.
- Videos are stored in Supabase Storage.
- Data is user-specific via RLS.
- For WebRTC, frontend should record video and send as multipart/form-data to /candidate/session.
