import React from 'react';
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export function withAuth<P extends object>(
  Component: React.ComponentType<P & { user: any }>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useSupabaseAuth();
    const [, setLocation] = useLocation();

    React.useEffect(() => {
      if (!loading && !user) {
        setLocation("/auth");
      }
    }, [user, loading, setLocation]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return <div>Redirecting to login...</div>;
    }

    return <Component {...props} user={user} />;
  };
}
