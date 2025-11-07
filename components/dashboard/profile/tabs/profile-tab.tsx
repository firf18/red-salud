import { motion } from "framer-motion";
import { Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ESTADOS_VENEZUELA } from "../constants";
import type { TabComponentProps } from "../types";

export function ProfileTab({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: TabComponentProps) {
  return (
    <motion.article
      key="profile"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Información Personal
        </h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              Guardar
            </Button>
          </div>
        )}
      </header>

      <form className="grid grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <fieldset className="space-y-4">
          <legend className="sr-only">Información básica</legend>
          
          <div>
            <Label htmlFor="nombre">Nombre Completo *</Label>
            {isEditing ? (
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.nombre || "No registrado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              El email no se puede modificar
            </p>
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono *</Label>
            {isEditing ? (
              <Input
                id="telefono"
                type="tel"
                placeholder="+58 412-1234567"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.telefono || "No registrado"}
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                Formato: +58 XXX-XXXXXXX
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cedula">Cédula de Identidad *</Label>
            {isEditing ? (
              <Input
                id="cedula"
                placeholder="V-12345678 o E-12345678"
                value={formData.cedula}
                onChange={(e) =>
                  setFormData({ ...formData, cedula: e.target.value })
                }
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.cedula || "No registrada"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
            {isEditing ? (
              <Input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fechaNacimiento: e.target.value })
                }
                max={new Date().toISOString().split("T")[0]}
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.fechaNacimiento
                  ? new Date(formData.fechaNacimiento).toLocaleDateString(
                      "es-VE",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "No registrada"}
              </p>
            )}
          </div>
        </fieldset>

        {/* Columna Derecha */}
        <fieldset className="space-y-4">
          <legend className="sr-only">Dirección</legend>
          
          <div>
            <Label htmlFor="direccion">Dirección Completa *</Label>
            {isEditing ? (
              <textarea
                id="direccion"
                placeholder="Av. Principal, Edificio, Piso, Apartamento..."
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.direccion || "No registrada"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ciudad">Ciudad *</Label>
            {isEditing ? (
              <Input
                id="ciudad"
                placeholder="Caracas, Maracaibo, Valencia..."
                value={formData.ciudad}
                onChange={(e) =>
                  setFormData({ ...formData, ciudad: e.target.value })
                }
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.ciudad || "No registrada"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="estado">Estado *</Label>
            {isEditing ? (
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-required="true"
              >
                <option value="">Seleccionar estado</option>
                {ESTADOS_VENEZUELA.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.estado || "No registrado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="codigoPostal">Código Postal</Label>
            {isEditing ? (
              <Input
                id="codigoPostal"
                placeholder="1010"
                value={formData.codigoPostal}
                onChange={(e) =>
                  setFormData({ ...formData, codigoPostal: e.target.value })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.codigoPostal || "No registrado"}
              </p>
            )}
          </div>

          {isEditing && (
            <aside className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los campos marcados con * son
                obligatorios para completar tu perfil.
              </p>
            </aside>
          )}
        </fieldset>
      </form>
    </motion.article>
  );
}
