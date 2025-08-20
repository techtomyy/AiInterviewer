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
import { PlayCircle, Calendar, Clock, Eye, Target } from "lucide-react";

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

  // 📊 Fetch sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
    enabled: !!user,
    retry: false,
  });

  const sessions = sessionsData ?? []; // ✅ always an array

  const { data: feedbackData } = useQuery<any>({
    queryKey: ["/api/sessions/feedback/all"],
    enabled: !!user,
    retry: false,
  });

  const feedback = feedbackData ?? {};

  if (isLoading || sessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // 🔢 Stats
  const completedSessions = sessions.filter(
    (s: any) => s?.status === "completed"
  );

  const averageScore =
    completedSessions.length > 0
      ? completedSessions.reduce(
          (acc: number, session: any) => acc + (session?.overallScore || 8.2),
          0
        ) / completedSessions.length
      : 0;

  const thisWeekSessions = sessions.filter((s: any) => {
    if (!s?.createdAt) return false;
    const sessionDate = new Date(s.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate > weekAgo;
  });

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

        {/* ✅ Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions yet.</p>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session: any) => (
                  <div
                    key={session?.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {session?.createdAt
                          ? new Date(session.createdAt).toLocaleString()
                          : "Unknown date"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status:{" "}
                        <Badge
                          variant={
                            session?.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {session?.status ?? "unknown"}
                        </Badge>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {session?.overallScore && (
                        <span className="text-sm font-medium">
                          Score: {session.overallScore}
                        </span>
                      )}
                      <Link href={`/sessions/${session?.id ?? ""}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
