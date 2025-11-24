import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialtyId = searchParams.get("specialtyId");
  const featuredOnly = searchParams.get("featured") === "true";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 24) : undefined;

  try {
    let query = supabaseAdmin
      .from("doctor_profiles")
      .select(
        `
        id,
        specialty_id,
        license_number,
        years_experience,
        bio,
        consultation_price,
        consultation_duration,
        is_verified,
        is_active,
        accepts_insurance,
        professional_phone,
        clinic_address,
        created_at,
        updated_at,
        profile:profiles(
          id,
          nombre_completo,
          email,
          avatar_url,
          telefono,
          direccion,
          ciudad,
          estado
        ),
        specialty:medical_specialties(
          id,
          name,
          description,
          icon,
          created_at
        )
      `
      )
      .eq("is_active", true)
      .eq("is_verified", true)
      .order("created_at", { ascending: true });

    if (specialtyId) {
      query = query.eq("specialty_id", specialtyId);
    }

    // Filtrar por destacados si hay configuración (tabla o columna). Fallback seguro.
    if (featuredOnly) {
      try {
        const { data: featured, error: fErr } = await supabaseAdmin
          .from("featured_doctors")
          .select("doctor_profile_id");

        if (!fErr && Array.isArray(featured) && featured.length > 0) {
          const ids = featured.map((f: any) => f.doctor_profile_id).filter(Boolean);
          if (ids.length > 0) {
            // @ts-ignore - in() está disponible en el cliente de Supabase
            query = query.in("id", ids);
          } else {
            return NextResponse.json({ success: true, data: [] });
          }
        } else {
          // Si no hay tabla o no hay destacados, devolver vacío para evitar datos falsos
          return NextResponse.json({ success: true, data: [] });
        }
      } catch (e) {
        // Tabla no existe u otro error: no mostramos nada
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    let doctors = (data || []).map((row: any) => {
      const profile = row.profile
        ? {
            id: row.profile.id,
            nombre_completo: row.profile.nombre_completo,
            email: row.profile.email,
            avatar_url: row.profile.avatar_url,
          }
        : undefined;

      return {
        id: row.id,
        specialty_id: row.specialty_id,
        license_number: row.license_number,
        anos_experiencia: row.years_experience || 0,
        biografia: row.bio || undefined,
        tarifa_consulta: row.consultation_price
          ? Number(row.consultation_price)
          : undefined,
        consultation_duration: row.consultation_duration || 30,
        verified: row.is_verified,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profile,
        specialty:
          row.specialty || {
            id: row.specialty_id || "",
            name: "Medicina General",
            description: "",
            icon: "stethoscope",
            created_at: row.created_at,
          },
      };
    });

    if (limit) {
      doctors = doctors.slice(0, limit);
    }

    return NextResponse.json({ success: true, data: doctors });
  } catch (error) {
    console.error("[public-doctors] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
