/**
 * Tipos relacionados con doctores
 */

export interface Doctor {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  foto_url?: string;
  cedula_profesional: string;
  telefono?: string;
  email?: string;
  ubicacion?: string;
  calificacion?: number;
  anos_experiencia?: number;
  disponible?: boolean;
}

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
}

export interface HorarioDisponible {
  fecha: string;
  horas: string[];
}
