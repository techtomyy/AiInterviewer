import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import VideoRecorder from "@/components/VideoRecorder";
import { Link, useParams } from "wouter";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Clock,
  Tag,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Eye,
  Volume2
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  timeLimit: number;
}

export default function Interview() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<'ready' | 'recording' | 'processing' | 'completed'>('ready');
  const timerRef = useRef<NodeJS.Timeout>();

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

  // Fetch random questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery<any[]>({
    queryKey: ["/api/questions/random", { limit: 5 }],
    enabled: !!user && !id,
    retry: false,
  });

  // Fetch existing session if ID provided
  const { data: existingSession } = useQuery({
    queryKey: ["/api/sessions", id],
    enabled: !!id && !!user,
    retry: false,
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/sessions", sessionData);
      return response.json();
    },
    onSuccess: (session) => {
      setSessionData(session);
      toast({
        title: "Session Created",
        description: "Your interview session is ready to begin!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create interview session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload video mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async ({ sessionId, videoBlob }: { sessionId: string; videoBlob: Blob }) => {
      const formData = new FormData();
      formData.append('video', videoBlob, 'interview.webm');
      
      const response = await fetch(`/api/sessions/${sessionId}/video`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSessionStatus('processing');
      toast({
        title: "Video Uploaded",
        description: "Your interview is being analyzed. You'll receive feedback shortly!",
      });
      // Redirect to feedback page after a delay
      setTimeout(() => {
        window.location.href = `/feedback/${sessionData?.id}`;
      }, 2000);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setSessionStatus('ready');
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize session when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !sessionData && !createSessionMutation.isPending) {
      createSessionMutation.mutate({
        title: `Mock Interview - ${new Date().toLocaleDateString()}`,
        status: 'recording',
      });
    }
  }, [questions]);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimer(0);
    setSessionStatus('recording');
  };

  const handleStopRecording = (blob: Blob) => {
    setIsRecording(false);
    setRecordedBlob(blob);
    setSessionStatus('ready');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimer(0);
      setRecordedBlob(null);
    } else {
      handleCompleteInterview();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTimer(0);
      setRecordedBlob(null);
    }
  };

  const handleCompleteInterview = () => {
    if (recordedBlob && sessionData) {
      uploadVideoMutation.mutate({
        sessionId: sessionData.id,
        videoBlob: recordedBlob,
      });
    }
  };

  if (authLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Questions Available</h2>
            <p className="text-gray-600 mb-4">Unable to load interview questions. Please try again.</p>
            <Link href="/">
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-neutral">Mock Interview</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" data-testid="badge-session-status">
                {sessionStatus === 'recording' ? 'Recording' : 
                 sessionStatus === 'processing' ? 'Processing' : 
                 sessionStatus === 'completed' ? 'Completed' : 'Ready'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Question Progress</span>
            <span className="text-sm font-medium text-gray-600" data-testid="text-progress">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-6" data-testid="progress-questions" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Recording Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <VideoRecorder
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  timer={timer}
                />
              </CardContent>
            </Card>

            {/* Question Display */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm" data-testid="text-question-number">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg text-neutral font-medium mb-2" data-testid="text-current-question">
                      {currentQuestion?.text}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Recommended: {Math.floor((currentQuestion?.timeLimit || 180) / 60)} minutes
                      </span>
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {currentQuestion?.type}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {currentQuestion?.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Tips Panel */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card data-testid="card-session-info">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    sessionStatus === 'recording' ? 'text-red-600' : 
                    sessionStatus === 'processing' ? 'text-yellow-600' : 
                    'text-gray-800'
                  }`} data-testid="text-session-status">
                    {sessionStatus === 'recording' ? 'Recording' : 
                     sessionStatus === 'processing' ? 'Processing' : 
                     'Ready'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Limit</span>
                  <span className="text-gray-800" data-testid="text-time-limit">
                    {Math.floor((currentQuestion?.timeLimit || 180) / 60)}:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Time</span>
                  <span className="text-gray-800 font-mono" data-testid="text-current-time">
                    {formatTime(timer)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Live Tips */}
            <Card className="bg-green-50 border-green-200" data-testid="card-live-tips">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                  Live Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Maintain good eye contact with camera</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use the STAR method for structure</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Speak clearly and at a steady pace</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Eye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Keep good posture and gestures</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Volume2 className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Project your voice confidently</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1"
                data-testid="button-previous-question"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={handleNextQuestion}
                disabled={!recordedBlob}
                className="flex-1 bg-primary hover:bg-blue-800"
                data-testid="button-next-question"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {uploadVideoMutation.isPending && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-yellow-800">Processing your interview...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
