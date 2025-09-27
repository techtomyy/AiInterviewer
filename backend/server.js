/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { supabase } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidate', require('./routes/candidate'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/interview', require('./routes/analysis'));

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });



// Health check
app.get('/', (req, res) => {
  res.send('InterviewCoach Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { supabase };
