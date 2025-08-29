/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

import express from "express";
import { supabase } from "../supabaseClient.js";
// import { authenticateToken, requireRole } from "../middleware/auth.js"; // ❌ COMMENTED OUT TEMPORARILY

const router = express.Router();

// ✅ Create Session (ensures a local users row exists by email, then links by users.id)
router.post("/candidate/session", async (req, res) => {
  try {
    const { user_id, email, position, questions, video_url } = req.body;

    // 1) Ensure there is a local users row. Prefer email to find/create
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Try to find user by email
    let { data: existingUser, error: findErr } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (findErr) return res.status(400).json({ error: findErr.message });

    // Create minimal user row if missing
    if (!existingUser) {
      const { data: created, error: createErr } = await supabase
        .from("users")
        .insert([{ email, role: "candidate", password: "" }])
        .select()
        .single();
      if (createErr) return res.status(400).json({ error: createErr.message });
      existingUser = created;
    }

    // 2) Create interview session linked to local users.id (only existing columns)
    const payload = {
      user_id: existingUser.id,
      video_url: video_url || null,
      status: 'created'
    };

    const { data, error } = await supabase
      .from("interview_sessions")
      .insert([payload])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Session created", session: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Session Status (TEMPORARILY without auth protection)
router.get("/candidate/session/:id/status", async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    const { data: session, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) return res.status(404).json({ error: "Session not found" });

    res.json({ 
      sessionId: sessionId, 
      status: session.status || "pending",
      video_url: session.video_url 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Upload Video: ensure local user exists by email, then link session to users.id
router.post("/upload", async (req, res) => {
  try {
    const { file, userId, email } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Ensure local user exists by email
    let { data: existingUser, error: findErr } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();
    if (findErr) return res.status(400).json({ error: findErr.message });
    if (!existingUser) {
      const { data: created, error: createErr } = await supabase
        .from("users")
        .insert([{ email, role: "candidate", password: "" }])
        .select()
        .single();
      if (createErr) return res.status(400).json({ error: createErr.message });
      existingUser = created;
    }

    const fileName = `${existingUser.id}-${Date.now()}.mp4`;

    const { error } = await supabase.storage
      .from("interview-videos")
      .upload(fileName, Buffer.from(file, "base64"), {
        contentType: "video/mp4",
      });

    if (error) return res.status(400).json({ error: error.message });

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/interview-videos/${fileName}`;

    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .insert([{ user_id: existingUser.id, video_url: fileUrl, status: 'uploaded' }])
      .select();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
    }

    res.json({ 
      message: "Video uploaded successfully 🚀", 
      url: fileUrl,
      session: session?.[0] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get User's Sessions (TEMPORARILY without auth protection)
router.get("/candidate/sessions", async (req, res) => {
  try {
    // For now, get all sessions (you'll need to pass user_id as query param)
    const { user_id } = req.query;
    
    const { data: sessions, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;