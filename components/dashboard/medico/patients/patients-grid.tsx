"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, MessageSquare } from "lucide-react";
import { calculateAge, getInitials, RegisteredPatient, OfflinePatient } from "./utils";

interface PatientsGridProps {
  patients: (RegisteredPatient | OfflinePatient)[];
  onView: (p: RegisteredPatient | OfflinePatient) => void;
  onMessage: (p: RegisteredPatient) => void;
}

export function PatientsGrid({ patients, onView, onMessage }: PatientsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((patient) => {
        const isRegistered = "patient" in patient;
        const pData = isRegistered ? (patient as RegisteredPatient).patient : (patient as OfflinePatient);
        const age = calculateAge(pData.fecha_nacimiento);
        return (
          <Card key={(patient as any).id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  {isRegistered && "avatar_url" in pData && (
                    <AvatarImage src={pData.avatar_url || undefined} />
                  )}
                  <AvatarFallback className="text-sm">{getInitials(pData.nombre_completo)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{pData.nombre_completo}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {isRegistered ? (
                      <Badge variant="default" className="text-xs">Registrado</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Sin cuenta</Badge>
                    )}
                    {age && <span className="text-xs text-gray-500">{age} años</span>}
                    {pData.genero && (
                      <Badge variant="outline" className="text-xs">{pData.genero === "M" ? "M" : "F"}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {!isRegistered && (patient as OfflinePatient).cedula && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-mono text-xs">{(patient as OfflinePatient).cedula}</span>
                  </div>
                )}
                {pData.telefono && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{pData.telefono}</span>
                  </div>
                )}
                {pData.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{pData.email}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(patient)}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                {isRegistered && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onMessage(patient as RegisteredPatient)}>
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Mensaje
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

