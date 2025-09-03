import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/suppabaseClient";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useState } from "react";
import { 
  Video, 
  TrendingUp, 
  Users, 
  Award,
  Calendar,
  PlayCircle,
  BarChart3,
  LogIn,
  UserPlus,
  ArrowRight,
  LogOut,
  User
} from "lucide-react";

export default function Home() {
  const { user, loading } = useSupabaseAuth();
  const [, navigate] = useLocation();
  const [localUser, setLocalUser] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Debug logging
  console.log("Home component - Auth state:", { user, loading, userId: user?.id, userEmail: user?.email });
  console.log("Local auth state:", { localUser, localLoading });
  
  // Force refresh authentication state with local state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLocalLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Current session:", session);
        console.log("Session error:", error);
        
        if (session?.user) {
          console.log("User is authenticated:", session.user);
          console.log("User ID:", session.user.id);
          console.log("User email:", session.user.email);
          setLocalUser(session.user);
        } else {
          console.log("No active session found");
          setLocalUser(null);
        }
        
        // Also check if there are any stored tokens
        const accessToken = localStorage.getItem('sb-access-token');
        const refreshToken = localStorage.getItem('sb-refresh-token');
        console.log("Stored tokens:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
        
        // Check all localStorage keys that might contain auth data
        const allKeys = Object.keys(localStorage);
        const authKeys = allKeys.filter(key => key.includes('supabase') || key.includes('auth') || key.includes('sb-'));
        console.log("All auth-related localStorage keys:", authKeys);
        
        setLocalLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setLocalLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Manual refresh function for debugging
  const refreshAuth = async () => {
    console.log("Manual auth refresh triggered");
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Refreshed session:", session);
      console.log("Session error:", error);
      
      if (session?.user) {
        console.log("User is authenticated after refresh:", session.user);
        setLocalUser(session.user);
        setLocalLoading(false);
      } else {
        console.log("Still no active session");
        setLocalUser(null);
        setLocalLoading(false);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setLocalUser(null);
      setLocalLoading(false);
    }
  };
  
  // Show loading while checking authentication
  if (localLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const { data: sessions = [] } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
    enabled: !!localUser,
  });

  const { data: stats = {} } = useQuery<any>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  // Handle logout
  const handleLogout = async () => {
    console.log("Logout clicked - User before logout:", localUser);
    try {
      await supabase.auth.signOut();
      console.log("Logout successful, redirecting to /home");
      setLocalUser(null); // Clear local state
      navigate("/home");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to home
      setLocalUser(null); // Clear local state
      navigate("/home");
    }
  };

  // Loading is now handled in the component itself

  const handleGetStarted = () => {
    console.log("Get Started clicked - User:", localUser);
    if (localUser && localUser.id) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    } else {
      console.log("User is not authenticated, redirecting to auth");
      navigate("/auth");
    }
  };

  const handleStartFreeTrial = () => {
    console.log("Start Free Trial clicked - User:", localUser);
    if (localUser && localUser.id) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    } else {
      console.log("User is not authenticated, redirecting to auth");
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Debug Status Bar - Remove this in production */}
      <div className="bg-yellow-100 p-2 text-center text-sm">
        🔍 Debug: Hook User ID: {user?.id || 'None'} | Local User ID: {localUser?.id || 'None'} | Loading: {localLoading.toString()}
        <Button variant="outline" size="sm" onClick={refreshAuth} className="ml-2">
          🔄 Refresh Auth
        </Button>
      </div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-neutral">
                Interview Coach
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {localUser && localUser.id ? (
                <>
                  {/* Replace Sign In button with Logout button */}
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {/* Show Sign In button when not authenticated */}
                  <Link href="/auth">
                    <Button variant="ghost">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  
                  {/* Debug button - only show when not authenticated */}
                  <Button variant="outline" size="sm" onClick={refreshAuth}>
                    🔄 Refresh Auth
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Your Interview Skills
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice interviews with AI-powered feedback, track your progress, and build confidence 
            for your next job opportunity. Record yourself answering real interview questions and get instant insights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-blue-800 px-8 py-4 text-lg"
              size="lg"
            >
              {localUser && localUser.id ? (
                <>
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
            <Button 
              onClick={handleStartFreeTrial}
              variant="outline" 
              className="px-8 py-4 text-lg border-2"
              size="lg"
            >
              {localUser && localUser.id ? (
                <>
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start New Interview
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Free Trial
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Ace Your Interview
          </h2>
          <p className="text-lg text-gray-600">
            Comprehensive tools and features to help you prepare and succeed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Recording</h3>
              <p className="text-gray-600">
                Record your interview responses with high-quality video and audio
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Get instant feedback on your communication skills and body language
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your improvement over time with detailed analytics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice Questions</h3>
              <p className="text-gray-600">
                Access a library of common interview questions and scenarios
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Tips</h3>
              <p className="text-gray-600">
                Learn from industry professionals and career coaches
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Certification</h3>
              <p className="text-gray-600">
                Earn certificates to showcase your interview preparation skills
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Interview Skills?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have improved their interview performance with our platform
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            size="lg"
          >
            {localUser && localUser.id ? (
              <>
                <User className="h-5 w-5 mr-2" />
                View Profile
              </>
            ) : (
              <>
                Start Your Journey Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
