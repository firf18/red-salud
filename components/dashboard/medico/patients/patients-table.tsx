"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, MessageSquare } from "lucide-react";
import { calculateAge, getInitials, RegisteredPatient, OfflinePatient } from "./utils";

interface PatientsTableProps {
  patients: (RegisteredPatient | OfflinePatient)[];
  onView: (p: RegisteredPatient | OfflinePatient) => void;
  onMessage: (p: RegisteredPatient) => void;
}

export function PatientsTable({ patients, onView, onMessage }: PatientsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Pacientes</CardTitle>
        <CardDescription>
          {patients.length} paciente{patients.length !== 1 ? "s" : ""} encontrado{patients.length !== 1 ? "s" : ""}
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
                <TableHead>Estado</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => {
                const isRegistered = "patient" in patient;
                const patientData = isRegistered ? (patient as RegisteredPatient).patient : (patient as OfflinePatient);
                const age = calculateAge(patientData.fecha_nacimiento);
                return (
                  <TableRow key={(patient as any).id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {isRegistered && "avatar_url" in patientData && (
                            <AvatarImage src={patientData.avatar_url || undefined} />
                          )}
                          <AvatarFallback>{getInitials(patientData.nombre_completo)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{patientData.nombre_completo}</p>
                          {!isRegistered && (
                            <p className="text-xs text-gray-500 font-mono">{(patient as OfflinePatient).cedula}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {patientData.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {patientData.telefono}
                          </div>
                        )}
                        {patientData.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            {patientData.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {age && <p className="text-sm text-gray-900">{age} años</p>}
                        {patientData.genero && (
                          <Badge variant="outline" className="text-xs">
                            {patientData.genero === "M" ? "M" : "F"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isRegistered ? (
                        <div className="space-y-1">
                          <Badge variant="default" className="text-xs">Registrado</Badge>
                          {(patient as RegisteredPatient).total_consultations > 0 && (
                            <p className="text-xs text-gray-500">
                              {(patient as RegisteredPatient).total_consultations} consulta{(patient as RegisteredPatient).total_consultations !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Sin cuenta</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isRegistered && (patient as RegisteredPatient).last_consultation_date ? (
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {new Date((patient as RegisteredPatient).last_consultation_date!).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date((patient as RegisteredPatient).last_consultation_date!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ) : !isRegistered ? (
                        <div className="text-sm">
                          <p className="text-gray-900">{new Date((patient as OfflinePatient).created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">Registrado</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin consultas</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onView(patient)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isRegistered && (
                          <Button variant="ghost" size="sm" onClick={() => onMessage(patient as RegisteredPatient)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
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
  );
}

