/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        // Store the access token for API calls
        const token = data.session.access_token;
        if (token) {
          localStorage.setItem('supabase_token', token);
        }
        navigate("/dashboard"); // ✅ redirect after login
      } else {
        // Try to refresh session or prompt login
        const { data: refreshedData, error } = await supabase.auth.refreshSession();
        if (refreshedData?.session) {
          const token = refreshedData.session.access_token;
          if (token) {
            localStorage.setItem('supabase_token', token);
          }
          navigate("/dashboard");
        } else {
          navigate("/auth");
        }
      }
    });
  }, [navigate]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}
