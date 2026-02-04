/**
 * Servicio de Recetas Médicas
 * Gestiona todas las operaciones CRUD de recetas digitales
 */

import { supabase } from '@/lib/supabase';

export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  patient?: {
    name: string;
    id_number: string;
    phone?: string;
  };
  doctor_name: string;
  doctor_license: string;
  issue_date: string;
  expiry_date: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  notes?: string;
  items: PrescriptionItem[];
  created_at: string;
  updated_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  product_id: string;
  product?: {
    name: string;
    presentation: string;
    price_usd: number;
  };
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  dispensed_quantity: number;
}

export interface PrescriptionFilters {
  status?: string;
  search?: string;
}

export interface PrescriptionStats {
  pending: number;
  dispensed: number;
  cancelled: number;
  total: number;
}

export const prescriptionsService = {
  /**
   * Obtener todas las recetas con filtros opcionales
   */
  async getAll(filters?: PrescriptionFilters): Promise<Prescription[]> {
    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(name, id_number, phone),
        items:prescription_items(
          *,
          product:products(name, presentation, price_usd)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`
        prescription_number.ilike.%${filters.search}%,
        doctor_name.ilike.%${filters.search}%
      `);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Prescription[];
  },

  /**
   * Obtener una receta por ID con todos sus detalles
   */
  async getById(id: string): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(name, id_number, phone),
        items:prescription_items(
          *,
          product:products(name, presentation, price_usd)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Prescription;
  },

  /**
   * Crear nueva receta con sus items
   */
  async create(prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>): Promise<Prescription> {
    // Generar número de receta único
    const prescriptionNumber = `RX-${Date.now()}`;

    // Insertar receta
    const { data: prescriptionData, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        prescription_number: prescriptionNumber,
        patient_id: prescription.patient_id,
        doctor_name: prescription.doctor_name,
        doctor_license: prescription.doctor_license,
        issue_date: prescription.issue_date,
        expiry_date: prescription.expiry_date,
        notes: prescription.notes,
        status: 'pending',
      })
      .select()
      .single();

    if (prescriptionError) throw prescriptionError;

    // Insertar items de la receta
    if (prescription.items && prescription.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(
          prescription.items.map(item => ({
            prescription_id: prescriptionData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
          }))
        );

      if (itemsError) throw itemsError;
    }

    // Retornar receta completa
    return await this.getById(prescriptionData.id);
  },

  /**
   * Dispensar receta (procesar venta y actualizar cantidades)
   */
  async dispense(
    prescriptionId: string,
    items: Array<{ id: string; dispensed_quantity: number }>
  ): Promise<Prescription> {
    // Actualizar cantidades dispensadas de cada item
    for (const item of items) {
      const { error } = await supabase
        .from('prescription_items')
        .update({ dispensed_quantity: item.dispensed_quantity })
        .eq('id', item.id);

      if (error) throw error;
    }

    // Actualizar estado de receta a dispensada
    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status: 'dispensed' })
      .eq('id', prescriptionId)
      .select()
      .single();

    if (error) throw error;

    // Retornar receta actualizada
    return await this.getById(prescriptionId);
  },

  /**
   * Cancelar receta con motivo
   */
  async cancel(id: string, reason: string): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .update({
        status: 'cancelled',
        notes: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return await this.getById(id);
  },

  /**
   * Obtener estadísticas de recetas
   */
  async getStats(): Promise<PrescriptionStats> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('status');

    if (error) throw error;

    const stats: PrescriptionStats = {
      pending: data.filter(p => p.status === 'pending').length,
      dispensed: data.filter(p => p.status === 'dispensed').length,
      cancelled: data.filter(p => p.status === 'cancelled').length,
      total: data.length,
    };

    return stats;
  },

  /**
   * Validar si una receta está vigente
   */
  isValid(prescription: Prescription): boolean {
    const today = new Date();
    const expiryDate = new Date(prescription.expiry_date);
    return expiryDate >= today && prescription.status === 'pending';
  },

  /**
   * Verificar si una receta está próxima a vencer (menos de 7 días)
   */
  isExpiringSoon(prescription: Prescription): boolean {
    const today = new Date();
    const expiryDate = new Date(prescription.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  },
};
