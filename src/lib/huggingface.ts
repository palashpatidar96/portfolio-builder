// HuggingFace Inference API — uses the new router.huggingface.co with OpenAI-compatible chat API
const HF_CHAT_URL = "https://router.huggingface.co/novita/v3/openai/chat/completions";
const HF_EMBED_URL = "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/";

// Free models
const CHAT_MODEL = "meta-llama/llama-3.1-8b-instruct";
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

export async function generateChatResponse(
  systemPrompt: string,
  userMessage: string,
  context: string
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HuggingFace API key not configured");

  const response = await fetch(HF_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nContext about the person:\n${context}`,
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("HF API error:", error);
    throw new Error(`Hugging Face API error: ${response.status}`);
  }

  const data = await response.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "I couldn't generate a response. Please try again."
  );
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  const response = await fetch(HF_EMBED_URL + EMBEDDING_MODEL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function parseResumeWithAI(text: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HuggingFace API key not configured");

  const response = await fetch(HF_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a professional resume parser that works for ALL types of professionals — software engineers, content creators, marketers, MBA graduates, designers, teachers, lawyers, doctors, finance professionals, HR managers, and anyone else.

Extract ALL information from the resume and return ONLY valid JSON with this exact structure (no extra text, no markdown, no code fences):
{
  "full_name": "",
  "email": "",
  "phone": "",
  "location": "",
  "title": "the person's current or most recent professional title",
  "summary": "professional summary or objective from the resume, or a concise 2-3 sentence bio based on their experience",
  "linkedin_url": "",
  "github_url": "",
  "website_url": "",
  "experiences": [{"company": "", "role": "", "start_date": "", "end_date": "", "description": "detailed description of responsibilities and achievements", "is_current": false}],
  "education": [{"institution": "", "degree": "", "field_of_study": "", "start_date": "", "end_date": "", "description": ""}],
  "projects": [{"name": "specific project, campaign, initiative, or achievement", "description": "what was done and what impact it had", "tech_stack": ["tools", "platforms", "methodologies used — NOT just code languages; include Excel, Canva, Salesforce, PowerPoint, etc."], "url": "", "github_url": ""}],
  "skills": [{"name": "skill name", "category": "one of: Technical, Programming, Design, Marketing, Analytics, Communication, Leadership, Finance, Operations, Tools & Software, Languages, Domain Expertise, Other", "proficiency": 80}]
}

CRITICAL RULES:
1. Extract ALL skills mentioned — tools, software, platforms, methodologies, soft skills, domain knowledge (e.g. Excel, PowerPoint, Canva, SEO, CRM, Project Management, Budgeting, Public Speaking, etc.)
2. Proficiency: estimate based on years of experience or how prominently the skill appears (expert=90-95, proficient=80-85, familiar=70-75).
3. Return ONLY the JSON object. No explanation, no preamble.

PROJECT EXTRACTION RULES (most important — read carefully):
- GOAL: Every portfolio needs 3–6 strong, specific projects. Be creative in extracting them.
- PRIORITY 1 — Explicit projects: If the resume has a "Projects" section, extract those first with full detail.
- PRIORITY 2 — Work achievements: Scan every job description for specific deliverables, launches, campaigns, systems built, processes improved, reports created, events organized, or outcomes with measurable impact. Each one can be a project.
  - Example: "Led redesign of onboarding flow reducing drop-off by 30%" → project: "Onboarding Flow Redesign"
  - Example: "Built automated reporting dashboard in Excel/Tableau" → project: "Automated Reporting Dashboard"
  - Example: "Managed $2M marketing budget and 3 agency relationships" → project: "Marketing Budget & Agency Management"
  - Example: "Created SEO content strategy that grew organic traffic 4x" → project: "SEO Content Strategy"
- PRIORITY 3 — Combine related work: If someone did similar things across multiple jobs, synthesize their BEST version into one strong project.
- PRIORITY 4 — Role-based inference: If the resume only has generic duties with NO specifics, infer 2-3 representative projects a person in that role would typically own.
- For "tech_stack": list actual tools used for THAT specific work. Infer from context if needed (e.g. marketer at SaaS company → HubSpot/Salesforce/Google Analytics).
- "description": 2–3 sentences — what was done, how it was done, and the outcome/impact.
- Aim for 3–5 projects minimum. Never return an empty projects array.`,
        },
        { role: "user", content: `Parse this resume and extract everything accurately:\n\n${text}` },
      ],
      max_tokens: 4000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resume parse API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "{}";
}
