"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ProfileData {
  nombre_completo: string;
  email: string;
  telefono: string;
  especialidad: string;
  cedula_profesional: string;
  biografia: string;
  avatar_url: string | null;
  especialidades_adicionales: string[];
}

export function ProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    nombre_completo: "",
    email: "",
    telefono: "",
    especialidad: "",
    cedula_profesional: "",
    biografia: "",
    avatar_url: null,
    especialidades_adicionales: [],
  });
  const [newEspecialidad, setNewEspecialidad] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          nombre_completo: data.nombre_completo || "",
          email: user.email || "",
          telefono: data.telefono || "",
          especialidad: data.especialidad || "",
          cedula_profesional: data.cedula_profesional || "",
          biografia: data.biografia || "",
          avatar_url: data.avatar_url || null,
          especialidades_adicionales: data.especialidades_adicionales || [],
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      alert("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          nombre_completo: profile.nombre_completo,
          telefono: profile.telefono,
          especialidad: profile.especialidad,
          cedula_profesional: profile.cedula_profesional,
          biografia: profile.biografia,
          especialidades_adicionales: profile.especialidades_adicionales,
        })
        .eq("id", user.id);

      if (error) throw error;

      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const addEspecialidad = () => {
    if (newEspecialidad.trim() && !profile.especialidades_adicionales.includes(newEspecialidad.trim())) {
      setProfile({
        ...profile,
        especialidades_adicionales: [...profile.especialidades_adicionales, newEspecialidad.trim()],
      });
      setNewEspecialidad("");
    }
  };

  const removeEspecialidad = (especialidad: string) => {
    setProfile({
      ...profile,
      especialidades_adicionales: profile.especialidades_adicionales.filter(e => e !== especialidad),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.nombre_completo.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profile.nombre_completo}</h3>
          <p className="text-gray-600">{profile.especialidad}</p>
          <p className="text-sm text-gray-500 mt-1">Cédula: {profile.cedula_profesional}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <Input
            id="nombre"
            value={profile.nombre_completo}
            onChange={(e) => setProfile({ ...profile, nombre_completo: e.target.value })}
            placeholder="Dr. Juan Pérez"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={profile.telefono}
            onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
            placeholder="+52 123 456 7890"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cedula">Cédula Profesional</Label>
          <Input
            id="cedula"
            value={profile.cedula_profesional}
            onChange={(e) => setProfile({ ...profile, cedula_profesional: e.target.value })}
            placeholder="1234567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="especialidad">Especialidad Principal</Label>
          <Input
            id="especialidad"
            value={profile.especialidad}
            onChange={(e) => setProfile({ ...profile, especialidad: e.target.value })}
            placeholder="Cardiología"
          />
        </div>
      </div>

      {/* Especialidades Adicionales */}
      <div className="space-y-3">
        <Label>Especialidades Adicionales</Label>
        <div className="flex gap-2">
          <Input
            value={newEspecialidad}
            onChange={(e) => setNewEspecialidad(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addEspecialidad()}
            placeholder="Agregar especialidad"
          />
          <Button onClick={addEspecialidad} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.especialidades_adicionales.map((esp) => (
            <Badge key={esp} variant="secondary" className="px-3 py-1">
              {esp}
              <button
                onClick={() => removeEspecialidad(esp)}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Biografía */}
      <div className="space-y-2">
        <Label htmlFor="biografia">Biografía Profesional</Label>
        <Textarea
          id="biografia"
          value={profile.biografia}
          onChange={(e) => setProfile({ ...profile, biografia: e.target.value })}
          placeholder="Cuéntanos sobre tu experiencia y formación profesional..."
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Esta información será visible para tus pacientes
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
