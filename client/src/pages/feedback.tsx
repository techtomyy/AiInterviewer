import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FeedbackChart from "@/components/FeedbackChart";
import { 
  ArrowLeft, 
  Download, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Eye,
  Volume2,
  FileText,
  TrendingUp
} from "lucide-react";

export default function Feedback() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const [session, setSession] = useState<any>({});
  const [feedback, setFeedback] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Session Not Found</h2>
            <p className="text-gray-600 mb-4">The interview session you're looking for doesn't exist.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status !== 'completed' || !feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">Processing Your Interview</h2>
            <p className="text-gray-600 mb-4">
              Your interview is being analyzed by our AI. This usually takes 2-3 minutes.
            </p>
            <Badge variant="secondary">Processing...</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const transcriptSegments = [
    {
      timestamp: "0:05",
      text: "Well, um, I worked on a project where we had to migrate our entire database system within a tight deadline.",
      issues: ["filler"],
      severity: "warning"
    },
    {
      timestamp: "0:15", 
      text: "The main challenge was coordinating with multiple teams while ensuring zero downtime for our customers.",
      issues: [],
      severity: "success"
    },
    {
      timestamp: "0:28",
      text: "I created a detailed project plan, set up daily standups, and established clear communication channels between all stakeholders.",
      issues: [],
      severity: "excellent"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-neutral">Interview Feedback</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" data-testid="button-download-report">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Link href="/interview">
                <Button className="bg-primary hover:bg-blue-800" data-testid="button-new-interview">
                  Start New Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video & Transcript Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-neutral" data-testid="text-session-title">
                      {session.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      {new Date(session.createdAt).toLocaleDateString()} • {session.duration || 0} minutes
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">Completed</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Video Player */}
            <Card data-testid="card-video-player">
              <CardContent className="p-6">
                <div className="relative bg-gray-900 aspect-video rounded-xl overflow-hidden mb-4">
                  {session.videoUrl ? (
                    <video 
                      controls 
                      className="w-full h-full object-cover"
                      data-testid="feedback-video"
                    >
                      <source src={session.videoUrl} type="video/webm" />
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Video not available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Annotations Overlay */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                      <span className="text-green-800">Confident tone</span>
                    </div>
                    <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-yellow-600 inline mr-1" />
                      <span className="text-yellow-800">Filler word detected</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Click timestamps in transcript to jump to sections</span>
                  <Button variant="ghost" size="sm" data-testid="button-download-transcript">
                    <Download className="h-4 w-4 mr-1" />
                    Download Transcript
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Transcript */}
            <Card data-testid="card-transcript">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Interactive Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transcriptSegments.map((segment, index) => (
                    <div 
                      key={index}
                      className="flex space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                      data-testid={`transcript-segment-${index}`}
                    >
                      <div className="text-xs text-gray-500 font-mono w-12 flex-shrink-0 mt-1">
                        {segment.timestamp}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">
                          {segment.text.split(' ').map((word, wordIndex) => {
                            if (word.toLowerCase().includes('um') || word.toLowerCase().includes('uh')) {
                              return (
                                <span 
                                  key={wordIndex}
                                  className="bg-yellow-100 text-yellow-800 px-1 rounded"
                                  title="Filler word detected"
                                >
                                  {word}{' '}
                                </span>
                              );
                            }
                            return word + ' ';
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {segment.severity === 'excellent' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {segment.severity === 'success' && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {segment.severity === 'warning' && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scores & Recommendations */}
          <div className="space-y-6">
            {/* Feedback Chart */}
            <Card data-testid="card-feedback-scores">
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackChart scores={feedback} />
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card data-testid="card-recommendations">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.recommendations?.map((rec: any, index: number) => (
                    <div 
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        rec.type === 'success' ? 'bg-green-50 border-green-200' :
                        rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                      data-testid={`recommendation-${index}`}
                    >
                      {rec.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                      {rec.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                      {rec.type === 'improvement' && <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />}
                      <div>
                        <p className={`text-sm font-medium ${
                          rec.type === 'success' ? 'text-green-800' :
                          rec.type === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {rec.title}
                        </p>
                        <p className={`text-xs ${
                          rec.type === 'success' ? 'text-green-700' :
                          rec.type === 'warning' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      <p>No specific recommendations available.</p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <Button 
                  className="w-full bg-primary hover:bg-blue-800"
                  data-testid="button-practice-exercises"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Practice Exercises
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card data-testid="card-next-steps">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/interview">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-practice-more">
                    <Play className="h-4 w-4 mr-2" />
                    Practice Another Interview
                  </Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-view-progress">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress Tracking
                  </Button>
                </Link>

                {user?.planType === 'free' && (
                  <Link href="/subscribe">
                    <Button variant="outline" className="w-full justify-start border-primary text-primary hover:bg-primary hover:text-white" data-testid="button-upgrade">
                      <Eye className="h-4 w-4 mr-2" />
                      Upgrade for Advanced Analysis
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
