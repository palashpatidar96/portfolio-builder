import type { ResumeData, UserProfile, Experience, Education, Project, Skill } from "@/types/portfolio";
import { getServiceSupabase } from "./supabase";

/**
 * In-memory store for profiles when Supabase is not configured.
 * Data persists only while the server is running.
 * In production, Supabase handles all storage.
 */
const localProfiles = new Map<string, {
  profile: UserProfile;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
}>();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function saveProfile(username: string, data: ResumeData) {
  // Try Supabase first
  const db = getServiceSupabase();
  if (db) {
    const { data: profile, error } = await db
      .from("profiles")
      .insert({
        username,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        location: data.location || null,
        title: data.title,
        summary: data.summary,
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        website_url: data.website_url || null,
      })
      .select()
      .single();

    if (error) throw new Error(`DB error: ${error.message}`);

    if (data.experiences?.length) {
      await db.from("experiences").insert(
        data.experiences.map((exp) => ({ user_id: profile.id, ...exp }))
      );
    }
    if (data.education?.length) {
      await db.from("education").insert(
        data.education.map((edu) => ({ user_id: profile.id, ...edu }))
      );
    }
    if (data.projects?.length) {
      await db.from("projects").insert(
        data.projects.map((proj) => ({ user_id: profile.id, ...proj }))
      );
    }
    if (data.skills?.length) {
      await db.from("skills").insert(
        data.skills.map((skill) => ({ user_id: profile.id, ...skill }))
      );
    }

    return profile;
  }

  // Fallback: save to in-memory store
  const profileId = generateId();
  const now = new Date().toISOString();

  const profile: UserProfile = {
    id: profileId,
    username,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    title: data.title,
    summary: data.summary,
    linkedin_url: data.linkedin_url,
    github_url: data.github_url,
    website_url: data.website_url,
    created_at: now,
    updated_at: now,
  };

  const experiences: Experience[] = (data.experiences || []).map((exp) => ({
    id: generateId(),
    user_id: profileId,
    ...exp,
  }));

  const education: Education[] = (data.education || []).map((edu) => ({
    id: generateId(),
    user_id: profileId,
    ...edu,
  }));

  const projects: Project[] = (data.projects || []).map((proj) => ({
    id: generateId(),
    user_id: profileId,
    ...proj,
  }));

  const skills: Skill[] = (data.skills || []).map((skill) => ({
    id: generateId(),
    user_id: profileId,
    ...skill,
  }));

  localProfiles.set(username, { profile, experiences, education, projects, skills });

  return profile;
}

export function getLocalProfile(username: string) {
  return localProfiles.get(username) || null;
}
