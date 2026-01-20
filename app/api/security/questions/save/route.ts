import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { questions } = await request.json();

    if (!questions || questions.length !== 3) {
      return NextResponse.json(
        { success: false, message: "Se requieren 3 preguntas de seguridad" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 },
      );
    }

    // Hashear las respuestas
    interface SecurityQuestion {
      question: string;
      answer: string;
    }
    const hashedAnswers = await Promise.all(
      questions.map((q: SecurityQuestion) =>
        bcrypt.hash(q.answer.toLowerCase().trim(), 10),
      ),
    );

    // Guardar en la base de datos
    const { error: upsertError } = await supabase
      .from("security_questions")
      .upsert({
        user_id: user.id,
        question_1: questions[0].question,
        answer_1_hash: hashedAnswers[0],
        question_2: questions[1].question,
        answer_2_hash: hashedAnswers[1],
        question_3: questions[2].question,
        answer_3_hash: hashedAnswers[2],
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      return NextResponse.json(
        { success: false, message: "Error al guardar preguntas" },
        { status: 500 },
      );
    }

    // Registrar evento de seguridad
    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: "security_questions_updated",
      event_description: "Preguntas de seguridad actualizadas",
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Preguntas de seguridad guardadas correctamente",
    });
  } catch (error) {
    console.error("Error saving security questions:", error);
    return NextResponse.json(
      { success: false, message: "Error al guardar preguntas" },
      { status: 500 },
    );
  }
}
