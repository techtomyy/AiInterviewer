/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/hooks/useApiMutations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Interview Session Hooks
export function useCreateInterviewSession() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionData: {
      candidateId: string;
      position?: string;
      questions?: string[];
    }) => apiService.createInterviewSession(sessionData),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Interview session created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create interview session",
        variant: "destructive",
      });
    },
  });
}

export function useSessionStatus(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: ['session-status', sessionId],
    queryFn: () => apiService.getSessionStatus(sessionId),
    enabled: enabled && !!sessionId,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: false,
  });
}

export function useUploadVideo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, videoFile }: {
      sessionId: string;
      videoFile: File;
    }) => apiService.uploadInterviewVideo(sessionId, videoFile),
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
      // Invalidate and refetch session status
      queryClient.invalidateQueries({ 
        queryKey: ['session-status', variables.sessionId] 
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    },
  });
}

// Authentication Hooks (if you want to use your backend auth instead of Supabase)
export function useBackendLogin() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiService.login(email, password),
    onSuccess: (data) => {
      // Store token if your backend returns one
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });
}

export function useBackendSignup() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ email, password, name }: { 
      email: string; 
      password: string; 
      name?: string;
    }) => apiService.signup(email, password, name),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully! Please log in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });
}