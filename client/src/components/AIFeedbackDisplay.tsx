import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Mic,
  Video,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
} from "lucide-react";
import { InterviewFeedback } from "@/services/interviewService";
import { useToast } from "@/hooks/use-toast";

interface AIFeedbackDisplayProps {
  feedback: InterviewFeedback;
  questionNumber: number;
  onNextQuestion?: () => void;
  onFinishInterview?: () => void;
  isLastQuestion?: boolean;
}

export default function AIFeedbackDisplay({
  feedback,
  questionNumber,
  onNextQuestion,
  onFinishInterview,
  isLastQuestion = false,
}: AIFeedbackDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Feedback data copied successfully",
    });
  };

  const downloadFeedback = () => {
    const dataStr = JSON.stringify(feedback, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `interview-feedback-q${questionNumber}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Downloaded",
      description: "Feedback saved to your device",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>AI Interview Analysis</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(JSON.stringify(feedback, null, 2))
                }
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFeedback}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Question {questionNumber} Analysis
          </p>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full ${getConfidenceColor(
                feedback.overall_confidence
              )}`}
            >
              <span className="text-lg font-semibold">
                Overall Score: {feedback.overall_confidence}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {getConfidenceLabel(feedback.overall_confidence)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="speech">Speech</TabsTrigger>
          <TabsTrigger value="body">Body Language</TabsTrigger>
          <TabsTrigger value="recommendations">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {feedback.transcription}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speech" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Speech Clarity</span>
                  <Badge
                    className={getConfidenceColor(
                      feedback.speech_metrics.speech_clarity_score
                    )}
                  >
                    {feedback.speech_metrics.speech_clarity_score}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  How clearly you articulated your thoughts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Speaking Rate</span>
                  <span className="text-lg font-semibold">
                    {feedback.speech_metrics.speaking_rate_wpm} WPM
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Words per minute (ideal: 110-150)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Filler Words</span>
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800"
                  >
                    {feedback.speech_metrics.filler_words_count}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Number of filler words used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Confidence</span>
                  <span className="text-sm text-gray-600">
                    Avg:{" "}
                    {Math.round(
                      (feedback.speech_metrics.segment_transcripts.reduce(
                        (acc, seg) => acc + seg.confidence,
                        0
                      ) /
                        feedback.speech_metrics.segment_transcripts.length) *
                        100
                    )}
                    %
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Average transcription confidence
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="body" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    Eye Contact
                  </span>
                  <Badge
                    className={getConfidenceColor(
                      feedback.body_language.eye_contact_pct
                    )}
                  >
                    {feedback.body_language.eye_contact_pct}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Percentage of time maintaining eye contact
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Posture Score</span>
                  <Badge
                    className={getConfidenceColor(
                      feedback.body_language.posture_score
                    )}
                  >
                    {feedback.body_language.posture_score}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Overall posture assessment
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Body Language Notes</h4>
              <p className="text-gray-700">{feedback.body_language.notes}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Questions
        </Button>
        <div className="space-x-2">
          {!isLastQuestion ? (
            <Button
              onClick={onNextQuestion}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next Question
              <AlertCircle className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={onFinishInterview}
              className="bg-green-600 hover:bg-green-700"
            >
              Finish Interview
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
