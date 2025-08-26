/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createUser, getUserByEmail } from '../services/session.service.js';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '1d' }
  );
}

export async function signup(req, res) {
  try {
    const { name, email, password, role = 'candidate' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash, role });

    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// Stateless logout (client discards token). If you want blacklist, use Redis, etc.
export async function logout(_req, res) {
  return res.json({ message: 'Logged out (client should discard token).' });
}
