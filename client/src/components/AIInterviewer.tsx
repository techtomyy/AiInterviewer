import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  MessageCircle,
  Video,
  Mic,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface InterviewAnswer {
  question: string;
  transcription: string;
  overall_confidence: number;
  speech_metrics: {
    speech_clarity_score: number;
    speaking_rate_wpm: number;
    filler_words_count: number;
    filler_word_timestamps: Array<{ word: string; start: number; end: number }>;
    segment_transcripts: Array<{
      start: number;
      end: number;
      text: string;
      confidence: number;
    }>;
  };
  body_language: {
    eye_contact_pct: number;
    posture_score: number;
    notes: string;
  };
  recommendations: string[];
}

interface InterviewSession {
  topic: string;
  questions: string[];
  currentQuestionIndex: number;
  answers: InterviewAnswer[];
  isComplete: boolean;
}

const AI_INTERVIEWER_PROMPT = `
You are an AI Interviewer system. Your tasks are:

1. **Topic Setup**
   - First, ask the candidate: "What topic would you like me to ask interview questions about?"
   - Wait for the candidate's answer.
   - Based on their answer, generate **5 professional interview questions** about the given topic.

2. **Interview Questions**
   - Ask the 5 questions one by one.
   - After each question, wait for the candidate's video/audio answer.

3. **Video & Audio Analysis**
   - For each recorded answer:
     - Use body language data (eye contact %, posture score, gestures, facial movement notes).
     - Use speech-to-text transcription.
   - Analyze:
     - **Overall confidence** (0-100).
     - **Speech clarity score** (0-100).
     - **Speaking rate (words per minute)**.
     - **Filler words count** and timestamps.
     - **Segment-by-segment transcript analysis** (start, end, text, confidence).
     - **Body language notes** (eye contact, gestures, posture).

4. **Final Feedback**
   - Return results in **strict JSON format** like this:
   {
     "transcription": "full transcription text",
     "overall_confidence": 85,
     "speech_metrics": {
       "speech_clarity_score": 82,
       "speaking_rate_wpm": 120,
       "filler_words_count": 6,
       "filler_word_timestamps": [{"word":"um","start":1.2,"end":1.35}],
       "segment_transcripts": [{"start":0.0,"end":15.0,"text":"Answer text...","confidence":0.9}]
     },
     "body_language": {
       "eye_contact_pct": 72.5,
       "posture_score": 78,
       "notes": "Good eye contact, but posture could be more upright."
     },
     "recommendations": [
       "Maintain consistent eye contact with the camera",
       "Reduce filler words like 'um' and 'like'",
       "Speak more slowly and clearly",
       "Improve posture by sitting straight"
     ]
   }

Important:
- Always return valid JSON only.
- Be concise, professional, and structured.
- Do not include extra text outside of JSON.
`;

export default function AIInterviewer() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "topic" | "questions" | "recording" | "analyzing" | "feedback"
  >("topic");
  const [topic, setTopic] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<InterviewAnswer | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQuestions = async (topic: string): Promise<string[]> => {
    // Simulate AI question generation based on topic
    const questionTemplates: { [key: string]: string[] } = {
      react: [
        "Can you explain the difference between functional and class components in React?",
        "How does the virtual DOM work in React and why is it beneficial?",
        "What are React hooks and how have they changed React development?",
        "Explain the concept of state and props in React applications.",
        "How would you handle error boundaries in a React application?",
      ],
      javascript: [
        "What are the differences between var, let, and const in JavaScript?",
        "Explain closures and provide a practical example of their use.",
        "What is the event loop in JavaScript and how does it work?",
        "How does prototypal inheritance work in JavaScript?",
        "What are promises and async/await, and when would you use each?",
      ],
      python: [
        "What are the key differences between Python 2 and Python 3?",
        "Explain list comprehensions and provide an example.",
        "What is the Global Interpreter Lock (GIL) and how does it affect Python programs?",
        "How does Python's garbage collection work?",
        "What are decorators in Python and how are they used?",
      ],
      default: [
        "Can you walk me through your experience with this technology?",
        "What challenges have you faced while working with this technology?",
        "How do you stay updated with the latest developments in this field?",
        "Can you describe a project where you used this technology effectively?",
        "What best practices do you follow when working with this technology?",
      ],
    };

    // Return relevant questions or default questions
    const topicLower = topic.toLowerCase();
    for (const [key, questions] of Object.entries(questionTemplates)) {
      if (topicLower.includes(key)) {
        return questions;
      }
    }
    return questionTemplates.default;
  };

  const analyzeAnswer = async (
    audioBlob: Blob,
    videoBlob: Blob
  ): Promise<InterviewAnswer> => {
    setLoading(true);

    try {
      // Simulate AI analysis - in a real implementation, this would call actual AI services
      const mockAnalysis: InterviewAnswer = {
        question: session?.questions[session.currentQuestionIndex] || "",
        transcription:
          "This is a simulated transcription of the candidate's answer. In a real implementation, this would be generated by a speech-to-text service analyzing the recorded audio.",
        overall_confidence: Math.floor(Math.random() * 40) + 60, // 60-100
        speech_metrics: {
          speech_clarity_score: Math.floor(Math.random() * 30) + 70, // 70-100
          speaking_rate_wpm: Math.floor(Math.random() * 60) + 90, // 90-150
          filler_words_count: Math.floor(Math.random() * 8) + 2, // 2-10
          filler_word_timestamps: [
            { word: "um", start: 1.2, end: 1.35 },
            { word: "like", start: 3.8, end: 3.95 },
          ],
          segment_transcripts: [
            {
              start: 0.0,
              end: 15.0,
              text: "Well, I think this is a great question...",
              confidence: 0.9,
            },
            {
              start: 15.0,
              end: 30.0,
              text: "Based on my experience, I would say that...",
              confidence: 0.85,
            },
          ],
        },
        body_language: {
          eye_contact_pct: Math.floor(Math.random() * 30) + 65, // 65-95
          posture_score: Math.floor(Math.random() * 25) + 70, // 70-95
          notes:
            "Good eye contact maintained throughout the response. Posture could be improved by sitting more upright.",
        },
        recommendations: [
          "Maintain consistent eye contact with the camera",
          "Reduce filler words like 'um' and 'like'",
          "Speak more slowly and clearly",
          "Improve posture by sitting straight",
        ],
      };

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return mockAnalysis;
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSubmit = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for the interview questions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const questions = await generateQuestions(topic);
      setSession({
        topic,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        isComplete: false,
      });
      setCurrentStep("questions");
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    setCurrentStep("recording");
    setIsRecording(true);
  };

  const handleStopRecording = async (audioBlob: Blob, videoBlob: Blob) => {
    setIsRecording(false);
    setCurrentStep("analyzing");

    try {
      const analysis = await analyzeAnswer(audioBlob, videoBlob);
      setCurrentAnswer(analysis);

      // Update session with the answer
      if (session) {
        const updatedAnswers = [...session.answers, analysis];
        const nextIndex = session.currentQuestionIndex + 1;

        if (nextIndex >= session.questions.length) {
          // Interview complete
          setSession({
            ...session,
            answers: updatedAnswers,
            isComplete: true,
          });
          setCurrentStep("feedback");
        } else {
          // Move to next question
          setSession({
            ...session,
            answers: updatedAnswers,
            currentQuestionIndex: nextIndex,
          });
          setCurrentStep("questions");
        }
      }
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze your response. Please try again.",
        variant: "destructive",
      });
      setCurrentStep("questions");
    }
  };

  const handleNextQuestion = () => {
    if (
      session &&
      session.currentQuestionIndex < session.questions.length - 1
    ) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1,
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (session && session.currentQuestionIndex > 0) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex - 1,
      });
    }
  };

  const resetInterview = () => {
    setSession(null);
    setCurrentStep("topic");
    setTopic("");
    setCurrentAnswer(null);
  };

  if (currentStep === "topic") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              AI Interview Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="topic">Interview Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., React, JavaScript, Python, System Design..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              onClick={handleTopicSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating Questions..." : "Start Interview"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "questions" && session) {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const progress =
      ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Question {session.currentQuestionIndex + 1} of{" "}
              {session.questions.length}
            </CardTitle>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Topic: {session.topic}
              </h3>
              <p className="text-blue-800">{currentQuestion}</p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleStartRecording} className="flex-1">
                <Video className="h-4 w-4 mr-2" />
                Record Answer
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={session.currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={
                    session.currentQuestionIndex >= session.questions.length - 1
                  }
                >
                  Next
                </Button>
              </div>
            </div>

            {session.answers.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Previous Answers:</h4>
                <div className="space-y-2">
                  {session.answers.map((answer, index) => (
                    <Badge key={index} variant="secondary" className="mr-2">
                      Q{index + 1}: {answer.overall_confidence}% confidence
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "recording" && session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-6 w-6" />
              Recording Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-lg mb-4">Recording in progress...</p>
              <p className="text-sm text-gray-600 mb-6">
                Please answer the question: "
                {session.questions[session.currentQuestionIndex]}"
              </p>
              <Button
                onClick={() => handleStopRecording(new Blob(), new Blob())}
              >
                <Mic className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "analyzing") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Analyzing Your Response
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">
              AI is analyzing your speech, body language, and content...
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This may take a few moments
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "feedback" && session && session.answers.length > 0) {
    const allAnswers = session.answers;
    const averageConfidence = Math.round(
      allAnswers.reduce((sum, answer) => sum + answer.overall_confidence, 0) /
        allAnswers.length
    );

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Interview Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Average Confidence: {averageConfidence}%
              </h3>
              <p className="text-green-700">
                Great job completing the interview! Here's your detailed
                feedback:
              </p>
            </div>

            {allAnswers.map((answer, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}: {answer.overall_confidence}%
                    Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Speech Analysis:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        Clarity Score:{" "}
                        {answer.speech_metrics.speech_clarity_score}%
                      </div>
                      <div>
                        Speaking Rate: {answer.speech_metrics.speaking_rate_wpm}{" "}
                        WPM
                      </div>
                      <div>
                        Filler Words: {answer.speech_metrics.filler_words_count}
                      </div>
                      <div>
                        Eye Contact: {answer.body_language.eye_contact_pct}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {answer.recommendations.map((rec, recIndex) => (
                        <li key={recIndex}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4 pt-4">
              <Button onClick={resetInterview} className="flex-1">
                Start New Interview
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep("questions")}
              >
                Review Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
