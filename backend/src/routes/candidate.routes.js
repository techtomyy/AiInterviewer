/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/routes/candidate.routes.js
import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/auth.js';
import { createSession, getSessionStatus, webrtcUpload } from '../controllers/candidate.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create session (optionally with immediate video upload)
// POST /candidate/session
router.post('/session', authRequired('candidate', 'admin'), upload.single('video'), createSession);

// GET /candidate/session/:id/status (mock)
router.get('/session/:id/status', authRequired('candidate', 'admin'), getSessionStatus);

// WebRTC upload target
// POST /webrtc/upload (expects multipart: { sessionId, video })
router.post('/webrtc/upload', authRequired('candidate', 'admin'), upload.single('video'), webrtcUpload);

export default router;
