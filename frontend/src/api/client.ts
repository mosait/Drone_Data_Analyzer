// src/api/client.ts
import axios from 'axios';

export const API_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error);
    }
);