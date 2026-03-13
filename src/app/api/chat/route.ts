import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/huggingface";
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

    const systemPrompt = `You are a helpful AI assistant for ${username}'s portfolio website. Answer questions about this person's experience, skills, projects, and background based on the context provided. Be professional, concise, and helpful. If asked something not in the context, politely say you don't have that information. Never make up information.`;

    const response = await generateChatResponse(
      systemPrompt,
      message,
      context
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
