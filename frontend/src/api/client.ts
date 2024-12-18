// src/api/client.ts
import axios from 'axios';

export const API_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors if needed
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle global errors here
      return Promise.reject(error);
    }
  );