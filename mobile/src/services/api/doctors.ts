/**
 * Servicio de API para doctores
 */

import { supabase } from '@mobile/services/supabaseClient';
import type { Doctor, Especialidad, HorarioDisponible } from '@mobile/types/doctor';

/**
 * Obtiene todos los doctores disponibles
 */
export async function getAll(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('rol', 'medico')
    .eq('disponible', true)
    .order('nombre');

  if (error) throw error;
  return data as Doctor[];
}

/**
 * Obtiene doctores por especialidad
 */
export async function getByEspecialidad(especialidad: string): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('rol', 'medico')
    .eq('especialidad', especialidad)
    .eq('disponible', true)
    .order('nombre');

  if (error) throw error;
  return data as Doctor[];
}

/**
 * Obtiene un doctor por ID
 */
export async function getById(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', id)
    .eq('rol', 'medico')
    .single();

  if (error) throw error;
  return data as Doctor;
}

/**
 * Obtiene todas las especialidades disponibles
 */
export async function getEspecialidades(): Promise<Especialidad[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('especialidad')
    .eq('rol', 'medico')
    .not('especialidad', 'is', null);

  if (error) throw error;

  // Agrupar especialidades únicas
  const especialidadesUnicas = Array.from(
    new Set(data.map((item: any) => item.especialidad))
  ).map((nombre, index) => ({
    id: `esp-${index}`,
    nombre: nombre as string,
  }));

  return especialidadesUnicas;
}

/**
 * Obtiene horarios disponibles de un doctor para una fecha
 */
export async function getHorariosDisponibles(
  doctorId: string,
  fecha: string
): Promise<HorarioDisponible> {
  // Esta es una implementación básica
  // En producción, esto consultaría las citas existentes y los horarios del doctor
  const { data: citasExistentes, error } = await supabase
    .from('citas')
    .select('hora')
    .eq('medico_id', doctorId)
    .eq('fecha', fecha)
    .neq('estado', 'cancelada');

  if (error) throw error;

  // Horarios estándar (8 AM - 6 PM)
  const horariosEstandar = [
    '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', 
    '16:00', '17:00', '18:00'
  ];

  // Filtrar horarios ocupados
  const horasOcupadas = citasExistentes.map((cita: any) => cita.hora);
  const horasDisponibles = horariosEstandar.filter(
    (hora) => !horasOcupadas.includes(hora)
  );

  return {
    fecha,
    horas: horasDisponibles,
  };
}

/**
 * Busca doctores por nombre o especialidad
 */
export async function search(query: string): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('rol', 'medico')
    .eq('disponible', true)
    .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,especialidad.ilike.%${query}%`)
    .order('nombre');

  if (error) throw error;
  return data as Doctor[];
}

export const doctorsService = {
  getAll,
  getByEspecialidad,
  getById,
  getEspecialidades,
  getHorariosDisponibles,
  search,
};
