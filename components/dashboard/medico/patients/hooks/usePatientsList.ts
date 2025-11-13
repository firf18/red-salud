"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { startOfDay } from "date-fns";
import type { RegisteredPatient, OfflinePatient } from "../utils";

export type ViewMode = "table" | "grid";

export function usePatientsList(doctorId: string | null) {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<RegisteredPatient[]>([]);
  const [offlinePatients, setOfflinePatients] = useState<OfflinePatient[]>([]);
  const [allPatients, setAllPatients] = useState<(RegisteredPatient | OfflinePatient)[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<(RegisteredPatient | OfflinePatient)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [todayAppointments, setTodayAppointments] = useState<number>(0);

  useEffect(() => {
    if (!doctorId) return;
    loadData(doctorId);
  }, [doctorId]);

  useEffect(() => {
    const combined = [
      ...patients.map((p) => ({ ...p, type: "registered" as const })),
      ...offlinePatients.map((p) => ({ ...p, type: "offline" as const })),
    ];
    setAllPatients(combined);
  }, [patients, offlinePatients]);

  useEffect(() => {
    filterAndSortPatients();
  }, [searchQuery, filterGender, filterType, sortBy, allPatients]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      await Promise.all([loadPatients(id), loadOfflinePatients(id), loadTodayAppointments(id)]);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAppointments = async (id: string) => {
    const today = startOfDay(new Date()).toISOString();
    const { data, error } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", id)
      .gte("appointment_date", today)
      .lt("appointment_date", new Date(new Date().setDate(new Date().getDate() + 1)).toISOString())
      .in("status", ["scheduled", "confirmed"]);
    if (!error && data) setTodayAppointments(data.length);
  };

  const loadPatients = async (id: string) => {
    const { data, error } = await supabase
      .from("doctor_patients")
      .select(`*,
        patient:profiles!doctor_patients_patient_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url,
          fecha_nacimiento,
          genero,
          telefono
        )`)
      .eq("doctor_id", id)
      .eq("status", "active")
      .order("last_consultation_date", { ascending: false, nullsFirst: false });
    if (!error && data) setPatients(data as any);
  };

  const loadOfflinePatients = async (id: string) => {
    const { data, error } = await supabase
      .from("offline_patients")
      .select("*")
      .eq("doctor_id", id)
      .eq("status", "offline")
      .order("created_at", { ascending: false });
    if (!error && data) setOfflinePatients(data as any);
  };

  const filterAndSortPatients = () => {
    let filtered = allPatients.filter((p) => {
      const isRegistered = "patient" in p;
      const name = isRegistered ? p.patient.nombre_completo : (p as OfflinePatient).nombre_completo;
      const email = isRegistered ? p.patient.email : (p as OfflinePatient).email || "";
      const phone = isRegistered ? p.patient.telefono : (p as OfflinePatient).telefono;
      const cedula = !isRegistered ? (p as OfflinePatient).cedula : "";
      const gender = isRegistered ? p.patient.genero : (p as OfflinePatient).genero;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        (phone ?? "").toLowerCase().includes(q) ||
        cedula.toLowerCase().includes(q);

      const matchesGender = filterGender === "all" || gender === filterGender;
      const matchesType = filterType === "all" || (filterType === "registered" && isRegistered) || (filterType === "offline" && !isRegistered);

      return matchesSearch && matchesGender && matchesType;
    });

    if (sortBy === "recent") {
      filtered.sort((a, b) => {
        const isARegistered = "patient" in a;
        const isBRegistered = "patient" in b;
        const dateA = isARegistered && (a as RegisteredPatient).last_consultation_date
          ? new Date((a as RegisteredPatient).last_consultation_date!).getTime()
          : !isARegistered
          ? new Date((a as OfflinePatient).created_at).getTime()
          : 0;
        const dateB = isBRegistered && (b as RegisteredPatient).last_consultation_date
          ? new Date((b as RegisteredPatient).last_consultation_date!).getTime()
          : !isBRegistered
          ? new Date((b as OfflinePatient).created_at).getTime()
          : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "name") {
      filtered.sort((a, b) => {
        const nameA = "patient" in a ? (a as RegisteredPatient).patient.nombre_completo : (a as OfflinePatient).nombre_completo;
        const nameB = "patient" in b ? (b as RegisteredPatient).patient.nombre_completo : (b as OfflinePatient).nombre_completo;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "consultations") {
      filtered.sort((a, b) => {
        const consultA = "patient" in a ? (a as RegisteredPatient).total_consultations : 0;
        const consultB = "patient" in b ? (b as RegisteredPatient).total_consultations : 0;
        return consultB - consultA;
      });
    }

    setFilteredPatients(filtered);
  };

  return {
    state: {
      loading,
      patients,
      offlinePatients,
      filteredPatients,
      searchQuery,
      filterGender,
      filterType,
      sortBy,
      viewMode,
      todayAppointments,
    },
    actions: {
      setSearchQuery,
      setFilterGender,
      setFilterType,
      setSortBy,
      setViewMode,
    },
  };
}

