import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyWithDoctors = searchParams.get('onlyWithDoctors') === 'true';

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('doctor_details')
      .select(`
        specialties!inner(id, name, description, icon, category, active)
      `)
      .eq('verified', true);

    const { data: doctorSpecialties, error } = await query;

    if (error) {
      console.error('[API] Error fetching doctor specialties:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Count doctors per specialty
    const specialtyCountMap = new Map<string, number>();
    doctorSpecialties?.forEach((item: any) => {
      const specialty = item.specialties;
      if (specialty && specialty.active) {
        const count = specialtyCountMap.get(specialty.id) || 0;
        specialtyCountMap.set(specialty.id, count + 1);
      }
    });

    // Build response with doctor counts
    const specialties = Array.from(specialtyCountMap.entries()).map(([id, count]) => {
      const specialty = doctorSpecialties?.find((item: any) => item.specialties?.id === id)?.specialties;
      return {
        id: specialty?.id,
        name: specialty?.name,
        description: specialty?.description,
        icon: specialty?.icon,
        category: specialty?.category,
        doctorCount: count,
      };
    });

    // If onlyWithDoctors is true, filter to only specialties with doctors
    const filteredSpecialties = onlyWithDoctors
      ? specialties.filter((s) => s.doctorCount > 0)
      : specialties;

    return NextResponse.json({
      success: true,
      data: filteredSpecialties,
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
