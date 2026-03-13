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
          content:
            'You are a resume parser. Extract structured information from the resume text and return ONLY valid JSON with this exact structure (no extra text, no markdown code fences):\n{\n  "full_name": "",\n  "email": "",\n  "phone": "",\n  "location": "",\n  "title": "",\n  "summary": "",\n  "linkedin_url": "",\n  "github_url": "",\n  "website_url": "",\n  "experiences": [{"company": "", "role": "", "start_date": "", "end_date": "", "description": "", "is_current": false}],\n  "education": [{"institution": "", "degree": "", "field_of_study": "", "start_date": "", "end_date": "", "description": ""}],\n  "projects": [{"name": "", "description": "", "tech_stack": [], "url": "", "github_url": ""}],\n  "skills": [{"name": "", "category": "", "proficiency": 80}]\n}\nReturn ONLY the JSON.',
        },
        { role: "user", content: `Parse this resume:\n\n${text}` },
      ],
      max_tokens: 3000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resume parse API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "{}";
}
