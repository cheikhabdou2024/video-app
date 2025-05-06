// src/types/auth.types.ts
export interface User {
    id: number;
    username: string;
    email: string;
    token?: string;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    id: number;
    username: string;
    email: string;
    token: string;
  }
  
  