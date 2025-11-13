import { supabase } from '../supabaseClient';
import type { Appointment, AppointmentStats } from '@mobile/types';

export const appointmentsService = {
  /**
   * Obtener todas las citas de un paciente
   */
  async getAll(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url
        )
      `)
      .eq('paciente_id', userId)
      .order('fecha_hora', { ascending: true });

    if (error) throw error;
    return (data || []) as Appointment[];
  },

  /**
   * Obtener próximas citas (confirmadas o pendientes)
   */
  async getUpcoming(userId: string, limit: number = 3): Promise<Appointment[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url
        )
      `)
      .eq('paciente_id', userId)
      .in('status', ['pendiente', 'confirmada'])
      .gte('fecha_hora', now)
      .order('fecha_hora', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Appointment[];
  },

  /**
   * Obtener una cita por ID
   */
  async getById(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url,
          email,
          telefono
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  /**
   * Obtener estadísticas de citas
   */
  async getStats(userId: string): Promise<AppointmentStats> {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('paciente_id', userId);

    if (error) throw error;

    const upcoming = data?.filter(
      (apt) => apt.status === 'pendiente' || apt.status === 'confirmada'
    ).length || 0;
    
    const total = data?.length || 0;
    const completed = data?.filter((apt) => apt.status === 'completada').length || 0;

    return { upcoming, total, completed };
  },

  /**
   * Crear una nueva cita
   */
  async create(appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  /**
   * Cancelar una cita
   */
  async cancel(id: string, reason?: string): Promise<void> {
    const updateData: any = { status: 'cancelada' };
    if (reason) {
      updateData.notas = reason;
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Actualizar una cita
   */
  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  },
};
