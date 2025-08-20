/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/suppabaseClient";

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard"); // ✅ redirect after login
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}
