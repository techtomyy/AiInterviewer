const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { supabase } = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabaseAdmin');

const router = express.Router();

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify auth
const authenticate = async (req, res, next) => {
  try {
    console.log("Authorization header received:", req.headers.authorization);

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log("No token provided in header");
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log("Token extracted:", token.substring(0, 50) + "...");
    console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
    console.log("SUPABASE_ANON_KEY exists:", !!process.env.SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.getUser(token);
    console.log("Supabase auth response:", { data: data ? "user found" : "no user", error });

    if (error) {
      console.error("Auth error details:", error);
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }

    if (!data.user) {
      console.error("No user data in response");
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log("User authenticated:", data.user.id);
    req.user = data.user;
    req.token = token; // Store token for user-specific client
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// ---------------- Create Session ----------------
router.post('/session', authenticate, upload.single('video'), async (req, res) => {
  try {
    console.log('Starting session creation...');
    const { title = 'Interview Session' } = req.body;
    const file = req.file;
    const userId = req.user.id;

    console.log('User ID:', userId);
    console.log('File received:', file ? file.originalname : 'No file');

    if (!file) return res.status(400).json({ error: 'No video file provided' });

    // Upload to Supabase Storage
    const fileName = `${userId}/${Date.now()}_${file.originalname}`;
    console.log('Uploading to storage:', fileName);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('interview-videos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('interview-videos')
      .getPublicUrl(fileName);
    console.log('Public URL:', urlData.publicUrl);

    // Ensure user exists in users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // Insert user if not exists using supabaseAdmin with RLS bypass
      const { error: userInsertError } = await supabaseAdmin
        .from('users')
        .insert([{ id: userId, email: req.user.email, role: 'candidate' }], { returning: 'minimal' });
      if (userInsertError) {
        console.error('User insert error:', userInsertError);
        throw userInsertError;
      }
    }

    // Save to database
    const { data: sessionData, error: dbError } = await supabase
      .from('interview_sessions')
      .insert([{ user_id: userId, title, video_url: urlData.publicUrl }])
      .select();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw dbError;
    }

    res.status(201).json({ message: 'Session created', session: sessionData[0] });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Get session status ----------------
router.get('/session/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  res.json({ id, status: 'completed', message: 'Session is ready' });
});

// ---------------- Get user's sessions ----------------
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Delete session ----------------
router.delete('/session/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: session, error: fetchError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !session) return res.status(404).json({ error: 'Session not found' });

    const fileName = session.video_url.split('/').pop();
    await supabaseAdmin.storage.from('interview-videos').remove([fileName]);

    const { error } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('id', id);
    if (error) throw error;

    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Upload video for existing session ----------------
router.post('/upload', authenticate, upload.single('video'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file || !sessionId) return res.status(400).json({ error: 'Video file and sessionId required' });

    const { data: session, error: fetchError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !session) return res.status(404).json({ error: 'Session not found' });

    const fileName = `${userId}/${sessionId}_${file.originalname}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('interview-videos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('interview-videos')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({ video_url: urlData.publicUrl })
      .eq('id', sessionId);
    if (updateError) throw updateError;

    res.json({ message: 'Video uploaded', video_url: urlData.publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
