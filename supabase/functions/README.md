# Supabase Edge Functions

This directory contains Supabase Edge Functions for the InterviewCoach project.

## Video Conversion Function

The `video-conversion` function automatically converts uploaded WebM videos to MP4 format for better browser compatibility and smaller file sizes.

### Features

- Automatically triggered when a `.webm` file is uploaded to the `raw/` folder in the `interview-videos` storage bucket
- Converts WebM to MP4 using FFmpeg with optimized settings
- Saves the converted MP4 file to the `converted/` folder
- Updates the database with conversion status and new video URL
- Updates the interview session with the MP4 video URL for playback

### Setup Instructions

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (replace with your project reference):
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy video-conversion
   ```

5. **Update the database trigger URL**:
   - In `backend/schema.sql`, replace `your-project-ref` with your actual Supabase project reference:
     ```sql
     url := 'https://your-project-ref.supabase.co/functions/v1/video-conversion'
     ```

6. **Run the database schema**:
   - Go to your Supabase Dashboard > SQL Editor
   - Run the contents of `backend/schema.sql`

### How It Works

1. **Upload**: When a user uploads a WebM video through the backend API, it's stored in `raw/{email}/{sessionId}_{timestamp}_{filename}.webm`

2. **Trigger**: The database trigger detects the upload and calls the Edge Function

3. **Conversion**: The Edge Function:
   - Downloads the WebM file
   - Uses FFmpeg to convert it to MP4 with optimized settings
   - Uploads the MP4 to `converted/{email}/{sessionId}_{timestamp}_{filename}.mp4`

4. **Update**: The function updates:
   - The `conversions` table with completion status
   - The `interview_sessions` table with the new MP4 URL

5. **Display**: The dashboard fetches and displays the MP4 video for playback

### FFmpeg Settings

The conversion uses these optimized settings:
- Video codec: H.264 (libx264)
- Preset: fast
- Quality: CRF 22 (good quality/size balance)
- Audio codec: AAC
- Audio bitrate: 128k
- Fast start: enabled for web playback

### Monitoring

You can monitor conversion progress in the dashboard:
- **Queued**: File uploaded, waiting for conversion
- **Converting...**: FFmpeg processing the video
- **Converted**: MP4 ready for playback
- **Failed**: Conversion error (check logs)

### Troubleshooting

1. **Function not triggering**:
   - Check that the storage bucket trigger is properly set up
   - Verify the Edge Function is deployed and accessible

2. **Conversion failing**:
   - Check Supabase Edge Function logs
   - Ensure FFmpeg dependencies are loading correctly
   - Verify storage permissions

3. **Video not displaying**:
   - Check that the storage bucket is public
   - Verify the converted file URL is correct
   - Ensure CORS settings allow video playback

### Dependencies

The Edge Function uses:
- `@supabase/supabase-js`: Supabase client
- `@ffmpeg/ffmpeg`: FFmpeg WebAssembly build
- `@ffmpeg/util`: FFmpeg utilities

These are automatically resolved via ESM imports in the Deno environment.
