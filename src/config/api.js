/**
 * API Configuration
 * Centralized location for backend URLs and endpoints.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://medical-survey-backend.onrender.com';
export const AUTH_STORAGE_KEY = 'kirana-ai-auth-v1';

export const getAuthToken = () => {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored)?.token || '' : '';
  } catch (error) {
    return '';
  }
};

export const authHeaders = (headers = {}) => {
  const token = getAuthToken();
  return token
    ? { ...headers, Authorization: `Bearer ${token}` }
    : headers;
};

export const ENDPOINTS = {
  LOGIN_SURVEYOR: `${API_BASE_URL}/survey/auth/login`,
  GET_SURVEYORS: `${API_BASE_URL}/survey/surveyors/`,
  SAVE_SURVEYOR: `${API_BASE_URL}/survey/surveyor/`,
  SAVE_STORE: `${API_BASE_URL}/survey/store_details/`,
  START_SURVEY_SESSION: `${API_BASE_URL}/survey/start-session`,
  GET_SURVEY_QUESTIONS: `${API_BASE_URL}/survey/questions`,
  SUBMIT_SURVEY: `${API_BASE_URL}/survey/survey/submit`,
  GET_SUBMISSIONS: `${API_BASE_URL}/survey/submissions`,
  // Add more endpoints here as the project grows
};
