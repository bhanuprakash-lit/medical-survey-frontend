/**
 * API Configuration
 * Centralized location for backend URLs and endpoints.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const AUTH_STORAGE_KEY = 'kirana-ai-auth-v1';
export const ADMIN_AUTH_STORAGE_KEY = 'kirana-ai-admin-auth-v1';

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

export const getAdminAuthToken = () => {
  try {
    const stored = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored)?.token || '' : '';
  } catch (error) {
    return '';
  }
};

export const adminAuthHeaders = (headers = {}) => {
  const token = getAdminAuthToken();
  return token
    ? { ...headers, Authorization: `Bearer ${token}` }
    : headers;
};

export const ENDPOINTS = {
  LOGIN_SURVEYOR: `${API_BASE_URL}/survey/auth/login`,
  LOGIN_ADMIN: `${API_BASE_URL}/survey/auth/admin-login`,
  GET_SURVEYORS: `${API_BASE_URL}/survey/surveyors/`,
  SAVE_SURVEYOR: `${API_BASE_URL}/survey/surveyor/`,
  SAVE_STORE: `${API_BASE_URL}/survey/store_details/`,
  START_SURVEY_SESSION: `${API_BASE_URL}/survey/start-session`,
  GET_SURVEY_QUESTIONS: `${API_BASE_URL}/survey/questions`,
  SUBMIT_SURVEY: `${API_BASE_URL}/survey/survey/submit`,
  GET_SUBMISSIONS: `${API_BASE_URL}/survey/submissions`,
  GET_ANALYTICS: `${API_BASE_URL}/survey/survey/analytics`,
  GET_COMBINATION_ANALYTICS: `${API_BASE_URL}/survey/survey/combination-analytics`,
  GET_SIMILARITY_ANALYTICS: `${API_BASE_URL}/survey/survey/open-ended-analytics`,
};
