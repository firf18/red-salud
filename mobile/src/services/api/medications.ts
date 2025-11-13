import { supabase } from '../supabaseClient';
import type { Medication, MedicationStats } from '@mobile/types';

export const medicationsService = {
  /**
   * Obtener todos los medicamentos de un paciente
   */
  async getAll(userId: string): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .select('*')
      .eq('paciente_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Medication[];
  },

  /**
   * Obtener medicamentos activos
   */
  async getActive(userId: string, limit?: number): Promise<Medication[]> {
    let query = supabase
      .from('medication_reminders')
      .select('*')
      .eq('paciente_id', userId)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Medication[];
  },

  /**
   * Obtener un medicamento por ID
   */
  async getById(id: string): Promise<Medication> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Medication;
  },

  /**
   * Obtener estadísticas de medicamentos
   */
  async getStats(userId: string): Promise<MedicationStats> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .select('id, activo')
      .eq('paciente_id', userId);

    if (error) throw error;

    const active = data?.filter((med) => med.activo).length || 0;
    const total = data?.length || 0;

    return { active, total };
  },

  /**
   * Crear un nuevo recordatorio de medicamento
   */
  async create(medication: Partial<Medication>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .insert([medication])
      .select()
      .single();

    if (error) throw error;
    return data as Medication;
  },

  /**
   * Actualizar un medicamento
   */
  async update(id: string, updates: Partial<Medication>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Medication;
  },

  /**
   * Desactivar un medicamento
   */
  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('medication_reminders')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Eliminar un medicamento
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('medication_reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
