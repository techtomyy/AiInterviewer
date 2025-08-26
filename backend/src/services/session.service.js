/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/services/session.service.js
import { pool } from '../config/db.js';

export async function createUser({ name, email, passwordHash, role }) {
  const q = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const { rows } = await pool.query(q, [name, email, passwordHash, role]);
  return rows[0];
}

export async function getUserByEmail(email) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
  return rows[0];
}

export async function createInterviewSession({ userId, videoUrl = null, audioUrl = null }) {
  const q = `
    INSERT INTO interview_sessions (user_id, video_url, audio_url, status)
    VALUES ($1, $2, $3, 'in_progress')
    RETURNING *
  `;
  const { rows } = await pool.query(q, [userId, videoUrl, audioUrl]);
  return rows[0];
}

export async function updateSessionVideo({ sessionId, videoUrl }) {
  const q = `
    UPDATE interview_sessions SET video_url=$1
    WHERE id=$2
    RETURNING *
  `;
  const { rows } = await pool.query(q, [videoUrl, sessionId]);
  return rows[0];
}

export async function getSessionById(id) {
  const { rows } = await pool.query(`SELECT * FROM interview_sessions WHERE id=$1`, [id]);
  return rows[0];
}
