/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/middleware/auth.js
import jwt from 'jsonwebtoken';

export function authRequired(...roles) {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Missing token' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;

      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
