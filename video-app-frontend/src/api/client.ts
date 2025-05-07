// src/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL of your backend API
// Replace with your actual backend URL when deploying
const API_URL = 'http://192.168.1.2:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;