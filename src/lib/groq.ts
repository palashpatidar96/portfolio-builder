/**
 * Groq API — OpenAI-compatible, free tier
 * Model: llama-3.3-70b-versatile (70B params, 128k context)
 * Free: 6,000 req/day, 30 req/min
 * Get key: https://console.groq.com
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const CHAT_MODEL = "llama-3.3-70b-versatile";

async function groqChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4000,
  temperature = 0.1
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function parseResumeWithGroq(text: string): Promise<string> {
  const systemPrompt = `You are a professional resume parser that works for ALL types of professionals — software engineers, content creators, marketers, MBA graduates, designers, teachers, lawyers, doctors, finance professionals, HR managers, and anyone else.

Extract ALL information from the resume and return ONLY valid JSON with this exact structure (no extra text, no markdown, no code fences):
{
  "full_name": "",
  "email": "",
  "phone": "",
  "location": "",
  "title": "the person's current or most recent professional title",
  "summary": "professional summary or a concise 2-3 sentence bio based on their experience",
  "linkedin_url": "",
  "github_url": "",
  "website_url": "",
  "experiences": [{"company": "", "role": "", "start_date": "", "end_date": "", "description": "detailed responsibilities and achievements", "is_current": false}],
  "education": [{"institution": "", "degree": "", "field_of_study": "", "start_date": "", "end_date": "", "description": ""}],
  "projects": [{"name": "specific project, campaign, initiative, or achievement", "description": "what was done and what impact it had (2-3 sentences)", "tech_stack": ["actual tools/platforms/methods used — Excel, Canva, Salesforce, Python, Figma, etc."], "url": "", "github_url": ""}],
  "skills": [{"name": "skill name", "category": "one of: Programming, Frontend, Backend, Database, Cloud & DevOps, AI & ML, Data Engineering, Design, Marketing, Analytics, Finance, Content & Writing, Sales & CRM, Product & Project Mgmt, Leadership, Communication, Tools & Software, Languages, HR & People, Legal & Compliance, Research, Other", "proficiency": 80}]
}

CRITICAL RULES:
1. Extract ALL skills — tools, software, platforms, methodologies, soft skills, domain knowledge (Excel, PowerPoint, Canva, SEO, CRM, Budgeting, Public Speaking, etc.)
2. Proficiency: expert=90-95, proficient=80-85, familiar=70-75
3. Return ONLY the JSON. No explanation, no preamble, no markdown.

PROJECT EXTRACTION RULES (most important — read carefully):
- GOAL: Every portfolio needs 3–6 strong, specific projects. Be creative in extracting them.
- PRIORITY 1 — Explicit projects: If the resume has a "Projects" section, extract those first with full detail.
- PRIORITY 2 — Work achievements: Scan every job description for specific deliverables, launches, campaigns, systems built, processes improved, reports created, events organized, or outcomes with measurable impact. Each one can be a project.
  - Example: "Led redesign of onboarding flow reducing drop-off by 30%" → project: "Onboarding Flow Redesign"
  - Example: "Built automated reporting dashboard in Excel/Tableau" → project: "Automated Reporting Dashboard"
  - Example: "Managed $2M marketing budget and 3 agency relationships" → project: "Marketing Budget & Agency Management"
  - Example: "Created SEO content strategy that grew organic traffic 4x" → project: "SEO Content Strategy"
- PRIORITY 3 — Combine related work: If someone did similar things across multiple jobs (e.g., always built dashboards, always led onboarding, always managed social media), synthesize their BEST version into one strong project showcasing the pattern.
- PRIORITY 4 — Role-based inference: If the resume only has generic duties with NO specifics, infer 2-3 representative projects that a person in that role at that company would typically own. Label description as their likely key contribution.
- For "tech_stack" in each project: list ONLY the actual tools/platforms/methods used for THAT specific work. Never leave it empty — infer from context if needed (e.g., a marketer at a SaaS company likely used HubSpot/Salesforce/Google Analytics).
- "description": 2–3 sentences — what was done, how it was done, and what outcome/impact it had.
- Aim for 3–5 projects minimum. Never return an empty projects array.`;

  return groqChat(systemPrompt, `Parse this resume:\n\n${text}`, 6000, 0.1);
}

export async function generateProjectsWithGroq(
  experiences: Array<{ role: string; company: string; start_date: string; end_date?: string | null; description: string }>,
  skills: Array<{ name: string }>,
  title: string
): Promise<string> {
  const expSummary = experiences
    .map((e) => `• ${e.role} at ${e.company} (${e.start_date}–${e.end_date ?? "Present"}): ${e.description}`)
    .join("\n");
  const skillNames = skills.map((s) => s.name).join(", ");

  const systemPrompt = "You are a professional portfolio writer. Output only valid JSON.";
  const userMessage = `Generate 3–5 portfolio projects for a "${title}" based on their work experience and skills below.

Work Experience:
${expSummary}

Skills & Tools: ${skillNames}

RULES:
- PRIORITY 1: Extract specific deliverables, launches, systems built, campaigns run, or measurable outcomes directly mentioned in the experience.
- PRIORITY 2: If multiple jobs show the same pattern (e.g., always built dashboards, always led onboarding), synthesize the best version into one strong project.
- PRIORITY 3: If experience descriptions are generic, infer 2–3 representative projects a "${title}" would typically own at those companies, using the listed skills as tools.
- "name": specific project/campaign/initiative (4–7 words, no generic titles like "Work at Company")
- "description": 2–3 sentences — what was built/done, how it was done, and what outcome/impact it had.
- "tech_stack": actual tools for THAT specific work — infer from skills list and company context if not stated.
- Aim for 3–5 projects. Never return an empty array.

Return ONLY this JSON array (no explanation, no markdown):
[{"name": "", "description": "", "tech_stack": [], "url": "", "github_url": ""}]`;

  return groqChat(systemPrompt, userMessage, 2000, 0.2);
}

export async function generateTaglineWithGroq(
  fullName: string,
  title: string,
  summary: string,
  topSkills: string[],
  topCompanies: string[]
): Promise<string> {
  const userMessage = `Create a single short motivational tagline (max 15 words) for this person's portfolio page.

Person: ${fullName}
Title: ${title}
Summary: ${summary}
Key Skills: ${topSkills.slice(0, 6).join(", ")}
Worked at: ${topCompanies.slice(0, 3).join(", ")}

RULES:
- Write it AS their personal philosophy or professional mantra — not a generic quote
- It should feel authentic to their field and career (a marketer's tagline ≠ a developer's tagline)
- Punchy, memorable, inspiring — like something they'd put on their LinkedIn headline
- Do NOT include quotation marks, attribution, or any explanation
- Return ONLY the tagline text, nothing else

Examples of good taglines:
- "Turning data into decisions that move businesses forward."
- "I build things people actually want to use."
- "Strategy without execution is just a dream."
- "Making complex ideas simple, one campaign at a time."
- "Code that ships, products that matter."`;

  return groqChat("You are a professional copywriter writing portfolio taglines.", userMessage, 60, 0.8);
}

export async function generateChatResponseWithGroq(
  systemPrompt: string,
  userMessage: string,
  context: string
): Promise<string> {
  const fullSystem = `${systemPrompt}\n\nContext about the person:\n${context}`;
  return groqChat(fullSystem, userMessage, 600, 0.7);
}
