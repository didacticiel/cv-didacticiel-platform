import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
  CV,
  CreateCVData,
  CreateContactData,
  Contact,
  CreateSkillData,
  Skill,
  CreateExperienceData,
  Experience,
  CreateEducationData,
  Education,
} from '@/types/api.types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Configuration Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token Bearer
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer le rafraîchissement du token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<{ access: string }>(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post<User>('/users/register/', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/login/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me/');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Services CV
export const cvService = {
  create: async (data: CreateCVData): Promise<CV> => {
    const response = await apiClient.post<CV>('/cvs/', data);
    return response.data;
  },

  getById: async (id: number): Promise<CV> => {
    const response = await apiClient.get<CV>(`/cvs/${id}/`);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateCVData>): Promise<CV> => {
    const response = await apiClient.patch<CV>(`/cvs/${id}/`, data);
    return response.data;
  },

  list: async (): Promise<CV[]> => {
    const response = await apiClient.get<CV[]>('/cvs/');
    return response.data;
  },
};

// Services Contact
export const contactService = {
  create: async (data: CreateContactData): Promise<Contact> => {
    const response = await apiClient.post<Contact>('/contacts/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateContactData>): Promise<Contact> => {
    const response = await apiClient.patch<Contact>(`/contacts/${id}/`, data);
    return response.data;
  },
};

// Services Compétences
export const skillService = {
  create: async (data: CreateSkillData): Promise<Skill> => {
    const response = await apiClient.post<Skill>('/skills/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateSkillData>): Promise<Skill> => {
    const response = await apiClient.patch<Skill>(`/skills/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/skills/${id}/`);
  },
};

// Services Expériences
export const experienceService = {
  create: async (data: CreateExperienceData): Promise<Experience> => {
    const response = await apiClient.post<Experience>('/experiences/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateExperienceData>): Promise<Experience> => {
    const response = await apiClient.patch<Experience>(`/experiences/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/experiences/${id}/`);
  },
};

// Services Formations
export const educationService = {
  create: async (data: CreateEducationData): Promise<Education> => {
    const response = await apiClient.post<Education>('/educations/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateEducationData>): Promise<Education> => {
    const response = await apiClient.patch<Education>(`/educations/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/educations/${id}/`);
  },
};

export default apiClient;
