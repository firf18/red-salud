import { useState, useEffect } from "react";
import {
  getHealthMetricTypes,
  getPatientHealthMetrics,
  createHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getMetricStats,
  getMetricTrend,
  getPatientHealthGoals,
  createHealthGoal,
  updateHealthGoal,
  getGoalProgress,
  getPatientMeasurementReminders,
  createMeasurementReminder,
  updateMeasurementReminder,
  getHealthDashboardSummary,
} from "@/lib/supabase/services/health-metrics-service";
import type {
  HealthMetricType,
  HealthMetric,
  HealthGoal,
  MeasurementReminder,
  CreateHealthMetricData,
  CreateHealthGoalData,
  CreateMeasurementReminderData,
  MetricStats,
  HealthDashboardSummary,
  MetricTrend,
  GoalProgress,
} from "@/lib/supabase/types/health-metrics";

// Hook para tipos de métricas
export function useHealthMetricTypes() {
  const [metricTypes, setMetricTypes] = useState<HealthMetricType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetricTypes = async () => {
      const result = await getHealthMetricTypes();
      if (result.success) {
        setMetricTypes(result.data);
      }
      setLoading(false);
    };

    loadMetricTypes();
  }, []);

  return { metricTypes, loading };
}

// Hook para métricas del paciente
export function usePatientHealthMetrics(
  patientId: string | undefined,
  filters?: {
    metricTypeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadMetrics = async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientHealthMetrics(patientId, filters);
    if (result.success) {
      setMetrics(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, [patientId, filters?.metricTypeId, filters?.startDate, filters?.endDate]);

  return { metrics, loading, error, refreshMetrics: loadMetrics };
}

// Hook para crear métrica
export function useCreateHealthMetric() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const create = async (metricData: CreateHealthMetricData) => {
    setLoading(true);
    setError(null);
    const result = await createHealthMetric(metricData);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para estadísticas de métrica
export function useMetricStats(
  patientId: string | undefined,
  metricTypeId: string | undefined,
  days: number = 30
) {
  const [stats, setStats] = useState<MetricStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId || !metricTypeId) return;

    const loadStats = async () => {
      setLoading(true);
      const result = await getMetricStats(patientId, metricTypeId, days);
      if (result.success) {
        setStats(result.data);
      }
      setLoading(false);
    };

    loadStats();
  }, [patientId, metricTypeId, days]);

  return { stats, loading };
}

// Hook para tendencia de métrica
export function useMetricTrend(
  patientId: string | undefined,
  metricTypeId: string | undefined,
  days: number = 30
) {
  const [trend, setTrend] = useState<MetricTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId || !metricTypeId) return;

    const loadTrend = async () => {
      setLoading(true);
      const result = await getMetricTrend(patientId, metricTypeId, days);
      if (result.success) {
        setTrend(result.data);
      }
      setLoading(false);
    };

    loadTrend();
  }, [patientId, metricTypeId, days]);

  return { trend, loading };
}

// Hook para metas de salud
export function usePatientHealthGoals(patientId: string | undefined, status?: string) {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientHealthGoals(patientId, status);
    if (result.success) {
      setGoals(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGoals();
  }, [patientId, status]);

  return { goals, loading, refreshGoals: loadGoals };
}

// Hook para crear meta
export function useCreateHealthGoal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const create = async (goalData: CreateHealthGoalData) => {
    setLoading(true);
    setError(null);
    const result = await createHealthGoal(goalData);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para progreso de meta
export function useGoalProgress(goalId: string | undefined) {
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!goalId) return;

    const loadProgress = async () => {
      setLoading(true);
      const result = await getGoalProgress(goalId);
      if (result.success) {
        setProgress(result.data);
      }
      setLoading(false);
    };

    loadProgress();
  }, [goalId]);

  return { progress, loading };
}

// Hook para recordatorios de medición
export function usePatientMeasurementReminders(patientId: string | undefined) {
  const [reminders, setReminders] = useState<MeasurementReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReminders = async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientMeasurementReminders(patientId);
    if (result.success) {
      setReminders(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReminders();
  }, [patientId]);

  return { reminders, loading, refreshReminders: loadReminders };
}

// Hook para dashboard summary
export function useHealthDashboardSummary(patientId: string | undefined) {
  const [summary, setSummary] = useState<HealthDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getHealthDashboardSummary(patientId);
    if (result.success) {
      setSummary(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
  }, [patientId]);

  return { summary, loading, refreshSummary: loadSummary };
}
