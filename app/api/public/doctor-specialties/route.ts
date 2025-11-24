import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const onlyWithDoctors = searchParams.get("onlyWithDoctors") === "true";

  try {
    if (onlyWithDoctors) {
      const { data, error } = await supabaseAdmin
        .from("doctor_profiles")
        .select(
          `specialty:medical_specialties (
            id,
            name,
            description,
            icon,
            created_at
          )`
        )
        .eq("is_active", true)
        .eq("is_verified", true);

      if (error) throw error;

      const specialtyMap = new Map<string, any>();

      (data || []).forEach((row: any) => {
        const specialty = row.specialty;
        if (specialty && !specialtyMap.has(specialty.id)) {
          specialtyMap.set(specialty.id, {
            id: specialty.id,
            name: specialty.name,
            description: specialty.description || "",
            icon: specialty.icon || "stethoscope",
            created_at: specialty.created_at,
          });
        }
      });

      const specialties = Array.from(specialtyMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      return NextResponse.json({ success: true, data: specialties });
    }

    const { data, error } = await supabaseAdmin
      .from("medical_specialties")
      .select("id, name, description, icon, created_at")
      .order("name");

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[doctor-specialties] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
