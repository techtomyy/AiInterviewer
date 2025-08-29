/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { supabase } from "./supabaseClient.js";

// Load environment variables first
dotenv.config();

console.log("🔧 Starting server...");

// Check required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined. Set it in your .env file for security.");
  process.exit(1);
}

const app = express();

// Middleware
// Allow multiple local dev origins and comma-separated FRONTEND_URL envs
const defaultOrigins = ["http://localhost:5173", "http://localhost:3000"];
const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

console.log("✅ Basic middleware loaded");

// Try loading routes one by one to isolate the issue
try {
  console.log("🔧 Loading auth routes...");
  const authRoutes = await import("./routes/auth.js");
  app.use("/auth", authRoutes.default);
  console.log("✅ Auth routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading auth routes:", error.message);
  process.exit(1);
}

try {
  console.log("🔧 Loading session routes...");
  const sessionRoutes = await import("./routes/session.js");
  app.use("/api", sessionRoutes.default);
  console.log("✅ Session routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading session routes:", error.message);
  process.exit(1);
}

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "✅ InterviewCoach Backend is running 🚀",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Health check for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Example file upload test route (for testing purposes)
app.post("/upload-test", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `test-${Date.now()}-${req.file.originalname}`;

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

// 404 handler (Express v5: avoid "*" which breaks path-to-regexp)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});