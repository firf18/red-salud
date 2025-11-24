"use client";

import { Clock, MapPin, Video, AlertCircle, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutocompleteTextarea } from "@/components/ui/autocomplete-textarea";
import { format } from "date-fns";

interface AppointmentFormProps {
    formData: any;
    setFormData: (data: any) => void;
    getMinDate: () => string;
    getMinTime: () => string;
    isTimeValid: () => boolean;
    motivoSuggestions: string[];
    patients: any[];
}

export function AppointmentForm({
    formData,
    setFormData,
    getMinDate,
    getMinTime,
    isTimeValid,
    motivoSuggestions,
    patients,
}: AppointmentFormProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="fecha" className="text-sm font-medium">
                                    Fecha <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    min={getMinDate()}
                                    value={formData.fecha}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fecha: e.target.value })
                                    }
                                    className="h-10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hora" className="text-sm font-medium">
                                    Hora <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="hora"
                                    type="time"
                                    min={getMinTime()}
                                    value={formData.hora}
                                    onChange={(e) =>
                                        setFormData({ ...formData, hora: e.target.value })
                                    }
                                    className={`h-10 ${!isTimeValid() ? "border-red-500" : ""}`}
                                    required
                                />
                                {!isTimeValid() && (
                                    <p className="text-xs text-red-600">
                                        ⚠️ La hora debe ser mayor a la actual
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duracion" className="text-sm font-medium">
                                Duración Aproximada
                            </Label>
                            <Select
                                value={formData.duracion_minutos}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, duracion_minutos: value })
                                }
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutos</SelectItem>
                                    <SelectItem value="30">30 minutos</SelectItem>
                                    <SelectItem value="45">45 minutos</SelectItem>
                                    <SelectItem value="60">1 hora</SelectItem>
                                    <SelectItem value="90">1.5 horas</SelectItem>
                                    <SelectItem value="120">2 horas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.fecha === format(new Date(), "yyyy-MM-dd") && (
                            <p className="text-xs text-blue-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Hora mínima hoy: {getMinTime()} (15 min adelante)
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Detalles de la Cita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tipo_cita" className="text-sm font-medium">
                            Tipo de Cita
                        </Label>
                        <Select
                            value={formData.tipo_cita}
                            onValueChange={(value) =>
                                setFormData({ ...formData, tipo_cita: value })
                            }
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="presencial">
                                    <div className="flex flex-col items-start py-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            Presencial
                                        </div>
                                        <span className="text-xs text-gray-500 ml-6">
                                            Consulta en el consultorio médico
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="telemedicina">
                                    <div className="flex flex-col items-start py-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Video className="h-4 w-4 text-green-600" />
                                            Telemedicina
                                        </div>
                                        <span className="text-xs text-gray-500 ml-6">
                                            Consulta por videollamada (solo pacientes registrados)
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="urgencia">
                                    <div className="flex flex-col items-start py-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            Urgencia
                                        </div>
                                        <span className="text-xs text-gray-500 ml-6">
                                            Atención prioritaria inmediata
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="seguimiento">
                                    <div className="flex flex-col items-start py-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Clock className="h-4 w-4 text-purple-600" />
                                            Seguimiento
                                        </div>
                                        <span className="text-xs text-gray-500 ml-6">
                                            Control de tratamiento o evolución
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="primera_vez">
                                    <div className="flex flex-col items-start py-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <User className="h-4 w-4 text-amber-600" />
                                            Primera Vez
                                        </div>
                                        <span className="text-xs text-gray-500 ml-6">
                                            Primera consulta con el paciente
                                        </span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {formData.tipo_cita === "telemedicina" && (
                            <>
                                {patients.find(p => p.id === formData.paciente_id)?.type === "offline" ? (
                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Los pacientes sin cuenta no pueden usar telemedicina
                                    </p>
                                ) : (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Video className="h-3 w-3" />
                                        Se generará automáticamente un link de videollamada
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="precio" className="text-sm font-medium">
                                Precio de Consulta
                            </Label>
                            <Input
                                id="precio"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.precio}
                                onChange={(e) =>
                                    setFormData({ ...formData, precio: e.target.value })
                                }
                                className="h-10"
                            />
                            <p className="text-xs text-gray-500">
                                Puedes configurar precios por servicio en tu perfil
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metodo_pago" className="text-sm font-medium">
                                Método de Pago
                            </Label>
                            <Select
                                value={formData.metodo_pago}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, metodo_pago: value })
                                }
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                                    <SelectItem value="tarjeta">💳 Tarjeta de Crédito/Débito</SelectItem>
                                    <SelectItem value="transferencia">🏦 Transferencia Bancaria</SelectItem>
                                    <SelectItem value="pago_movil">📱 Pago Móvil</SelectItem>
                                    <SelectItem value="seguro">🏥 Seguro Médico</SelectItem>
                                    <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="motivo" className="text-sm font-medium">
                            Motivo de Consulta <span className="text-red-500">*</span>
                        </Label>
                        <AutocompleteTextarea
                            id="motivo"
                            placeholder="Ej: Dolor de cabeza, fiebre, control de rutina"
                            value={formData.motivo}
                            onChange={(value) =>
                                setFormData({ ...formData, motivo: value })
                            }
                            suggestions={motivoSuggestions}
                            required
                            rows={3}
                        />
                        <p className="text-xs text-gray-500">
                            💡 Usa Tab/Enter para autocompletar. Separa múltiples motivos con comas
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notas_internas" className="text-sm font-medium">
                            Notas Internas (Opcional)
                        </Label>
                        <Textarea
                            id="notas_internas"
                            placeholder="Notas privadas que solo tú verás"
                            value={formData.notas_internas}
                            onChange={(e) =>
                                setFormData({ ...formData, notas_internas: e.target.value })
                            }
                            rows={2}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                            Estas notas no serán visibles para el paciente
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="enviar_recordatorio"
                                checked={formData.enviar_recordatorio}
                                onChange={(e) =>
                                    setFormData({ ...formData, enviar_recordatorio: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="enviar_recordatorio" className="text-sm font-normal cursor-pointer">
                                Activar recordatorios inteligentes
                            </Label>
                        </div>
                        {formData.enviar_recordatorio && (
                            <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-gray-700">
                                    📱 El paciente recibirá:
                                </p>
                                <ul className="text-xs text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                                    <li>Recordatorio 24h antes de la cita</li>
                                    <li>Notificación cuando llegue su turno</li>
                                    <li>Actualización de cuántas personas hay delante</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
