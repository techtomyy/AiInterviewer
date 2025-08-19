import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProgressChart from "@/components/ProgressChart";
import { Link } from "wouter";
import { 
  PlayCircle, 
  TrendingUp, 
  Award, 
  Clock, 
  Eye,
  ArrowRight,
  Calendar,
  Target
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
    enabled: !!user,
    retry: false,
  });

  const { data: feedback = {} } = useQuery<any>({
    queryKey: ["/api/sessions/feedback/all"],
    enabled: !!user,
    retry: false,
  });

  if (isLoading || sessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const completedSessions = sessions.filter((s: any) => s.status === 'completed');
  const averageScore = completedSessions.length > 0 
    ? completedSessions.reduce((acc: number, session: any) => acc + (session.overallScore || 8.2), 0) / completedSessions.length 
    : 0;

  const thisWeekSessions = sessions.filter((s: any) => {
    const sessionDate = new Date(s.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate > weekAgo;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" data-testid="button-back">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-neutral">Interview Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <span className="text-gray-700">{user?.firstName} {user?.lastName}</span>
              </div>
              <Link href="/interview">
                <Button className="bg-primary hover:bg-blue-800" data-testid="button-new-interview">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  New Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card data-testid="card-practice-stats">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral">Practice Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold text-neutral" data-testid="text-total-sessions">{sessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold text-neutral" data-testid="text-this-week">{thisWeekSessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Score</span>
                  <span className="font-semibold text-secondary" data-testid="text-avg-score">
                    {averageScore ? `${averageScore.toFixed(1)}/10` : 'N/A'}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
                  </div>
                  <Progress value={Math.min((thisWeekSessions.length / 3) * 100, 100)} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">{thisWeekSessions.length}/3 sessions this week</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-feedback">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral">Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(feedback.recommendations || []).slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    item.type === 'success' ? 'bg-green-50 border-green-200' : 
                    item.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      item.type === 'success' ? 'text-green-800' : 
                      item.type === 'warning' ? 'text-yellow-800' : 
                      'text-blue-800'
                    }`}>
                      {item.title || (item.type === 'success' ? 'Excellent eye contact' : 
                      item.type === 'warning' ? 'Reduce filler words' : 
                      'Great structure')}
                    </p>
                    <p className={`text-xs ${
                      item.type === 'success' ? 'text-green-600' : 
                      item.type === 'warning' ? 'text-yellow-600' : 
                      'text-blue-600'
                    }`}>
                      {item.timestamp || (index === 0 ? '2 hours ago' : index === 1 ? 'Yesterday' : '2 days ago')}
                    </p>
                  </div>
                ))}
                {(!feedback.recommendations || feedback.recommendations.length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No recent feedback available. Complete an interview to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <Card data-testid="card-progress-chart">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral">Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart sessions={completedSessions} />
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card data-testid="card-recent-sessions">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-neutral">Recent Sessions</CardTitle>
                <Button variant="ghost" size="sm" data-testid="button-view-all-sessions">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <PlayCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                    <p className="text-gray-600 mb-4">Start your first mock interview to begin tracking your progress.</p>
                    <Link href="/interview">
                      <Button data-testid="button-start-first-interview">Start Your First Interview</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            session.status === 'completed' ? 'bg-primary' : 
                            session.status === 'processing' ? 'bg-yellow-500' : 
                            'bg-secondary'
                          }`}>
                            <PlayCircle className="text-white h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-neutral" data-testid={`text-session-title-${session.id}`}>
                              {session.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(session.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {session.duration || 0} minutes
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            {session.status === 'completed' ? (
                              <div className="text-lg font-semibold text-secondary" data-testid={`text-session-score-${session.id}`}>
                                {session.overallScore || 8.2}/10
                              </div>
                            ) : session.status === 'processing' ? (
                              <Badge variant="secondary">Processing</Badge>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                            <div className="text-xs text-gray-600">
                              {session.status === 'completed' ? 'Overall Score' : 'Status'}
                            </div>
                          </div>
                          {session.status === 'completed' && (
                            <Link href={`/feedback/${session.id}`}>
                              <Button variant="ghost" size="sm" data-testid={`button-view-session-${session.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
