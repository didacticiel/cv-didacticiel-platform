// Types pour l'API Django REST

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_premium_subscriber: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface CV {
  id: number;
  user: number;
  title: string;
  summary?: string;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
}

export interface Contact {
  id: number;
  cv: number;
  phone_number: string;
  email: string;
  city: string;
  country?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface Experience {
  id: number;
  cv: number;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  order: number;
}

export interface Education {
  id: number;
  cv: number;
  degree: string;
  institution: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  order: number;
}

export interface Skill {
  id: number;
  cv: number;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  order: number;
}

export interface CreateCVData {
  title: string;
  summary?: string;
}

export interface CreateContactData {
  cv: number;
  phone_number: string;
  email: string;
  city: string;
  country?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface CreateExperienceData {
  cv: number;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  order: number;
}

export interface CreateEducationData {
  cv: number;
  degree: string;
  institution: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  order: number;
}

export interface CreateSkillData {
  cv: number;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  order: number;
}
