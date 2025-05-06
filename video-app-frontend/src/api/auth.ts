// src/api/auth.ts
import apiClient from './client';
import { LoginData, RegisterData, AuthResponse } from '../types/auth.types';
import * as SecureStore from 'expo-secure-store';

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    // Store the token in secure storage
    if (response.data.token) {
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error && (error as any).response?.data) {
      throw (error as any).response.data;
    }
    throw { error: 'Login failed' };
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    // Store the token in secure storage
    if (response.data.token) {
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error && (error as any).response?.data) {
      throw (error as any).response.data;
    }
    throw { error: 'Registration failed' };
  }
};

export const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('auth_token');
};