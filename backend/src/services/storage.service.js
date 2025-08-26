/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/services/storage.service.js
import supabase from '../config/supabase.js';

export async function uploadBufferToSupabase(path, buffer, contentType) {
  const bucket = process.env.SUPABASE_BUCKET;
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw error;

  // public URL (if bucket is public) or signed URL otherwise
  const { data: urlData } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}
