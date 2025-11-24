"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, UserPlus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import "../_styles/responsive.css";

type FormData = {
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
};

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  edad: number | null;
  cedulaFound: boolean;
  validatingCedula: boolean;
  alergias: string[];
  setAlergias: (a: string[]) => void;
  notasMedicas: string;
  setNotasMedicas: (s: string) => void;
  observaciones: string;
  setObservaciones: (s: string) => void;
  emailError?: string | null;
  telefonoError?: string | null;
  ageError?: string | null;
  dateMin?: string;
  dateMax?: string;
  enforcePhonePrefix?: (v: string) => void;
};

export function PatientPrimaryInfo({ formData, setFormData, edad, cedulaFound, validatingCedula, alergias, setAlergias, notasMedicas, setNotasMedicas, observaciones, setObservaciones, emailError, telefonoError, ageError, dateMin, dateMax, enforcePhonePrefix }: Props) {
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1300px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Datos del Paciente</h2>
            <p className="text-sm text-gray-500">Identificación y datos personales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2 min-w-[280px] flex-1">
            <Label htmlFor="cedula" className="text-sm font-medium text-gray-700">
              Cédula <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="cedula"
                type="text"
                placeholder="Ej: 12345678"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
                className="pr-10 h-11"
              />
              {validatingCedula && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Calendar className="h-4 w-4 animate-pulse text-blue-600" />
                </div>
              )}
              {!validatingCedula && cedulaFound && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            {cedulaFound && !validatingCedula && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verificado en CNE
              </p>
            )}
          </div>

          <div className="space-y-2 min-w-[280px] flex-1">
            <Label htmlFor="nombre_completo" className="text-sm font-medium text-gray-700">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre_completo"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              required
              disabled={validatingCedula}
              className={`h-11 ${cedulaFound ? "bg-green-50 border-green-300" : ""}`}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Género</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formData.genero === "M" ? "default" : "outline"}
                className="justify-start h-10 lg:h-10 lg:w-[180px]"
                onClick={() => setFormData({ ...formData, genero: "M" })}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full border-2 ${formData.genero === "M" ? "border-white bg-white" : "border-gray-400"}`}></div>
                  Masculino
                </div>
              </Button>
              <Button
                type="button"
                variant={formData.genero === "F" ? "default" : "outline"}
                className="justify-start h-10 lg:h-10 lg:w-[180px]"
                onClick={() => setFormData({ ...formData, genero: "F" })}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full border-2 ${formData.genero === "F" ? "border-white bg-white" : "border-gray-400"}`}></div>
                  Femenino
                </div>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
              Teléfono
            </Label>
            <Input
              id="telefono"
              type="tel"
              inputMode="tel"
              placeholder="+58 412 1234567"
              value={formData.telefono}
              onChange={(e) => enforcePhonePrefix ? enforcePhonePrefix(e.target.value) : setFormData({ ...formData, telefono: e.target.value })}
              className="h-11 lg:h-10"
              aria-invalid={!!telefonoError}
              maxLength={16}
              aria-describedby="telefono-error"
            />
            {telefonoError && <p id="telefono-error" className="text-xs text-red-600">{telefonoError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento" className="text-sm font-medium text-gray-700">
              Fecha de Nacimiento
            </Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              className="h-11 lg:h-10"
              min={dateMin}
              max={dateMax}
            />
            {ageError && <p className="text-xs text-red-600">{ageError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad" className="text-sm font-medium text-gray-700">
              Edad
            </Label>
            <div className="relative">
              <Input
                id="edad"
                type="text"
                value={edad !== null ? `${edad} años` : ""}
                disabled
                placeholder="Se calcula automáticamente"
                className="h-11 bg-gray-50"
              />
              {edad !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs">
                    {edad} años
                  </Badge>
                </div>
              )}
            </div>
          </div>


          <div className="space-y-2 min-w-[280px] flex-1 lg:w-[300px]">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="paciente@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 lg:h-10"
              aria-invalid={!!emailError}
            />
            {emailError && <p className="text-xs text-red-600">{emailError}</p>}
          </div>
        </div>

          <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <span className="text-sm text-gray-500">Información adicional</span>
          </div>
          <div className={`ux-switch ${isNarrow ? "ux-table-active" : "ux-grid-active"}`}>
            <div className="ux-grid">
              <div className="space-y-2 min-w-[280px] flex-1">
                <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">Dirección</Label>
                <Textarea
                  id="direccion"
                  placeholder="Calle, ciudad, estado"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="min-h-[96px] lg:min-h-[100px]"
                />
              </div>
              <div className="space-y-2 min-w-[280px] flex-1">
                <Label htmlFor="alergias" className="text-sm font-medium text-gray-700">Alergias</Label>
                <Input
                  id="alergias"
                  type="text"
                  placeholder="Ej: Penicilina, Polvo"
                  value={alergias.join(", ")}
                  onChange={(e) => setAlergias(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  className="h-11 lg:h-[60px]"
                />
              </div>
              <div className="space-y-2 min-w-[280px] flex-1 lg:w-[300px]">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="paciente@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 lg:h-10"
                  aria-invalid={!!emailError}
                />
                {emailError && <p className="text-xs text-red-600">{emailError}</p>}
              </div>
            </div>
            <div className="ux-table">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="paciente@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11"
                  aria-invalid={!!emailError}
                />
                {emailError && <p className="text-xs text-red-600">{emailError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">Dirección</Label>
                <Textarea
                  id="direccion"
                  placeholder="Calle, ciudad, estado"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="min-h-[96px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alergias" className="text-sm font-medium text-gray-700">Alergias</Label>
                <Input
                  id="alergias"
                  type="text"
                  placeholder="Ej: Penicilina, Polvo"
                  value={alergias.join(", ")}
                  onChange={(e) => setAlergias(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  className="h-11"
                />
              </div>
            </div>
          </div>
          <div className={`ux-switch ${isNarrow ? "ux-table-active" : "ux-grid-active"}`}>
            <div className="ux-grid">
              <div className="space-y-2 min-w-[280px] flex-1">
                <Label htmlFor="historial" className="text-sm font-medium text-gray-700">Historial médico breve</Label>
                <Textarea
                  id="historial"
                  placeholder="Antecedentes relevantes"
                  value={notasMedicas}
                  onChange={(e) => setNotasMedicas(e.target.value)}
                  className="min-h-[96px]"
                />
              </div>
              <div className="space-y-2 min-w-[280px] flex-1">
                <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">Observaciones adicionales</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas complementarias"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="min-h-[96px]"
                />
              </div>
            </div>
            <div className="ux-table">
              <div className="space-y-2">
                <Label htmlFor="historial" className="text-sm font-medium text-gray-700">Historial médico breve</Label>
                <Textarea
                  id="historial"
                  placeholder="Antecedentes relevantes"
                  value={notasMedicas}
                  onChange={(e) => setNotasMedicas(e.target.value)}
                  className="min-h-[96px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">Observaciones adicionales</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas complementarias"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="min-h-[96px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}