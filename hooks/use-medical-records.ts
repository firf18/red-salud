import { useState, useEffect } from "react";
import {
  getPatientMedicalRecords,
  getMedicalRecord,
  getMedicalHistorySummary,
  searchMedicalRecords,
  getMedicalRecordByAppointment,
} from "@/lib/supabase/services/medical-records-service";
import type {
  MedicalRecord,
  MedicalRecordFilters,
  MedicalHistorySummary,
} from "@/lib/supabase/types/medical-records";

// Hook para obtener historial médico del paciente
export function usePatientMedicalRecords(
  patientId: string | undefined,
  filters?: MedicalRecordFilters
) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadRecords = async () => {
      setLoading(true);
      const result = await getPatientMedicalRecords(patientId, filters);
      if (result.success) {
        setRecords(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadRecords();
  }, [patientId, filters?.startDate, filters?.endDate, filters?.medicoId]);

  const refreshRecords = async () => {
    if (!patientId) return;
    const result = await getPatientMedicalRecords(patientId, filters);
    if (result.success) {
      setRecords(result.data);
    }
  };

  return { records, loading, error, refreshRecords };
}

// Hook para obtener un registro médico específico
export function useMedicalRecord(recordId: string | undefined) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!recordId) return;

    const loadRecord = async () => {
      setLoading(true);
      const result = await getMedicalRecord(recordId);
      if (result.success) {
        setRecord(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadRecord();
  }, [recordId]);

  return { record, loading, error };
}

// Hook para obtener resumen del historial médico
export function useMedicalHistorySummary(patientId: string | undefined) {
  const [summary, setSummary] = useState<MedicalHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadSummary = async () => {
      setLoading(true);
      const result = await getMedicalHistorySummary(patientId);
      if (result.success) {
        setSummary(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadSummary();
  }, [patientId]);

  const refreshSummary = async () => {
    if (!patientId) return;
    const result = await getMedicalHistorySummary(patientId);
    if (result.success) {
      setSummary(result.data);
    }
  };

  return { summary, loading, error, refreshSummary };
}

// Hook para buscar en el historial médico
export function useSearchMedicalRecords(patientId: string | undefined) {
  const [results, setResults] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const search = async (searchTerm: string) => {
    if (!patientId || !searchTerm) {
      setResults([]);
      return;
    }

    setLoading(true);
    const result = await searchMedicalRecords(patientId, searchTerm);
    if (result.success) {
      setResults(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clearSearch };
}

// Hook para obtener registro médico de una cita
export function useMedicalRecordByAppointment(appointmentId: string | undefined) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const loadRecord = async () => {
      setLoading(true);
      const result = await getMedicalRecordByAppointment(appointmentId);
      if (result.success) {
        setRecord(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadRecord();
  }, [appointmentId]);

  return { record, loading, error };
}
