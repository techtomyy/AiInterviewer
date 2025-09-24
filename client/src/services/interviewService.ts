// Interview Service for AI Interview Assistant
export interface InterviewInput {
  jobRole: string;
  jobDescription: string;
  resume?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'situational';
}

export interface SpeechMetrics {
  speech_clarity_score: number;
  speaking_rate_wpm: number;
  filler_words_count: number;
  filler_word_timestamps: Array<{word: string, start: number, end: number}>;
  segment_transcripts: Array<{start: number, end: number, text: string, confidence: number}>;
}

export interface BodyLanguage {
  eye_contact_pct: number;
  posture_score: number;
  notes: string;
}

export interface InterviewFeedback {
  transcription: string;
  overall_confidence: number;
  speech_metrics: SpeechMetrics;
  body_language: BodyLanguage;
  recommendations: string[];
}

class InterviewService {
  private apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  /**
   * Generate 5 interview questions based on job input
   */
  async generateQuestions(input: InterviewInput): Promise<InterviewQuestion[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/interview/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to mock questions if API fails
      return this.generateMockQuestions(input);
    }
  }

  /**
   * Analyze interview response
   */
  async analyzeResponse(
    audioBlob: Blob,
    videoBlob: Blob,
    questionId: string
  ): Promise<InterviewFeedback> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      formData.append('video', videoBlob, 'video.webm');
      formData.append('questionId', questionId);

      const response = await fetch(`${this.apiBaseUrl}/api/interview/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze response');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing response:', error);
      // Return mock analysis if API fails
      return this.generateMockAnalysis();
    }
  }

  /**
   * Generate mock questions for development/testing
   */
  private generateMockQuestions(input: InterviewInput): InterviewQuestion[] {
    const keywords = this.extractKeywords(input);
    const baseQuestions = [
      `Tell me about your experience with ${keywords[0] || 'your field'}.`,
      `How would you approach a challenging problem in ${input.jobRole}?`,
      `Describe a time when you had to learn a new ${keywords[1] || 'technology'} quickly.`,
      `What motivates you to work in ${input.jobRole}?`,
      `How do you stay updated with the latest developments in ${keywords[0] || 'your industry'}?`,
    ];

    return baseQuestions.map((question, index) => ({
      id: `q${index + 1}`,
      question,
      type: index % 3 === 0 ? 'behavioral' : index % 3 === 1 ? 'technical' : 'situational' as any,
    }));
  }

  /**
   * Extract keywords from job input
   */
  private extractKeywords(input: InterviewInput): string[] {
    const text = `${input.jobRole} ${input.jobDescription} ${input.resume || ''}`;
    const commonTechTerms = [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'TypeScript',
      'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'REST API',
      'GraphQL', 'Machine Learning', 'AI', 'DevOps', 'Agile', 'Scrum'
    ];

    return commonTechTerms.filter(term =>
      text.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 3);
  }

  /**
   * Generate mock analysis for development
   */
  private generateMockAnalysis(): InterviewFeedback {
    return {
      transcription: "This is a sample transcription of the candidate's response to the interview question. The candidate provided a detailed answer covering their experience and approach to problem-solving.",
      overall_confidence: Math.floor(Math.random() * 20) + 75, // 75-95
      speech_metrics: {
        speech_clarity_score: Math.floor(Math.random() * 20) + 75, // 75-95
        speaking_rate_wpm: Math.floor(Math.random() * 40) + 110, // 110-150
        filler_words_count: Math.floor(Math.random() * 5) + 2, // 2-7
        filler_word_timestamps: [
          { word: "um", start: 2.3, end: 2.5 },
          { word: "like", start: 5.1, end: 5.3 }
        ],
        segment_transcripts: [
          { start: 0.0, end: 10.0, text: "Well, in my previous role...", confidence: 0.92 },
          { start: 10.0, end: 25.0, text: "I approached this by first analyzing...", confidence: 0.88 }
        ]
      },
      body_language: {
        eye_contact_pct: Math.floor(Math.random() * 30) + 65, // 65-95
        posture_score: Math.floor(Math.random() * 25) + 70, // 70-95
        notes: "Good eye contact maintained throughout. Posture could be improved by sitting up straighter."
      },
      recommendations: [
        "Reduce filler words like 'um' and 'like'",
        "Maintain consistent eye contact",
        "Consider slowing down speaking pace slightly",
        "Provide more specific examples from your experience"
      ]
    };
  }
}

export const interviewService = new InterviewService();
