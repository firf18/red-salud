"use client";

import { motion } from "framer-motion";
import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { DoctorProfileData } from "../../types";

interface ProfileTabDoctorProps {
  formData: DoctorProfileData;
  setFormData: (data: DoctorProfileData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSave: () => Promise<{ success: boolean; error?: string }>;
}

export function ProfileTabDoctor({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: ProfileTabDoctorProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Información Profesional
        </h2>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pen className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <fieldset className="space-y-5">
          <legend className="sr-only">Información básica</legend>

          <div>
            <Label htmlFor="nombre">Nombre Completo *</Label>
            {isEditing ? (
              <Input
                id="nombre"
                value={formData.nombre_completo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_completo: e.target.value })
                }
                required
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.nombre_completo || "No especificado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.email || "No especificado"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Modifica tu email en la sección de Seguridad
            </p>
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono *</Label>
            {isEditing ? (
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.telefono || "No especificado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cedula">Cédula de Identidad *</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.cedula || "No especificado"}
            </p>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="sr-only">Información profesional</legend>

          <div>
            <Label htmlFor="mpps">Número MPPS *</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.mpps || "No especificado"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Verificado por SACS
            </p>
          </div>

          <div>
            <Label htmlFor="especialidad">Especialidad *</Label>
            {isEditing ? (
              <Input
                id="especialidad"
                value={formData.especialidad || ""}
                onChange={(e) =>
                  setFormData({ ...formData, especialidad: e.target.value })
                }
                required
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.especialidad || "No especificado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="universidad">Universidad</Label>
            {isEditing ? (
              <Input
                id="universidad"
                value={formData.universidad || ""}
                onChange={(e) =>
                  setFormData({ ...formData, universidad: e.target.value })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.universidad || "No especificado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="anos_experiencia">Años de Experiencia</Label>
            {isEditing ? (
              <Input
                id="anos_experiencia"
                type="number"
                min="0"
                value={formData.anos_experiencia || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    anos_experiencia: parseInt(e.target.value) || 0,
                  })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.anos_experiencia || "0"} años
              </p>
            )}
          </div>
        </fieldset>

        {isEditing && (
          <div className="col-span-2 flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        )}
      </form>
    </motion.article>
  );
}
