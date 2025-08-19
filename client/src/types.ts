export interface User {
  id: string;
  email: string;
  name?: string;
  planType?: 'free' | 'pro' | 'enterprise';
  createdAt?: string;
  updatedAt?: string;
}
