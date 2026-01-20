"use client";

import * as React from "react";
import { Loader2, Search, User, X, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateCedulaWithCNE } from "@/lib/services/cedula-validation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export interface PatientOption {
    id: string;
    nombre_completo: string;
    cedula: string | null;
    type: "registered" | "offline";
    email: string | null;
}

interface PatientAutocompleteProps {
    patients: PatientOption[];
    value?: string;
    onSelect: (patientId: string) => void;
    onPatientCreated?: (patient: PatientOption) => void;
    className?: string;
}

export function PatientAutocomplete({
    patients,
    value,
    onSelect,
    onPatientCreated,
    className,
}: PatientAutocompleteProps) {
    const [cedulaInput, setCedulaInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);

    // Obtener paciente seleccionado
    const selectedPatient = React.useMemo(() => 
        patients.find((p) => p.id === value), 
        [patients, value]
    );

    // Si hay un paciente seleccionado y tiene cédula, sincronizamos el input si estaba vacío
    React.useEffect(() => {
        if (selectedPatient && selectedPatient.cedula && !cedulaInput) {
            setCedulaInput(selectedPatient.cedula);
        }
    }, [selectedPatient]);

    // Limpiar búsqueda
    const handleClear = () => {
        setCedulaInput("");
        onSelect("");
        setNotFound(false);
    };

    // Manejar cambio en input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ""); // Solo números
        setCedulaInput(val);
        setNotFound(false);
        
        // Si el usuario borra todo, deseleccionar
        if (!val) {
            onSelect("");
        }
    };

    // Efecto de búsqueda
    React.useEffect(() => {
        // Si ya hay un paciente seleccionado y su cédula coincide con el input, no buscar
        if (selectedPatient?.cedula === cedulaInput) return;
        
        // Si el input está vacío o es muy corto, no buscar
        if (cedulaInput.length < 6) return;

        const search = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                // 1. Buscar localmente
                const localPatient = patients.find(p => p.cedula === cedulaInput);
                
                if (localPatient) {
                    onSelect(localPatient.id);
                    setLoading(false);
                    return;
                }

                // 2. Buscar en CNE (Remoto)
                const result = await validateCedulaWithCNE(cedulaInput);

                if (result.found && result.nombre_completo) {
                    // Crear paciente temporal
                    if (onPatientCreated) {
                         const tempId = `temp_${Date.now()}`;
                         const newPatient: PatientOption = {
                            id: tempId,
                            nombre_completo: result.nombre_completo || "",
                            cedula: cedulaInput,
                            type: "offline",
                            email: null
                        };
                        onPatientCreated(newPatient);
                        toast.success("Paciente encontrado en CNE");
                    }
                } else {
                    setNotFound(true);
                }

            } catch (error) {
                console.error("Error buscando paciente:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(search, 800);
        return () => clearTimeout(timer);

    }, [cedulaInput, patients, selectedPatient, onSelect, onPatientCreated]);


    return (
        <div className={cn("space-y-3", className)}>
            {!selectedPatient ? (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Ingrese número de cédula..."
                            value={cedulaInput}
                            onChange={handleInputChange}
                            className="pl-10 h-14 text-lg shadow-sm border-2 focus-visible:ring-offset-0 focus-visible:border-primary"
                            maxLength={9}
                            autoFocus
                        />
                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-background p-1 rounded-full">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                    
                    {notFound && !loading && cedulaInput.length >= 6 && (
                         <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-900 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <X className="h-4 w-4" />
                            No se encontró ningún paciente con la cédula V-{cedulaInput}
                         </div>
                    )}
                     <div className="mt-2 px-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Búsqueda automática en registros locales y CNE</span>
                    </div>
                </div>
            ) : (
                <div className="bg-card border border-border shadow-sm rounded-xl p-4 relative group transition-all hover:shadow-md animate-in fade-in zoom-in-95">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-lg leading-tight">
                                    {selectedPatient.nombre_completo}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="bg-background/50 font-medium border-muted-foreground/30">
                                        V-{selectedPatient.cedula}
                                    </Badge>
                                    {selectedPatient.type === "registered" ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-transparent">
                                            Registrado
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent">
                                            Offline
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-10 w-10"
                            title="Cambiar paciente"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                     </div>
                </div>
            )}
        </div>
    );
}
