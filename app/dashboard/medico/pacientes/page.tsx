"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  User,
  Calendar,
  FileText,
  Phone,
  Mail,
  MoreVertical,
  Eye,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Patient {
  id: string;
  patient_id: string;
  first_consultation_date: string | null;
  last_consultation_date: string | null;
  total_consultations: number;
  status: string;
  patient: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    telefono: string | null;
  };
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, patients]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      setUserId(user.id);

      await loadPatients(user.id);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("doctor_patients")
      .select(`
        *,
        patient:profiles!doctor_patients_patient_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url,
          fecha_nacimiento,
          genero,
          telefono
        )
      `)
      .eq("doctor_id", doctorId)
      .eq("status", "active")
      .order("last_consultation_date", { ascending: false, nullsFirst: false });

    if (!error && data) {
      setPatients(data as any);
      setFilteredPatients(data as any);
    }
  };

  const filterPatients = () => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter((p) =>
      p.patient.nombre_completo.toLowerCase().includes(query) ||
      p.patient.email.toLowerCase().includes(query) ||
      p.patient.telefono?.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Pacientes</h1>
          <p className="text-gray-600 mt-1">
            {patients.length} paciente{patients.length !== 1 ? "s" : ""} activo{patients.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      {filteredPatients.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              Gestiona y consulta la información de tus pacientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Edad/Género</TableHead>
                    <TableHead>Consultas</TableHead>
                    <TableHead>Última Consulta</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const age = calculateAge(patient.patient.fecha_nacimiento);
                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={patient.patient.avatar_url || undefined} />
                              <AvatarFallback>
                                {getInitials(patient.patient.nombre_completo)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {patient.patient.nombre_completo}
                              </p>
                              <p className="text-sm text-gray-500">
                                {patient.patient.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {patient.patient.telefono && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                {patient.patient.telefono}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              {patient.patient.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {age && (
                              <p className="text-sm text-gray-900">{age} años</p>
                            )}
                            {patient.patient.genero && (
                              <Badge variant="outline" className="text-xs">
                                {patient.patient.genero === "M" ? "Masculino" : "Femenino"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {patient.total_consultations} consulta{patient.total_consultations !== 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {patient.last_consultation_date ? (
                            <div className="text-sm">
                              <p className="text-gray-900">
                                {format(new Date(patient.last_consultation_date), "dd/MM/yyyy")}
                              </p>
                              <p className="text-gray-500">
                                {format(new Date(patient.last_consultation_date), "HH:mm")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Sin consultas</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/medico/pacientes/${patient.patient_id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/medico/mensajeria?patient=${patient.patient_id}`)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Mensaje
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No se encontraron pacientes" : "Aún no tienes pacientes"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Intenta con otro término de búsqueda"
                  : "Los pacientes aparecerán aquí cuando agenden su primera consulta contigo"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
