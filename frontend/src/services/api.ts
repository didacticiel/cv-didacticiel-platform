// src/services/api.ts

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

// -----------------------------------------------------------
// 1. Configuration de base et variables d'environnement
// -----------------------------------------------------------

// 💡 Suppression des variables VITE_GOOGLE_CLIENT_ID et VITE_FRONTEND_URL
// Le client ID sera utilisé directement dans le composant de connexion, et
// l'URL de callback n'est plus nécessaire pour la méthode ID Token.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Configuration de l'instance Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------
// 2. Intercepteurs Axios (Gestion des Tokens) - Reste INCHANGÉ
// -----------------------------------------------------------

// Intercepteur 1 : Ajout du token Bearer aux requêtes
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    // Si un token est présent, il est ajouté à l'en-tête Authorization.
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur 2 : Gestion du rafraîchissement du token (Refresh Token Logic) - Reste INCHANGÉ
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

        // Appel de l'API pour obtenir un nouveau token d'accès
        // NOTE: L'URL doit être ajustée si elle n'est pas sous API_BASE_URL
        const response = await axios.post<{ access: string }>(
          `${API_BASE_URL.replace('/api/v1', '')}/auth/token/refresh/`, // Utilisation de API_BASE_URL pour la flexibilité
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


type RegisterResponse = User & { access: string; refresh: string; };

// -----------------------------------------------------------
// 3. Services d'authentification (authService)
// -----------------------------------------------------------

export const authService = {
  // Inscription standard : Reste INCHANGÉ
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post<RegisterResponse>('/users/register/', data);
    
    const { access, refresh, ...user_data } = response.data;

    if (access) {
      localStorage.setItem('access_token', access);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`; 
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
    
    return user_data as User; 
  },

  // Connexion standard : Reste INCHANGÉ
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/login/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  // Récupère les données de l'utilisateur : Reste INCHANGÉ
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me/');
    return response.data;
  },

  // Déconnexion : Reste INCHANGÉ
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/users/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // -----------------------------------------------------------
  // LOGIQUE AUTHENTIFICATION GOOGLE ID TOKEN (Nouveau)
  // -----------------------------------------------------------

  // 🎯 NOUVEAU : Envoie l'ID Token reçu du composant Google One Tap/Button au backend.
  googleIDLogin: async (idToken: string): Promise<AuthTokens> => {
    // Le POST à /users/google-auth/ envoie le token d'identité.
    const response = await apiClient.post<AuthTokens>('/users/google-auth/', { 
      id_token: idToken,
    });

    const { access, refresh } = response.data;
    
    // Stockage des tokens reçus du backend.
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    return response.data;
  },

  // -----------------------------------------------------------
  // LOGIQUE AUTHENTIFICATION GOOGLE OAUTH2 (OBSOLÈTE)
  // -----------------------------------------------------------

  // 🗑️ SUPPRIMÉ : Cette fonction gérait l'ancienne méthode Code Flow.
  // getGoogleAuthUrl: async () => { ... }

  // 🗑️ SUPPRIMÉ : Cette fonction gérait l'ancienne méthode Code Flow.
  // handleGoogleCallback: async (code: string, state: string) => { ... }
};

// -----------------------------------------------------------
// 4. Services CRUD (CV, Contact, Compétences, Expériences, Formations) - Reste INCHANGÉ
// -----------------------------------------------------------

// Services CV
export const cvService = {
  // ... (fonctions de cvService)
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

// Services Contact - Reste INCHANGÉ
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

// Services Compétences - Reste INCHANGÉ
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

// Services Expériences - Reste INCHANGÉ
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

// Services Formations - Reste INCHANGÉ
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