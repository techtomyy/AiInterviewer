// client/src/types.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  planType?: 'free' | 'pro' | 'enterprise';
  role?: 'candidate' | 'recruiter' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  recruiterId?: string;
  position?: string;
  questions: string[];
  videoUrl?: string;
  status: 'pending' | 'recording' | 'completed' | 'analyzing';
  feedback?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface VideoUploadResponse {
  videoUrl: string;
  sessionId: string;
  uploadedAt: string;
}