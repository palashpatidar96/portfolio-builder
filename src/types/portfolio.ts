export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  title: string;
  summary: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  tagline?: string;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  description: string;
  is_current: boolean;
}

export interface Education {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  tech_stack: string[];
  url?: string;
  github_url?: string;
  image_url?: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  proficiency: number; // 1-100
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ResumeData {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  title: string;
  summary: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  tagline?: string;
  experiences: Omit<Experience, "id" | "user_id">[];
  education: Omit<Education, "id" | "user_id">[];
  projects: Omit<Project, "id" | "user_id">[];
  skills: Omit<Skill, "id" | "user_id">[];
}
