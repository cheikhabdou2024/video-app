// src/context/AuthContext.tsx
import React, { createContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login, register, logout } from '../api/auth';
import { AuthState, User, LoginData, RegisterData } from '../types/auth.types';

// Define the shape of the context
interface AuthContextProps {
  state: AuthState;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true, // Start as loading to check for token
  error: null,
};

// Create the context
export const AuthContext = createContext<AuthContextProps>({
  state: initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Actions
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; payload: User | null };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        error: null,
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Get token from secure storage
        const token = await SecureStore.getItemAsync('auth_token');
        
        if (token) {
          // For now, we'll just assume the token is valid
          // In a real app, you might want to validate with the server
          // or decode the JWT to get user info
          
          // This is a placeholder for user data
          // In a real app, you would store user data along with the token
          // or decode it from the JWT
          const userData = await SecureStore.getItemAsync('user_data');
          const user = userData ? JSON.parse(userData) : null;
          
          dispatch({ type: 'RESTORE_TOKEN', payload: user });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
        }
      } catch (e) {
        console.error('Failed to restore authentication state:', e);
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    };

    bootstrapAsync();
  }, []);

  // Login handler
  const handleLogin = async (data: LoginData) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const user = await login(data);
      // Store user data
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    }
  };

  // Register handler
  const handleRegister = async (data: RegisterData) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      const user = await register(data);
      // Store user data
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: errorMessage 
      });
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    await SecureStore.deleteItemAsync('user_data');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};