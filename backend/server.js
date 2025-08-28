/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

// Import routes
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";

// Load environment variables
dotenv.config();

// Check required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET is not defined. Set it in your .env file for security.");
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Allow large JSON bodies (base64 video uploads)
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Supabase client (shared across routes)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Pass supabase instance to routes (so they can reuse it)
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/", sessionRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Backend is running 🚀");
});

// Example file upload test route
app.post("/upload-test", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `${Date.now()}-${req.file.originalname}`;

    const { error } = await supabase.storage
      .from("interview-videos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) return res.status(400).json({ error: error.message });

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/interview-videos/${fileName}`;

    res.json({ message: "File uploaded successfully 🚀", url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
