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


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Pas de valeur par défaut générique
const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8080'; 
//  Utilisez la nouvelle variable VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
// Configuration de l'instance Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------
// 2. Intercepteurs Axios (Gestion des Tokens)
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

// Intercepteur 2 : Gestion du rafraîchissement du token (Refresh Token Logic)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si l'erreur est un 401 (Non autorisé) et que ce n'est pas une tentative de rafraîchissement réessayée.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Appel de l'API pour obtenir un nouveau token d'accès
        const response = await axios.post<{ access: string }>(
          `http://localhost:8000/api/v1/auth/token/refresh/`, 
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access); // Stocke le nouveau token
        
        // Mise à jour de l'en-tête de la requête originale avec le nouveau token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        // Rejoue la requête originale avec le nouveau token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue (token invalide ou expiré), déconnexion forcée
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; // Redirection vers la page de connexion
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
  // Inscription standard : récupère les tokens de la réponse Django et les stocke.
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

  // Connexion standard : récupère les tokens de l'API /auth/login/ et les stocke.
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/login/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  // Récupère les données de l'utilisateur actuellement connecté (via le token Bearer).
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me/');
    return response.data;
  },

  // Déconnexion : envoie le refresh token pour invalider la session (si possible) et efface les tokens locaux.
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
  // LOGIQUE AUTHENTIFICATION GOOGLE OAUTH2 (Simplifiée)
  // -----------------------------------------------------------

  // 🎯 MODIFICATION CRITIQUE 1 : Le frontend construit l'URL d'autorisation Google.
  // Cette fonction ne fait plus appel au backend, elle prépare la redirection OAuth.
  getGoogleAuthUrl: async () => {
    // L'URI de redirection DOIT correspondre à celui configuré dans Google Console ET dans settings.py de Django.
    const redirect_uri = `${FRONTEND_BASE_URL}/auth/social/callback`;

    const scope = [
      'profile', 
      'email',
    ].join(' '); // Définit les données demandées à Google.

    // Génération d'un paramètre 'state' unique et aléatoire pour la sécurité (prévention CSRF).
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Construit les paramètres de la requête d'autorisation Google.
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirect_uri,
      response_type: 'code', // Demande un code d'autorisation
      scope: scope,
      state: state,
      access_type: 'offline', // Important pour obtenir un refresh token
      prompt: 'consent', 
    });
    
    const authorization_url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    return { authorization_url, state }; 
  },

  // 🎯 MODIFICATION CRITIQUE 2 : Gère le code de retour de Google et l'envoie au backend.
  // Le backend (via `dj-rest-auth.registration.views.SocialLoginView`) prendra le relais.
  handleGoogleCallback: async (code: string, state: string) => {
    const redirect_uri = `${FRONTEND_BASE_URL}/auth/social/callback`;

    // Le POST à /users/google/ déclenche l'échange de code d'autorisation contre les tokens.
    // 💡 dj-rest-auth.registration.views.SocialLoginView exige le 'redirect_uri' 
    // pour valider l'échange.
    const response = await apiClient.post('/users/google/', { 
      code, 
      state,
      redirect_uri: redirect_uri 
    });
    
    // Stockage des tokens reçus du backend (similaire à la connexion/inscription standard).
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    
    if (response.data.access) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    }
    
    return response.data;
  },
};

// -----------------------------------------------------------
// 4. Services CRUD (CV, Contact, Compétences, Expériences, Formations)
// -----------------------------------------------------------

// Services CV
export const cvService = {
  create: async (data: CreateCVData): Promise<CV> => {
    const response = await apiClient.post<CV>('/cvs/', data);
    return response.data;
  },
// ... (autres fonctions de cvService)
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