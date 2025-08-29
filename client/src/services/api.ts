/*
 * Copyright (c) - All Rights Reserved.
 * 
 * See the LICENSE file for more information.
 */

// src/services/api.ts
const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5000') + '/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('supabase_token') || sessionStorage.getItem('supabase_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication endpoints
  async signup(email: string, password: string, name?: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    return this.handleResponse(response);
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Interview session endpoints
  async createInterviewSession(sessionData: {
    candidateId: string;
    position?: string;
    questions?: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/candidate/session`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sessionData),
    });
    return this.handleResponse(response);
  }

  async getSessionStatus(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/candidate/session/${sessionId}/status`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Video upload endpoint
  async uploadInterviewVideo(sessionId: string, videoFile: File) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('sessionId', sessionId);

    const token = localStorage.getItem('supabase_token') || sessionStorage.getItem('supabase_token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();