import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, Clock, Target } from "lucide-react";
import { InterviewQuestion } from "@/services/interviewService";

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  onStartInterview: () => void;
  loading?: boolean;
}

export default function InterviewQuestions({
  questions,
  currentQuestionIndex,
  onQuestionSelect,
  onStartInterview,
  loading = false,
}: InterviewQuestionsProps) {
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-blue-100 text-blue-800";
      case "behavioral":
        return "bg-green-100 text-green-800";
      case "situational":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Target className="h-3 w-3" />;
      case "behavioral":
        return <MessageSquare className="h-3 w-3" />;
      case "situational":
        return <Brain className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI-Generated Interview Questions</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Based on your job description and resume, here are 5 personalized
            questions
          </p>
        </CardHeader>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <Card
            key={question.id}
            className={`cursor-pointer transition-all duration-200 ${
              index === currentQuestionIndex
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => onQuestionSelect(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`${getQuestionTypeColor(
                        question.type
                      )} border-0`}
                    >
                      {getQuestionTypeIcon(question.type)}
                      <span className="ml-1 capitalize">{question.type}</span>
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Question {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {question.question}
                  </p>
                </div>
                {index === currentQuestionIndex && (
                  <div className="ml-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Question Navigation */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onQuestionSelect(Math.max(0, currentQuestionIndex - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onQuestionSelect(
                    Math.min(questions.length - 1, currentQuestionIndex + 1)
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question Display */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Current Question
              </span>
            </div>
            <p className="text-lg font-medium text-blue-900 mb-4">
              {questions[currentQuestionIndex]?.question}
            </p>
            <Button
              onClick={onStartInterview}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Starting..." : "Start Interview"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-1">
                Interview Tips
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Take a moment to think before answering</li>
                <li>• Use specific examples from your experience</li>
                <li>• Maintain good eye contact and posture</li>
                <li>• Speak clearly and at a moderate pace</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
