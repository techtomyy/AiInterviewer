import { useState, useEffect } from "react";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate authentication check
    const timer = setTimeout(() => {
      // Mock user data for demo purposes
      setUser({
        id: "1",
        email: "demo@example.com",
        name: "Demo User",
        planType: "free",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
