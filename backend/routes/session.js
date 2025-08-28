/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

import express from "express";
import { supabase } from "../supabaseClient.js"; // ✅ centralized

const router = express.Router();

// ✅ Create Session
router.post("/candidate/session", async (req, res) => {
  try {
    const { user_id, video_url } = req.body;

    const { data, error } = await supabase
      .from("interview_sessions")
      .insert([{ user_id, video_url }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Session created", session: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Session Status (mock)
router.get("/candidate/session/:id/status", async (req, res) => {
  res.json({ sessionId: req.params.id, status: "pending" });
});

// ✅ Upload Video to Supabase Storage
router.post("/upload", async (req, res) => {
  try {
    const { file, userId } = req.body; // frontend sends base64 video

    const fileName = `${userId}-${Date.now()}.mp4`;

    const { error } = await supabase.storage
      .from("interview-videos")
      .upload(fileName, Buffer.from(file, "base64"), {
        contentType: "video/mp4",
      });

    if (error) return res.status(400).json({ error: error.message });

    // Public URL
    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/interview-videos/${fileName}`;

    // Save session in DB
    await supabase
      .from("interview_sessions")
      .insert([{ user_id: userId, video_url: fileUrl }]);

    res.json({ message: "Video uploaded successfully 🚀", url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
