const express = require('express');
const { supabaseAdmin } = require('../config/supabaseAdmin'); // Admin client with service role key
const router = express.Router();

// Middleware to authenticate user and set req.user.email
const authenticate = async (req, res, next) => {
  // Your existing authentication logic here
  next();
};

router.delete('/session/:id', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userEmail = req.user.email;

    // Fetch the session to get video_url
    const { data: session, error: fetchError } = await supabaseAdmin
      .from('interview_sessions')
      .select('video_url')
      .eq('id', sessionId)
      .eq('user_email', userEmail)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    if (!session.video_url) {
      return res.status(400).json({ error: 'No video to delete' });
    }

    // Extract file paths from video_url
    const url = new URL(session.video_url);
    // Remove leading slash and bucket prefix
    const convertedFilePath = url.pathname.replace(/^\/?interview-videos\//, '');

    // Derive raw file path from converted file path
    const rawFilePath = convertedFilePath.replace('converted/', 'raw/').replace('.mp4', '.webm');

    // Delete both files from storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from('interview-videos')
      .remove([convertedFilePath, rawFilePath]);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete video files', details: deleteError.message });
    }

    // Delete the session row from the database
    const { error: deleteSessionError } = await supabaseAdmin
      .from('interview_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_email', userEmail);

    if (deleteSessionError) {
      return res.status(500).json({ error: 'Failed to delete session record', details: deleteSessionError.message });
    }

    res.json({ message: 'Video and session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
