// client/src/pages/interview.tsx - Redesigned with AI integration space
import React, { useEffect, useRef, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import VideoRecorder from "@/components/VideoRecorder";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Video, Mic, Clock, Target } from "lucide-react";
import { Link } from "wouter";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = `${API_ORIGIN}/api`;

function Interview() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Sample questions (replace with AI-generated questions later)
  const questions = [
    "Tell me about yourself and your background.",
    "Why are you interested in this position?",
    "What are your greatest strengths and weaknesses?",
    "Describe a challenging situation you faced at work and how you handled it.",
    "Where do you see yourself in 5 years?"
  ];

  const onStartRecording = () => {
    setIsRecording(true);
    setTimer(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const onStopRecording = async (blob: Blob) => {
    setIsRecording(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      setLoading(true);
      setError(null);
      toast({ title: "Uploading", description: "Sending your recording to Supabase…" });
      const base64 = await blobToBase64(blob);
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, userId: user?.id || "test-id", email: user?.email || "" })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      const data = await response.json();
      setSessionData(data);
      toast({ title: "Upload complete", description: "Your video was saved successfully." });
      
      // Redirect to feedback page after successful upload
      setTimeout(() => {
        window.location.href = `/feedback/${data.session.id}`;
      }, 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Interview Session</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/camera-test">
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Test Camera
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Interview Questions & AI Integration */}
          <div className="space-y-6">
            {/* Interview Info Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Interview Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {formatTime(timer)}
                  </Badge>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-lg font-medium text-gray-900">
                    {questions[currentQuestion]}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Integration Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI Interview Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm text-gray-700">
                    <strong>Coming Soon:</strong> AI will analyze your responses in real-time, 
                    provide instant feedback on communication skills, body language, and answer quality.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-3 w-3 text-green-500" />
                    <span>Speech Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="h-3 w-3 text-blue-500" />
                    <span>Body Language</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span>Response Timing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-red-500" />
                    <span>Answer Quality</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recording Controls */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-red-600" />
                  <span>Recording Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <Button
                      onClick={onStartRecording}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full"
                      size="lg"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onStopRecording(new Blob())}
                      disabled={loading}
                      className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-full"
                      size="lg"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
                {loading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Processing...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Video Recorder */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  <span>Video Recording</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoRecorder
                  isRecording={isRecording}
                  onStartRecording={onStartRecording}
                  onStopRecording={onStopRecording}
                  timer={timer}
                />
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-800">Error</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;
