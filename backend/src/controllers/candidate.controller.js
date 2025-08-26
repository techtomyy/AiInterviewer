/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/controllers/candidate.controller.js
import { uploadBufferToSupabase } from '../services/storage.service.js';
import { createInterviewSession, updateSessionVideo, getSessionById } from '../services/session.service.js';
import crypto from 'crypto';

export async function createSession(req, res) {
  try {
    // If frontend already sent a video file with the request, we’ll store it.
    const userId = req.user.sub;
    let videoUrl = null;

    if (req.file) {
      // Sanitize filename: only allow letters, numbers, dots, dashes, and underscores
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ext = (safeName.split('.').pop() || 'webm').toLowerCase();
      const path = `user_${userId}/session_${Date.now()}_${crypto.randomUUID()}.${ext}`;
      videoUrl = await uploadBufferToSupabase(path, req.file.buffer, req.file.mimetype || 'video/webm');
    }

    const session = await createInterviewSession({ userId, videoUrl });
    return res.status(201).json({ session });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export async function getSessionStatus(req, res) {
  try {
    // Mock response for now
    const { id } = req.params;
    const session = await getSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Example mock
    return res.json({
      id: session.id,
      status: session.status,            // 'in_progress' or 'completed'
      processing: false,
      ai_feedback_ready: false
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// Accept raw/multipart video and attach to a session
export async function webrtcUpload(req, res) {
  try {
    const userId = req.user.sub;
    const { sessionId } = req.body || {};

    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

  // Sanitize filename: only allow letters, numbers, dots, dashes, and underscores
  const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = (safeName.split('.').pop() || 'webm').toLowerCase();
  const key = `user_${userId}/session_${sessionId}_${Date.now()}_${crypto.randomUUID()}.${ext}`;

  const url = await uploadBufferToSupabase(key, req.file.buffer, req.file.mimetype || 'video/webm');

  const updated = await updateSessionVideo({ sessionId, videoUrl: url });
  return res.status(200).json({ session: updated });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
