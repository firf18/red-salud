/**
 * Hook para gestión de doctores
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { doctorsService } from '@mobile/services/api';
import type { Doctor, Especialidad, HorarioDisponible } from '@mobile/types/doctor';

/**
 * Hook para obtener todos los doctores
 */
export function useDoctors() {
  return useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: doctorsService.getAll,
  });
}

/**
 * Hook para obtener doctores por especialidad
 */
export function useDoctorsByEspecialidad(especialidad: string | null) {
  return useQuery<Doctor[]>({
    queryKey: ['doctors', 'especialidad', especialidad],
    queryFn: () => doctorsService.getByEspecialidad(especialidad!),
    enabled: !!especialidad,
  });
}

/**
 * Hook para obtener un doctor por ID
 */
export function useDoctor(id: string | undefined) {
  return useQuery<Doctor | null>({
    queryKey: ['doctor', id],
    queryFn: () => doctorsService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook para obtener todas las especialidades
 */
export function useEspecialidades() {
  return useQuery<Especialidad[]>({
    queryKey: ['especialidades'],
    queryFn: doctorsService.getEspecialidades,
  });
}

/**
 * Hook para obtener horarios disponibles de un doctor
 */
export function useHorariosDisponibles(doctorId: string | null, fecha: string | null) {
  return useQuery<HorarioDisponible>({
    queryKey: ['horarios', doctorId, fecha],
    queryFn: () => doctorsService.getHorariosDisponibles(doctorId!, fecha!),
    enabled: !!doctorId && !!fecha,
  });
}

/**
 * Hook para buscar doctores
 */
export function useSearchDoctors(query: string) {
  return useQuery<Doctor[]>({
    queryKey: ['doctors', 'search', query],
    queryFn: () => doctorsService.search(query),
    enabled: query.length > 2,
  });
}
