const express = require('express');
const { supabase } = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabaseAdmin');

const router = express.Router();

// ------------------- Signup -------------------
router.post('/signup', async (req, res) => {
  const { email, password, role = 'candidate' } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Insert user role into users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{ id: data.user.id, email, role }]);
    if (insertError) throw insertError;

    res.status(201).json({ message: 'User created', user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ------------------- Login -------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    res.json({ message: 'Logged in', user: data.user, session: data.session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ------------------- Logout -------------------
// This logout route expects a refresh_token in the request body
router.post('/logout', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Log out using Supabase with the refresh token
    const { error } = await supabase.auth.signOut({ refresh_token });
    if (error) throw error;

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
