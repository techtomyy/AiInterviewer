import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Video, 
  TrendingUp, 
  Users, 
  Award,
  Calendar,
  PlayCircle,
  BarChart3
} from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { data: sessions = [] } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
    enabled: !!user,
  });

  const { data: stats = {} } = useQuery<any>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isRecruiter = user?.role === 'recruiter';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-neutral">
                {isRecruiter ? 'Recruiter Dashboard' : 'Interview Coach'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.firstName}!</span>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/auth"}//by default its /api/logout
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRecruiter ? (
          // Recruiter Dashboard
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-total-candidates">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Candidates</p>
                      <p className="text-2xl font-bold text-neutral">{stats?.totalCandidates || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-this-week">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-neutral">{stats?.thisWeek || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-score">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Score</p>
                      <p className="text-2xl font-bold text-neutral">{stats?.avgScore || '8.2'}/10</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-shortlisted">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Shortlisted</p>
                      <p className="text-2xl font-bold text-neutral">{stats?.shortlisted || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral">Quick Actions</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Candidate Evaluations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Review and compare candidate interview performance.</p>
                  <Link href="/recruiter">
                    <Button className="w-full" data-testid="button-view-candidates">
                      View Candidates
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-secondary" />
                    <span>Analytics Dashboard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">View hiring analytics and team insights.</p>
                  <Button variant="outline" className="w-full" data-testid="button-view-analytics">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Candidate Dashboard
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-total-sessions">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-neutral">{sessions.length}</p>
                    </div>
                    <Video className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-this-month">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-neutral">{stats?.thisMonth || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-score-candidate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Score</p>
                      <p className="text-2xl font-bold text-neutral">{stats?.avgScore || '8.2'}/10</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-improvement">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Improvement</p>
                      <p className="text-2xl font-bold text-secondary">+12%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral">Quick Actions</h2>
              <Link href="/subscribe">
                <Button variant="outline" data-testid="button-upgrade">
                  {user?.planType === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <span>Start Interview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Begin a new mock interview session with AI feedback.</p>
                  <Link href="/interview">
                    <Button className="w-full" data-testid="button-start-interview">
                      Start Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-secondary" />
                    <span>View Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Track your improvement and review past sessions.</p>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full" data-testid="button-view-progress">
                      View Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-accent" />
                    <span>Practice Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Browse our extensive question bank by industry.</p>
                  <Button variant="outline" className="w-full" data-testid="button-practice-questions">
                    Browse Questions
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            {sessions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral mb-6">Recent Sessions</h2>
                <div className="grid gap-4">
                  {sessions.slice(0, 3).map((session: any) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                              <PlayCircle className="text-white h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-neutral">{session.title}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(session.createdAt).toLocaleDateString()} • {session.duration || 0} minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-secondary">
                                {session.status === 'completed' ? '8.5/10' : 'Processing...'}
                              </div>
                              <div className="text-xs text-gray-600">Overall Score</div>
                            </div>
                            {session.status === 'completed' && (
                              <Link href={`/feedback/${session.id}`}>
                                <Button variant="ghost" size="sm" data-testid={`button-view-${session.id}`}>
                                  View Details
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
