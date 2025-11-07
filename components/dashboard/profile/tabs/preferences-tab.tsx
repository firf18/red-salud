import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/contexts/theme-context";
import { useLanguage } from "@/lib/contexts/language-context";
import { Moon, Sun } from "lucide-react";

export function PreferencesTab() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  return (
    <motion.article
      key="preferences"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Preferencias de la Aplicación
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza tu experiencia en Red-Salud
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">General</h3>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <Label htmlFor="idioma" className="mb-2 block dark:text-gray-100">
              Idioma de la Interfaz
            </Label>
            <select
              id="idioma"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "es" | "en" | "pt")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              aria-label="Seleccionar idioma"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <Label htmlFor="zona" className="mb-2 block">
              Zona Horaria
            </Label>
            <select
              id="zona"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Seleccionar zona horaria"
            >
              <option value="America/Caracas">Venezuela (GMT-4)</option>
              <option value="America/Bogota">Colombia (GMT-5)</option>
              <option value="America/Lima">Perú (GMT-5)</option>
              <option value="America/Mexico_City">México (GMT-6)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Modo Oscuro
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tema oscuro para la interfaz
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={theme === "dark"}
                onChange={toggleTheme}
                aria-label="Activar modo oscuro"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {[
            {
              label: "Notificaciones de Escritorio",
              description: "Recibe alertas en tu navegador",
              checked: true,
            },
            {
              label: "Sonidos de Notificación",
              description: "Reproducir sonido al recibir notificaciones",
              checked: true,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked={item.checked}
                  aria-label={`Activar ${item.label}`}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Preferencias de Comunicación
          </h3>

          <div className="p-4 rounded-lg border border-gray-200">
            <Label htmlFor="metodoContacto" className="mb-2 block">
              Método de Contacto Preferido
            </Label>
            <select
              id="metodoContacto"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Seleccionar método de contacto"
            >
              <option value="email">Correo Electrónico</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="llamada">Llamada Telefónica</option>
            </select>
          </div>

          {[
            {
              label: "Boletín Informativo",
              description: "Recibe noticias y consejos de salud",
              checked: false,
            },
            {
              label: "Ofertas y Promociones",
              description: "Descuentos en servicios médicos",
              checked: true,
            },
            {
              label: "Encuestas de Satisfacción",
              description: "Ayúdanos a mejorar el servicio",
              checked: true,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked={item.checked}
                  aria-label={`Activar ${item.label}`}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}

          <aside className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Mantén activadas las notificaciones de citas
              para no perder ninguna consulta médica.
            </p>
          </aside>
        </section>
      </div>
    </motion.article>
  );
}
