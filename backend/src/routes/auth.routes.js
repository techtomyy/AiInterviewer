import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({
      user: data?.user || null,
      session: data?.session || null,
      message: "Signup successful",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({
      user: data?.user || null,
      session: data?.session || null,
      message: "Login successful",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
