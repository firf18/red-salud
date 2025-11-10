"use client";

import { motion } from "framer-motion";
import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DoctorProfileData } from "../../types";

interface MedicalTabDoctorProps {
  formData: DoctorProfileData;
  setFormData: (data: DoctorProfileData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSave: () => Promise<{ success: boolean; error?: string }>;
}

export function MedicalTabDoctor({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: MedicalTabDoctorProps) {
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
          Información Médica Profesional
        </h2>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pen className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div>
          <Label htmlFor="bio">Biografía Profesional</Label>
          {isEditing ? (
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio || ""}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Describe tu experiencia, áreas de interés y enfoque profesional..."
            />
          ) : (
            <p className="text-base text-gray-900 mt-2 whitespace-pre-wrap">
              {formData.bio || "No especificado"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="subespecialidades">Subespecialidades</Label>
          {isEditing ? (
            <Textarea
              id="subespecialidades"
              rows={3}
              value={formData.subespecialidades || ""}
              onChange={(e) =>
                setFormData({ ...formData, subespecialidades: e.target.value })
              }
              placeholder="Ej: Cardiología Intervencionista, Ecocardiografía..."
            />
          ) : (
            <p className="text-base text-gray-900 mt-2">
              {formData.subespecialidades || "No especificado"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="certificaciones">Certificaciones y Diplomados</Label>
          {isEditing ? (
            <Textarea
              id="certificaciones"
              rows={3}
              value={formData.certificaciones || ""}
              onChange={(e) =>
                setFormData({ ...formData, certificaciones: e.target.value })
              }
              placeholder="Lista tus certificaciones, diplomados y cursos relevantes..."
            />
          ) : (
            <p className="text-base text-gray-900 mt-2 whitespace-pre-wrap">
              {formData.certificaciones || "No especificado"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="idiomas">Idiomas</Label>
          {isEditing ? (
            <Textarea
              id="idiomas"
              rows={2}
              value={formData.idiomas || ""}
              onChange={(e) =>
                setFormData({ ...formData, idiomas: e.target.value })
              }
              placeholder="Ej: Español (nativo), Inglés (avanzado)..."
            />
          ) : (
            <p className="text-base text-gray-900 mt-2">
              {formData.idiomas || "No especificado"}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-3 justify-end pt-4 border-t">
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
