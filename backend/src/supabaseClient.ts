/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */
// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Replace with your values
const SUPABASE_URL = "https://jrrgkhxtlrwpiydzhaxo.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycmdraHh0bHJ3cGl5ZHpoYXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5ODgyMzcsImV4cCI6MjA3MDU2NDIzN30.VXPLugxKZSKBSDno98fYf3PzLhFmBlMetydXGNSWrss"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
