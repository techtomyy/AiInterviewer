import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Loader2 } from "lucide-react";
import JobInputForm from "@/components/JobInputForm";
import InterviewQuestions from "@/components/InterviewQuestions";
import AIFeedbackDisplay from "@/components/AIFeedbackDisplay";
import {
  interviewService,
  InterviewInput,
  InterviewQuestion,
  InterviewFeedback,
} from "@/services/interviewService";
import { useToast } from "@/hooks/use-toast";

type InterviewStage = "input" | "questions" | "interview" | "feedback";

export default function AIInterview() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [stage, setStage] = useState<InterviewStage>("input");
  const [loading, setLoading] = useState(false);
  const [jobInput, setJobInput] = useState<InterviewInput | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [allFeedback, setAllFeedback] = useState<InterviewFeedback[]>([]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedJobInput = localStorage.getItem("ai-interview-job-input");
    const savedQuestions = localStorage.getItem("ai-interview-questions");
    const savedStage = localStorage.getItem("ai-interview-stage");

    if (savedJobInput) {
      setJobInput(JSON.parse(savedJobInput));
    }
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
    if (savedStage) {
      setStage(savedStage as InterviewStage);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (jobInput) {
      localStorage.setItem("ai-interview-job-input", JSON.stringify(jobInput));
    }
  }, [jobInput]);

  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem("ai-interview-questions", JSON.stringify(questions));
    }
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("ai-interview-stage", stage);
  }, [stage]);

  const handleJobInputSubmit = async (data: InterviewInput) => {
    setLoading(true);
    try {
      setJobInput(data);
      const generatedQuestions = await interviewService.generateQuestions(data);
      setQuestions(generatedQuestions);
      setStage("questions");
      toast({
        title: "Questions Generated",
        description: "AI has created personalized interview questions for you",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleStartInterview = () => {
    setStage("interview");
  };

  const handleFeedbackReceived = (newFeedback: InterviewFeedback) => {
    setFeedback(newFeedback);
    setAllFeedback((prev) => [...prev, newFeedback]);
    setStage("feedback");
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStage("questions");
      setFeedback(null);
    }
  };

  const handleFinishInterview = () => {
    // Save all feedback to localStorage
    localStorage.setItem("ai-interview-feedback", JSON.stringify(allFeedback));

    toast({
      title: "Interview Complete!",
      description:
        "All your feedback has been saved. Check your dashboard for results.",
    });

    // Navigate to dashboard
    navigate("/dashboard");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const renderStage = () => {
    switch (stage) {
      case "input":
        return (
          <div className="max-w-4xl mx-auto">
            <JobInputForm onSubmit={handleJobInputSubmit} loading={loading} />
          </div>
        );

      case "questions":
        return (
          <div className="max-w-4xl mx-auto">
            <InterviewQuestions
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
              onStartInterview={handleStartInterview}
              loading={loading}
            />
          </div>
        );

      case "interview":
        return (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Interview in Progress
                </h2>
                <p className="text-gray-600 mb-6">
                  You should be redirected to the video recording page now. If
                  not, please navigate manually.
                </p>
                <Button
                  onClick={() => navigate("/interview")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Video Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "feedback":
        return feedback ? (
          <div className="max-w-4xl mx-auto">
            <AIFeedbackDisplay
              feedback={feedback}
              questionNumber={currentQuestionIndex + 1}
              onNextQuestion={handleNextQuestion}
              onFinishInterview={handleFinishInterview}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
            />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                AI Interview Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Stage: {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStage()}
      </div>
    </div>
  );
}
