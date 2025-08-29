import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProgressChart from "@/components/ProgressChart";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/suppabaseClient";
import { 
  PlayCircle, 
  Calendar, 
  Clock, 
  Eye, 
  Target, 
  Video, 
  RefreshCw,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Brain
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // 🚀 Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/auth");
  }

  // 🔒 Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 📊 Fetch sessions using the correct user ID
  const { data: sessionsData, isLoading: sessionsLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/sessions", user?.id],
    enabled: !!user?.id,
    retry: false,
    queryFn: async () => {
      try {
        console.log("Fetching sessions for user:", user?.id);
        const apiUrl = `${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000'}/api/candidate/sessions?user_id=${user?.id}`;
        console.log("API URL:", apiUrl);
        
        const res = await fetch(apiUrl);
        console.log("Response status:", res.status);
        console.log("Response headers:", res.headers);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const json = await res.json();
        console.log("Fetched sessions:", json);
        return json.sessions || [];
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast({
          title: "Error fetching sessions",
          description: "Failed to load your interview sessions. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  const { data: feedbackData } = useQuery<any>({
    queryKey: ["/api/sessions/feedback/all"],
    enabled: !!user,
    retry: false,
    queryFn: async () => ({})
  });

  const sessions = sessionsData ?? []; // ✅ always an array

  // 🔢 Stats
  const completedSessions = sessions.filter(
    (s: any) => s?.status === "completed" || s?.status === "uploaded"
  );

  const averageScore =
    completedSessions.length > 0
      ? completedSessions.reduce(
          (acc: number, session: any) => acc + (session?.overallScore || 8.2),
          0
        ) / completedSessions.length
      : 0;

  const thisWeekSessions = sessions.filter((s: any) => {
    if (!s?.created_at) return false;
    const sessionDate = new Date(s.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate > weekAgo;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'created':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'created':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading || sessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔝 Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" data-testid="button-back">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-neutral">
                Interview Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.firstName?.[0] ?? ""}
                    {user?.lastName?.[0] ?? ""}
                  </span>
                </div>
                <span className="text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Link href="/interview">
                <Button
                  className="bg-primary hover:bg-blue-800"
                  data-testid="button-new-interview"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  New Interview
                </Button>
              </Link>
              {/* 🚀 Logout button */}
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 📊 Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ✅ Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Total Sessions</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">
                {thisWeekSessions.length} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Average Score</CardTitle>
              <Target className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{averageScore.toFixed(1)}/10</p>
              <Progress value={(averageScore / 10) * 100} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Completed</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{completedSessions.length}</p>
              <p className="text-sm text-muted-foreground">
                sessions completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={completedSessions} />
          </CardContent>
        </Card>

        {/* ✅ Interview Sessions Grid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Interview Sessions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
                <p className="text-gray-500 mb-6">Start your first interview to see your progress here.</p>
                <Link href="/interview">
                  <Button className="bg-primary hover:bg-blue-800">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Your First Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session: any) => (
                  <Card key={session?.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(session?.status)}
                          <span className="text-sm font-medium text-gray-900">
                            Interview #{session?.id?.slice(0, 8)}...
                          </span>
                        </div>
                        {getStatusBadge(session?.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">
                            {session?.created_at 
                              ? new Date(session.created_at).toLocaleDateString()
                              : "Unknown"
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="text-gray-900">
                            {session?.created_at 
                              ? new Date(session.created_at).toLocaleTimeString()
                              : "Unknown"
                            }
                          </span>
                        </div>
                        {session?.video_url && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Video:</span>
                            <span className="text-green-600 text-xs">✓ Available</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        {session?.status === 'uploaded' && (
                          <Link href={`/feedback/${session.id}`}>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        )}
                        <Link href="/interview">
                          <Button variant="outline" size="sm" className="flex-1">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Retake
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/interview">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <PlayCircle className="h-6 w-6 text-blue-600 mb-2" />
                    <div className="font-medium">Start New Interview</div>
                    <div className="text-sm text-gray-500">Practice with new questions</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                    <div className="font-medium">View Progress</div>
                    <div className="text-sm text-gray-500">Track your improvement</div>
                  </div>
                </Button>
              </Link>

              <Button variant="outline" className="w-full justify-start h-auto p-4" disabled>
                <div className="text-left">
                  <Brain className="h-6 w-6 text-purple-600 mb-2" />
                  <div className="font-medium">AI Analysis</div>
                  <div className="text-sm text-gray-500">Coming soon</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
