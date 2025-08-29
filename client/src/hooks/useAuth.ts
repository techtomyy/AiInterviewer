import { useState, useEffect } from "react";
import { supabase } from "@/lib/suppabaseClient";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || "",
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
          planType: "free",
          createdAt: session.user.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            firstName: session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || "",
            lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
            planType: "free",
            createdAt: session.user.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
