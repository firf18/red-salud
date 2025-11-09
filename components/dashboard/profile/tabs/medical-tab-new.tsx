"use client";

import { motion } from "framer-motion";
import { Edit2, Save, X, Loader2, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIPOS_SANGRE } from "../constants";
import type { TabComponentProps } from "../types";
import { useState, useEffect } from "react";

const OPCIONES_FUMA = [
  { value: "no", label: "No fumo" },
  { value: "si", label: "Sí, fumo actualmente" },
  { value: "ex-fumador", label: "Ex-fumador" },
];

const OPCIONES_ALCOHOL = [
  { value: "no", label: "No consumo" },
  { value: "ocasional", label: "Ocasional (1-2 veces al mes)" },
  { value: "regular", label: "Regular (1-2 veces por semana)" },
  { value: "frecuente", label: "Frecuente (3+ veces por semana)" },
];

const OPCIONES_ACTIVIDAD = [
  { value: "sedentario", label: "Sedentario (poco o ningún ejercicio)" },
  { value: "ligera", label: "Ligera (1-2 días/semana)" },
  { value: "moderada", label: "Moderada (3-5 días/semana)" },
  { value: "intensa", label: "Intensa (6-7 días/semana)" },
];

const OPCIONES_DONANTE = [
  { value: "si", label: "Sí, soy donante" },
  { value: "no", label: "No soy donante" },
  { value: "no_especificado", label: "Prefiero no especificar" },
];

export function MedicalTabNew({
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

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  // Calcular IMC
  useEffect(() => {
    if (localData.peso && localData.altura) {
      const pesoNum = parseFloat(localData.peso);
      const alturaNum = parseFloat(localData.altura) / 100; // convertir cm a m
      
      if (pesoNum > 0 && alturaNum > 0) {
        const imcCalculado = pesoNum / (alturaNum * alturaNum);
        setImc(imcCalculado);
        
        // Categorizar IMC
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
      setFormData(localData);
      await handleSave();
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
        {/* Columna Izquierda - Datos Vitales y Físicos */}
        <fieldset className="space-y-5">
          <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Datos Vitales y Físicos
          </legend>

          {/* Sexo Biológico */}
          <div>
            <Label htmlFor="sexoBiologico">Sexo Biológico *</Label>
            {isEditing ? (
              <select
                id="sexoBiologico"
                value={localData.sexoBiologico || ""}
                onChange={(e) =>
                  setLocalData({ ...localData, sexoBiologico: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {localData.sexoBiologico
                  ? localData.sexoBiologico.charAt(0).toUpperCase() +
                    localData.sexoBiologico.slice(1)
                  : "No registrado"}
              </p>
            )}
          </div>

          {/* Tipo de Sangre */}
          <div>
            <Label htmlFor="tipoSangre">Tipo de Sangre *</Label>
            {isEditing ? (
              <select
                id="tipoSangre"
                value={localData.tipoSangre}
                onChange={(e) =>
                  setLocalData({ ...localData, tipoSangre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar tipo</option>
                {TIPOS_SANGRE.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.tipoSangre || "No registrado"}
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

          {/* IMC Calculado */}
          {imc && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-700 font-medium">
                    Índice de Masa Corporal (IMC)
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {imc.toFixed(1)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
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
            </div>
          )}

          {/* Perímetro de Cintura */}
          <div>
            <Label htmlFor="perimetroCintura">Perímetro de Cintura (cm)</Label>
            {isEditing ? (
              <Input
                id="perimetroCintura"
                type="number"
                placeholder="85"
                value={localData.perimetroCintura || ""}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    perimetroCintura: e.target.value,
                  })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.perimetroCintura
                  ? `${formData.perimetroCintura} cm`
                  : "No registrado"}
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                Importante para evaluar riesgo cardiovascular
              </p>
            )}
          </div>

          {/* Presión Arterial */}
          <div>
            <Label>Presión Arterial Habitual (mmHg)</Label>
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
                <p className="text-xs text-gray-500 mt-1">Sistólica (máx)</p>
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
                <p className="text-xs text-gray-500 mt-1">Diastólica (mín)</p>
              </div>
            </div>
          </div>

          {/* Frecuencia Cardíaca */}
          <div>
            <Label htmlFor="frecuenciaCardiaca">
              Frecuencia Cardíaca en Reposo (lpm)
            </Label>
            {isEditing ? (
              <Input
                id="frecuenciaCardiaca"
                type="number"
                placeholder="70"
                value={localData.frecuenciaCardiaca || ""}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    frecuenciaCardiaca: e.target.value,
                  })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.frecuenciaCardiaca
                  ? `${formData.frecuenciaCardiaca} lpm`
                  : "No registrado"}
              </p>
            )}
          </div>

          {/* Campos específicos para mujeres */}
          {esMujer && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-pink-900 text-sm">
                Información Específica
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="embarazada">¿Embarazada?</Label>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  ) : (
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {formData.embarazada ? "Sí" : "No"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lactancia">¿Lactancia?</Label>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  ) : (
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {formData.lactancia ? "Sí" : "No"}
                    </p>
                  )}
                </div>
              </div>

              {/* Más campos para mujeres... */}
            </div>
          )}
        </fieldset>

        {/* Columna Derecha - Información Clínica */}
        <fieldset className="space-y-5">
          <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Información Clínica Crítica
          </legend>

          {/* Alergias a Medicamentos */}
          <div>
            <Label htmlFor="alergias">Alergias a Medicamentos</Label>
            {isEditing ? (
              <textarea
                id="alergias"
                placeholder="Ej: Penicilina, Ibuprofeno..."
                value={localData.alergias}
                onChange={(e) =>
                  setLocalData({ ...localData, alergias: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.alergias || "Ninguna registrada"}
              </p>
            )}
          </div>

          {/* Alergias Alimentarias */}
          <div>
            <Label htmlFor="alergiasAlimentarias">Alergias Alimentarias</Label>
            {isEditing ? (
              <textarea
                id="alergiasAlimentarias"
                placeholder="Ej: Mariscos, nueces, lactosa..."
                value={localData.alergiasAlimentarias || ""}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    alergiasAlimentarias: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.alergiasAlimentarias || "Ninguna registrada"}
              </p>
            )}
          </div>

          {/* Otras Alergias */}
          <div>
            <Label htmlFor="otrasAlergias">Otras Alergias</Label>
            {isEditing ? (
              <Input
                id="otrasAlergias"
                placeholder="Ej: Polen, látex, polvo..."
                value={localData.otrasAlergias || ""}
                onChange={(e) =>
                  setLocalData({ ...localData, otrasAlergias: e.target.value })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.otrasAlergias || "Ninguna registrada"}
              </p>
            )}
          </div>

          {/* Condiciones Crónicas */}
          <div>
            <Label htmlFor="condicionesCronicas">Condiciones Crónicas</Label>
            {isEditing ? (
              <textarea
                id="condicionesCronicas"
                placeholder="Ej: Diabetes tipo 2, hipertensión, asma..."
                value={localData.condicionesCronicas}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    condicionesCronicas: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.condicionesCronicas || "Ninguna registrada"}
              </p>
            )}
          </div>

          {/* Medicamentos Actuales */}
          <div>
            <Label htmlFor="medicamentosActuales">Medicamentos Actuales</Label>
            {isEditing ? (
              <textarea
                id="medicamentosActuales"
                placeholder="Ej: Losartán 50mg (1 vez al día)..."
                value={localData.medicamentosActuales}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    medicamentosActuales: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.medicamentosActuales || "Ninguno registrado"}
              </p>
            )}
          </div>

          {/* Hábitos de Vida */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-orange-900 text-sm">
              Hábitos de Vida
            </h4>

            {/* Fuma */}
            <div>
              <Label htmlFor="fuma">Tabaquismo</Label>
              {isEditing ? (
                <select
                  id="fuma"
                  value={localData.fuma || "no"}
                  onChange={(e) =>
                    setLocalData({ ...localData, fuma: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPCIONES_FUMA.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900 mt-1">
                  {OPCIONES_FUMA.find((o) => o.value === formData.fuma)
                    ?.label || "No registrado"}
                </p>
              )}
            </div>

            {/* Alcohol */}
            <div>
              <Label htmlFor="consumeAlcohol">Consumo de Alcohol</Label>
              {isEditing ? (
                <select
                  id="consumeAlcohol"
                  value={localData.consumeAlcohol || "no"}
                  onChange={(e) =>
                    setLocalData({
                      ...localData,
                      consumeAlcohol: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPCIONES_ALCOHOL.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900 mt-1">
                  {OPCIONES_ALCOHOL.find((o) => o.value === formData.consumeAlcohol)
                    ?.label || "No registrado"}
                </p>
              )}
            </div>

            {/* Actividad Física */}
            <div>
              <Label htmlFor="actividadFisica">Actividad Física</Label>
              {isEditing ? (
                <select
                  id="actividadFisica"
                  value={localData.actividadFisica || "sedentario"}
                  onChange={(e) =>
                    setLocalData({
                      ...localData,
                      actividadFisica: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPCIONES_ACTIVIDAD.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900 mt-1">
                  {OPCIONES_ACTIVIDAD.find(
                    (o) => o.value === formData.actividadFisica
                  )?.label || "No registrado"}
                </p>
              )}
            </div>
          </div>

          {/* Donante de Órganos */}
          <div>
            <Label htmlFor="donanteOrganos">Donante de Órganos</Label>
            {isEditing ? (
              <select
                id="donanteOrganos"
                value={localData.donanteOrganos || "no_especificado"}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    donanteOrganos: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {OPCIONES_DONANTE.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {OPCIONES_DONANTE.find(
                  (o) => o.value === formData.donanteOrganos
                )?.label || "No especificado"}
              </p>
            )}
          </div>
        </fieldset>
      </form>
    </motion.article>
  );
}
