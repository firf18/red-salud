import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/services/chatbot-service";

export const runtime = "nodejs"; // Or 'edge' if Supabase client supports it and no node-specifics

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1);

    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 },
      );
    }

    const stream = await generateChatResponse(
      history,
      lastMessage.content,
      context,
    );

    // Create a ReadableStream from the OpenAI stream
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(text);
            }
          }
        } catch (streamError) {
          console.error("Stream processing error:", streamError);
          controller.enqueue(
            "\n\n[Error al generar la respuesta. Por favor intenta de nuevo.]",
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("Error in chat API:", error);
    // Check for specific OpenRouter/OpenAI errors
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 500;
    const message =
      error instanceof Error && "error" in error
        ? (error as { error: { message?: string } }).error?.message ||
          error.message
        : error instanceof Error
          ? error.message
          : "Error interno del servidor";

    return NextResponse.json(
      { error: "Error processing chat request", details: message },
      { status: status },
    );
  }
}
