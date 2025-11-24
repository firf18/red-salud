import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/geographic-coverage
 * 
 * Retorna estadísticas de cobertura geográfica en Venezuela:
 * - Número de estados con servicios activos
 * - Total de servicios por estado
 * - Porcentaje de penetración nacional
 */
export async function GET() {
  try {
    // Obtener total de estados de Venezuela
    const { count: totalEstados } = await supabaseAdmin
      .from("estados_venezuela")
      .select("*", { count: "exact", head: true });

    if (!totalEstados) {
      return NextResponse.json({
        success: false,
        error: "No se pudieron obtener los estados",
      }, { status: 500 });
    }

    // Obtener estados con médicos activos
    const { data: estadosConMedicos } = await supabaseAdmin
      .from("doctor_profiles")
      .select("estado_id")
      .not("estado_id", "is", null)
      .eq("verified", true);

    // Obtener estados con clínicas activas
    const { data: estadosConClinicas } = await supabaseAdmin
      .from("clinic_profiles")
      .select("estado_id")
      .not("estado_id", "is", null);

    // Obtener estados con farmacias activas
    const { data: estadosConFarmacias } = await supabaseAdmin
      .from("pharmacy_profiles")
      .select("estado_id")
      .not("estado_id", "is", null);

    // Obtener estados con laboratorios activos
    const { data: estadosConLaboratorios } = await supabaseAdmin
      .from("laboratory_profiles")
      .select("estado_id")
      .not("estado_id", "is", null);

    // Obtener estados con aseguradoras activas
    const { data: estadosConSeguros } = await supabaseAdmin
      .from("insurance_profiles")
      .select("estado_id")
      .not("estado_id", "is", null);

    // Combinar todos los estado_ids únicos
    const todosEstados = [
      ...(estadosConMedicos?.map(d => d.estado_id) || []),
      ...(estadosConClinicas?.map(c => c.estado_id) || []),
      ...(estadosConFarmacias?.map(f => f.estado_id) || []),
      ...(estadosConLaboratorios?.map(l => l.estado_id) || []),
      ...(estadosConSeguros?.map(s => s.estado_id) || []),
    ];

    const estadosUnicos = new Set(todosEstados.filter(id => id !== null));
    const estadosConCobertura = estadosUnicos.size;

    // Calcular porcentaje de penetración
    const porcentajePenetracion = Math.round((estadosConCobertura / totalEstados) * 100);

    // Obtener detalles de los estados con cobertura
    const { data: estadosDetalles } = await supabaseAdmin
      .from("estados_venezuela")
      .select("id, nombre, codigo")
      .in("id", Array.from(estadosUnicos));

    // Contar servicios por estado
    const serviciosPorEstado = estadosDetalles?.map(estado => {
      const medicos = estadosConMedicos?.filter(d => d.estado_id === estado.id).length || 0;
      const clinicas = estadosConClinicas?.filter(c => c.estado_id === estado.id).length || 0;
      const farmacias = estadosConFarmacias?.filter(f => f.estado_id === estado.id).length || 0;
      const laboratorios = estadosConLaboratorios?.filter(l => l.estado_id === estado.id).length || 0;
      const seguros = estadosConSeguros?.filter(s => s.estado_id === estado.id).length || 0;

      return {
        estado: estado.nombre,
        codigo: estado.codigo,
        total: medicos + clinicas + farmacias + laboratorios + seguros,
        medicos,
        clinicas,
        farmacias,
        laboratorios,
        seguros,
      };
    }) || [];

    // Ordenar por total de servicios (descendente)
    serviciosPorEstado.sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      data: {
        totalEstados,
        estadosConCobertura,
        porcentajePenetracion,
        serviciosPorEstado,
      },
    });

  } catch (error) {
    console.error("Error al obtener cobertura geográfica:", error);
    return NextResponse.json({
      success: false,
      error: "Error al procesar la solicitud",
    }, { status: 500 });
  }
}
