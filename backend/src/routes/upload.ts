/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

import express, { Request, Response } from "express";
import multer from "multer";
import { supabase } from "../supabaseClient";
import { Pool } from "pg";

const router = express.Router();

// configure multer (store file in memory before upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// connect to PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT) || 5432,
});

// route for uploading video
router.post("/upload", upload.single("video"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const candidateId = req.body.candidateId || null; // can be passed from frontend
    const fileName = `${Date.now()}_${req.file.originalname}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("interview-videos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("interview-videos")
      .getPublicUrl(fileName);

    // Save record in DB
    const result = await pool.query(
      "INSERT INTO interview_sessions (candidate_id, video_url) VALUES ($1, $2) RETURNING *",
      [candidateId, publicUrl.publicUrl]
    );

    res.json({
      message: "Video uploaded successfully ✅",
      session: result.rows[0],
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
