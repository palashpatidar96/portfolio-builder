import { getSupabase, getServiceSupabase } from "./supabase";
import type {
  UserProfile,
  Experience,
  Education,
  Project,
  Skill,
  ResumeData,
} from "@/types/portfolio";

export async function createUserProfile(
  username: string,
  data: ResumeData
): Promise<UserProfile> {
  const db = getServiceSupabase();
  if (!db) throw new Error("Database not configured. Please set up Supabase credentials in .env.local");

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

  if (error) throw new Error(`Failed to create profile: ${error.message}`);

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

export async function getProfileByUsername(username: string) {
  const db = getSupabase();
  if (!db) return null;

  const { data: profile, error } = await db
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;
  return profile as UserProfile;
}

export async function getExperiences(userId: string): Promise<Experience[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data } = await db
    .from("experiences")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  return (data as Experience[]) || [];
}

export async function getEducation(userId: string): Promise<Education[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data } = await db
    .from("education")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  return (data as Education[]) || [];
}

export async function getProjects(userId: string): Promise<Project[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data } = await db
    .from("projects")
    .select("*")
    .eq("user_id", userId);
  return (data as Project[]) || [];
}

export async function getSkills(userId: string): Promise<Skill[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data } = await db
    .from("skills")
    .select("*")
    .eq("user_id", userId);
  return (data as Skill[]) || [];
}

export async function getFullProfile(username: string) {
  const profile = await getProfileByUsername(username);
  if (!profile) return null;

  const [experiences, education, projects, skills] = await Promise.all([
    getExperiences(profile.id),
    getEducation(profile.id),
    getProjects(profile.id),
    getSkills(profile.id),
  ]);

  return { profile, experiences, education, projects, skills };
}

export async function buildChatContext(username: string): Promise<string> {
  const data = await getFullProfile(username);
  if (!data) return "No profile data found.";

  const { profile, experiences, education, projects, skills } = data;

  let context = `Name: ${profile.full_name}\nTitle: ${profile.title}\nSummary: ${profile.summary}\n`;
  if (profile.location) context += `Location: ${profile.location}\n`;
  if (profile.email) context += `Email: ${profile.email}\n`;

  if (experiences.length) {
    context += `\nWork Experience:\n`;
    experiences.forEach((exp) => {
      context += `- ${exp.role} at ${exp.company} (${exp.start_date} - ${exp.end_date || "Present"}): ${exp.description}\n`;
    });
  }
  if (education.length) {
    context += `\nEducation:\n`;
    education.forEach((edu) => {
      context += `- ${edu.degree} in ${edu.field_of_study} from ${edu.institution} (${edu.start_date} - ${edu.end_date || "Present"})\n`;
    });
  }
  if (projects.length) {
    context += `\nProjects:\n`;
    projects.forEach((proj) => {
      context += `- ${proj.name}: ${proj.description} [Tech: ${proj.tech_stack?.join(", ")}]\n`;
    });
  }
  if (skills.length) {
    context += `\nSkills:\n`;
    const grouped = skills.reduce(
      (acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s.name);
        return acc;
      },
      {} as Record<string, string[]>
    );
    Object.entries(grouped).forEach(([cat, names]) => {
      context += `- ${cat}: ${names.join(", ")}\n`;
    });
  }

  return context;
}
