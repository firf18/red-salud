"use client";

import { motion } from "framer-motion";
import { Edit2, Save, X, Loader2, Activity, Heart, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIPOS_SANGRE } from "../constants";
import type { TabComponentProps } from "../types";
import { useState, useEffect } from "react";
import { MedicalChipInput } from "../components/medical-chip-input";
import { MedicationInputImproved as MedicationInput, type Medication } from "../components/medication-input-improved";
import {
  ALERGIAS_MEDICAMENTOS,
  ALERGIAS_ALIMENTARIAS,
  OTRAS_ALERGIAS,
  CONDICIONES_CRONICAS,
} from "../constants/medical-suggestions";

const OPCIONES_FUMA = [
  { value: "no", label: "No fumo" },
  { value: "si", label: "Sí, fumo actualmente" },
  { value: "ex-fumador", label: "Ex-fumador" },
];

const OPCIONES_ALCOHOL = [
  { value: "no", label: "No consumo" },
  { value: "ocasional", label: "Ocasional" },
  { value: "regular", label: "Regular" },
  { value: "frecuente", label: "Frecuente" },
];

const OPCIONES_ACTIVIDAD = [
  { value: "sedentario", label: "Sedentario" },
  { value: "ligera", label: "Ligera" },
  { value: "moderada", label: "Moderada" },
  { value: "intensa", label: "Intensa" },
];

export function MedicalTabImproved({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: TabComponentProps) {
  const [localData, setLocalData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);
  const [imc, setImc] = useState<number | null>(null);
  const [imcCategoria, setImcCategoria] = useState<string>("");

  // Estados para los nuevos campos estructurados
  const [alergiasMedicamentos, setAlergiasMedicamentos] = useState<string[]>([]);
  const [alergiasAlimentarias, setAlergiasAlimentarias] = useState<string[]>([]);
  const [otrasAlergias, setOtrasAlergias] = useState<string[]>([]);
  const [condicionesCronicas, setCondicionesCronicas] = useState<string[]>([]);
  const [medicamentosActuales, setMedicamentosActuales] = useState<Medication[]>([]);

  useEffect(() => {
    setLocalData(formData);
    
    // Parsear datos existentes
    if (formData.alergias) {
      setAlergiasMedicamentos(
        formData.alergias.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    if (formData.alergiasAlimentarias) {
      setAlergiasAlimentarias(
        formData.alergiasAlimentarias.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    if (formData.otrasAlergias) {
      setOtrasAlergias(
        formData.otrasAlergias.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    if (formData.condicionesCronicas) {
      setCondicionesCronicas(
        formData.condicionesCronicas.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    
    // Parsear medicamentos (intentar JSON, si falla usar texto plano)
    if (formData.medicamentosActuales) {
      try {
        const parsed = JSON.parse(formData.medicamentosActuales);
        if (Array.isArray(parsed)) {
          setMedicamentosActuales(parsed);
        }
      } catch {
        // Si no es JSON, dejar vacío para que el usuario lo estructure
        setMedicamentosActuales([]);
      }
    }
  }, [formData]);

  // Calcular IMC
  useEffect(() => {
    if (localData.peso && localData.altura) {
      const pesoNum = parseFloat(localData.peso);
      const alturaNum = parseFloat(localData.altura) / 100;
      
      if (pesoNum > 0 && alturaNum > 0) {
        const imcCalculado = pesoNum / (alturaNum * alturaNum);
        setImc(imcCalculado);
        
        if (imcCalculado < 18.5) setImcCategoria("Bajo peso");
        else if (imcCalculado < 25) setImcCategoria("Normal");
        else if (imcCalculado < 30) setImcCategoria("Sobrepeso");
        else setImcCategoria("Obesidad");
      }
    } else {
      setImc(null);
      setImcCategoria("");
    }
  }, [localData.peso, localData.altura]);

  const handleLocalSave = async () => {
    setIsSaving(true);
    try {
      // Preparar datos para guardar
      const dataToSave = {
        ...localData,
        alergias: alergiasMedicamentos.join(", "),
        alergiasAlimentarias: alergiasAlimentarias.join(", "),
        otrasAlergias: otrasAlergias.join(", "),
        condicionesCronicas: condicionesCronicas.join(", "),
        medicamentosActuales: JSON.stringify(medicamentosActuales),
      };

      const result = await handleSave(dataToSave);
      if (result.success) {
        setFormData(dataToSave);
      } else {
        throw new Error(result.error || "Error al guardar");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(formData);
    setIsEditing(false);
  };

  const esMujer = localData.sexoBiologico === "femenino";

  return (
    <motion.article
      key="medical"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Información Médica
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Información confidencial visible solo para profesionales autorizados
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleLocalSave} size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        )}
      </header>

      <form className="grid grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <fieldset className="space-y-5">
          <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Datos Vitales y Físicos
          </legend>

          {/* Sexo Biológico - Solo Masculino/Femenino */}
          <div>
            <Label htmlFor="sexoBiologico">Sexo Biológico *</Label>
            {isEditing ? (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setLocalData({ ...localData, sexoBiologico: "masculino" })
                  }
                  className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                    localData.sexoBiologico === "masculino"
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLocalData({ ...localData, sexoBiologico: "femenino" })
                  }
                  className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                    localData.sexoBiologico === "femenino"
                      ? "border-pink-600 bg-pink-50 text-pink-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  Femenino
                </button>
              </div>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {localData.sexoBiologico
                  ? localData.sexoBiologico.charAt(0).toUpperCase() +
                    localData.sexoBiologico.slice(1)
                  : "No registrado"}
              </p>
            )}
          </div>

          {/* Tipo de Sangre - Diseño minimalista con botones */}
          <div>
            <Label className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-red-600" />
              Tipo de Sangre *
            </Label>
            {isEditing ? (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {TIPOS_SANGRE.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() =>
                      setLocalData({ ...localData, tipoSangre: tipo })
                    }
                    className={`px-2 py-1.5 rounded-md border-2 font-semibold text-sm transition-all ${
                      localData.tipoSangre === tipo
                        ? "border-red-600 bg-red-50 text-red-900"
                        : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.tipoSangre || "No registrado"}
              </p>
            )}
          </div>

          {/* Donante de Sangre */}
          <div>
            <Label htmlFor="donanteSangre">¿Donante de Sangre?</Label>
            {isEditing ? (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setLocalData({ ...localData, donanteSangre: "si" })
                  }
                  className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                    localData.donanteSangre === "si"
                      ? "border-green-600 bg-green-50 text-green-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLocalData({ ...localData, donanteSangre: "no" })
                  }
                  className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                    localData.donanteSangre === "no"
                      ? "border-gray-600 bg-gray-50 text-gray-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  No
                </button>
              </div>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {localData.donanteSangre === "si"
                  ? "Sí"
                  : localData.donanteSangre === "no"
                  ? "No"
                  : "No especificado"}
              </p>
            )}
          </div>

          {/* Peso y Altura */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="peso">Peso (kg) *</Label>
              {isEditing ? (
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={localData.peso || ""}
                  onChange={(e) =>
                    setLocalData({ ...localData, peso: e.target.value })
                  }
                  required
                />
              ) : (
                <p className="text-base font-medium text-gray-900 mt-1">
                  {formData.peso ? `${formData.peso} kg` : "No registrado"}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="altura">Altura (cm) *</Label>
              {isEditing ? (
                <Input
                  id="altura"
                  type="number"
                  placeholder="170"
                  value={localData.altura || ""}
                  onChange={(e) =>
                    setLocalData({ ...localData, altura: e.target.value })
                  }
                  required
                />
              ) : (
                <p className="text-base font-medium text-gray-900 mt-1">
                  {formData.altura ? `${formData.altura} cm` : "No registrado"}
                </p>
              )}
            </div>
          </div>

          {/* IMC */}
          {imc && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-700 font-medium">IMC</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {imc.toFixed(1)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    imcCategoria === "Normal"
                      ? "bg-green-100 text-green-800"
                      : imcCategoria === "Bajo peso"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {imcCategoria}
                </span>
              </div>
            </div>
          )}

          {/* Presión Arterial */}
          <div>
            <Label>Presión Arterial (mmHg)</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="120"
                    value={localData.presionSistolica || ""}
                    onChange={(e) =>
                      setLocalData({
                        ...localData,
                        presionSistolica: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">
                    {formData.presionSistolica || "--"}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Sistólica</p>
              </div>
              <div>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="80"
                    value={localData.presionDiastolica || ""}
                    onChange={(e) =>
                      setLocalData({
                        ...localData,
                        presionDiastolica: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">
                    {formData.presionDiastolica || "--"}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Diastólica</p>
              </div>
            </div>
          </div>

          {/* Hábitos */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-orange-900 text-sm">
              Hábitos de Vida
            </h4>

            <div>
              <Label htmlFor="fuma" className="text-xs">Tabaquismo</Label>
              {isEditing ? (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {OPCIONES_FUMA.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setLocalData({ ...localData, fuma: opt.value })
                      }
                      className={`px-2 py-1.5 rounded-md border-2 transition-all text-xs font-medium ${
                        localData.fuma === opt.value
                          ? "border-orange-600 bg-orange-100 text-orange-900"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {OPCIONES_FUMA.find((o) => o.value === formData.fuma)
                    ?.label || "No registrado"}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="consumeAlcohol" className="text-xs">Alcohol</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {OPCIONES_ALCOHOL.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setLocalData({
                          ...localData,
                          consumeAlcohol: opt.value,
                        })
                      }
                      className={`px-2 py-1.5 rounded-md border-2 transition-all text-xs font-medium ${
                        localData.consumeAlcohol === opt.value
                          ? "border-orange-600 bg-orange-100 text-orange-900"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {OPCIONES_ALCOHOL.find((o) => o.value === formData.consumeAlcohol)
                    ?.label || "No registrado"}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="actividadFisica" className="text-xs">Actividad Física</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {OPCIONES_ACTIVIDAD.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setLocalData({
                          ...localData,
                          actividadFisica: opt.value,
                        })
                      }
                      className={`px-2 py-1.5 rounded-md border-2 transition-all text-xs font-medium ${
                        localData.actividadFisica === opt.value
                          ? "border-orange-600 bg-orange-100 text-orange-900"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {OPCIONES_ACTIVIDAD.find(
                    (o) => o.value === formData.actividadFisica
                  )?.label || "No registrado"}
                </p>
              )}
            </div>
          </div>

          {/* Donante de Órganos */}
          <div>
            <Label htmlFor="donanteOrganos">¿Donante de Órganos?</Label>
            {isEditing ? (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setLocalData({ ...localData, donanteOrganos: "si" })
                  }
                  className={`px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                    localData.donanteOrganos === "si"
                      ? "border-green-600 bg-green-50 text-green-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLocalData({ ...localData, donanteOrganos: "no" })
                  }
                  className={`px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                    localData.donanteOrganos === "no"
                      ? "border-gray-600 bg-gray-50 text-gray-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLocalData({ ...localData, donanteOrganos: "no_especificado" })
                  }
                  className={`px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                    localData.donanteOrganos === "no_especificado"
                      ? "border-gray-600 bg-gray-50 text-gray-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  No especificar
                </button>
              </div>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {localData.donanteOrganos === "si"
                  ? "Sí"
                  : localData.donanteOrganos === "no"
                  ? "No"
                  : "No especificado"}
              </p>
            )}
          </div>

          {/* Campos específicos para mujeres */}
          {esMujer && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-pink-900 text-sm">
                Información Específica
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="embarazada" className="text-xs">¿Embarazada?</Label>
                  {isEditing ? (
                    <select
                      id="embarazada"
                      value={localData.embarazada ? "si" : "no"}
                      onChange={(e) =>
                        setLocalData({
                          ...localData,
                          embarazada: e.target.value === "si",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formData.embarazada ? "Sí" : "No"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lactancia" className="text-xs">¿Lactancia?</Label>
                  {isEditing ? (
                    <select
                      id="lactancia"
                      value={localData.lactancia ? "si" : "no"}
                      onChange={(e) =>
                        setLocalData({
                          ...localData,
                          lactancia: e.target.value === "si",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formData.lactancia ? "Sí" : "No"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </fieldset>

        {/* Columna Derecha */}
        <fieldset className="space-y-5">
          <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Información Clínica
          </legend>

          {/* Alergias a Medicamentos */}
          <div>
            <Label>Alergias a Medicamentos</Label>
            <p className="text-xs text-gray-500 mb-2">
              Selecciona o escribe medicamentos a los que eres alérgico
            </p>
            <MedicalChipInput
              value={alergiasMedicamentos}
              onChange={setAlergiasMedicamentos}
              suggestions={ALERGIAS_MEDICAMENTOS}
              placeholder="Ej: Penicilina"
              disabled={!isEditing}
              template="Nombre del medicamento"
            />
          </div>

          {/* Alergias Alimentarias */}
          <div>
            <Label>Alergias Alimentarias</Label>
            <p className="text-xs text-gray-500 mb-2">
              Alimentos que te causan reacciones alérgicas
            </p>
            <MedicalChipInput
              value={alergiasAlimentarias}
              onChange={setAlergiasAlimentarias}
              suggestions={ALERGIAS_ALIMENTARIAS}
              placeholder="Ej: Mariscos"
              disabled={!isEditing}
              template="Nombre del alimento"
            />
          </div>

          {/* Otras Alergias */}
          <div>
            <Label>Otras Alergias</Label>
            <p className="text-xs text-gray-500 mb-2">
              Polen, ácaros, látex, etc.
            </p>
            <MedicalChipInput
              value={otrasAlergias}
              onChange={setOtrasAlergias}
              suggestions={OTRAS_ALERGIAS}
              placeholder="Ej: Polen"
              disabled={!isEditing}
              template="Tipo de alergia"
            />
          </div>

          {/* Condiciones Crónicas */}
          <div>
            <Label>Condiciones Crónicas</Label>
            <p className="text-xs text-gray-500 mb-2">
              Enfermedades o condiciones de salud permanentes
            </p>
            <MedicalChipInput
              value={condicionesCronicas}
              onChange={setCondicionesCronicas}
              suggestions={CONDICIONES_CRONICAS}
              placeholder="Ej: Diabetes tipo 2"
              disabled={!isEditing}
              template="Nombre de la condición"
            />
          </div>

          {/* Medicamentos Actuales */}
          <div>
            <Label>Medicamentos Actuales</Label>
            <p className="text-xs text-gray-500 mb-2">
              Medicamentos que tomas regularmente
            </p>
            <MedicationInput
              value={medicamentosActuales}
              onChange={setMedicamentosActuales}
              disabled={!isEditing}
            />
          </div>
        </fieldset>
      </form>
    </motion.article>
  );
}
