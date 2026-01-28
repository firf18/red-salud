import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener preguntas (sin las respuestas hasheadas)
    const { data, error } = await supabase
      .from("security_questions")
      .select("question_1, question_2, question_3, created_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, message: "Error al obtener preguntas" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hasQuestions: !!data,
      questions: data ? [
        { question: data.question_1 },
        { question: data.question_2 },
        { question: data.question_3 },
      ] : null,
    });
  } catch (error) {
    console.error("Error getting security questions:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener preguntas" },
      { status: 500 }
    );
  }
}
