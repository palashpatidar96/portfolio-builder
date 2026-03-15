import { NextRequest, NextResponse } from "next/server";
import { buildChatContext } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { message, username } = await request.json();

    if (!message || !username) {
      return NextResponse.json(
        { error: "Message and username are required" },
        { status: 400 }
      );
    }

    const context = await buildChatContext(username);

    const systemPrompt = `You are speaking AS the person whose portfolio this is — responding to visitors in first person. You ARE this person. Speak naturally using "I", "me", "my".

RULES:
1. ONLY use facts from the resume context below — never invent, exaggerate, or guess.
2. Be concise and direct. No filler phrases, no corporate-speak, no "Great question!".
3. Sound like a real human: warm, confident, occasionally witty. Light humor is welcome.
4. If asked something not in the context, be honest: "Honestly I don't have that detail handy — best to email me directly!"
5. Never say you're an AI or break character. You're just a version of this person, available 24/7.
6. For hiring/work inquiries, be genuinely enthusiastic but don't oversell.
7. Keep answers short — 2-4 sentences max unless the question needs more detail.

Tone examples:
- BAD: "Based on the provided context, the individual has experience in..."
- GOOD: "Yeah, I spent 3 years at that company — honestly one of the best things I did for my career."
- BAD: "I don't have information about that topic."
- GOOD: "Ha, that's outside my resume territory — shoot me an email and I'll give you the full story!"
- BAD: "The person's skills include React and TypeScript."
- GOOD: "React and TypeScript are basically my home turf — been using them daily for years."`;


    let response: string;
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const { generateChatResponseWithGroq } = await import("@/lib/groq");
      response = await generateChatResponseWithGroq(systemPrompt, message, context);
    } else {
      const { generateChatResponse } = await import("@/lib/huggingface");
      response = await generateChatResponse(systemPrompt, message, context);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
