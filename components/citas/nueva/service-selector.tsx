"use client";

import { useState, useEffect } from "react";
import { Check, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MedicalService {
  id: string;
  name: string;
  price: number;
}

const AVAILABLE_SERVICES: MedicalService[] = [
  { id: "cons-gen", name: "Consulta General", price: 30.00 },
  { id: "cons-esp", name: "Consulta Especialista", price: 50.00 },
  { id: "eco-ab", name: "Ecografía Abdominal", price: 45.00 },
  { id: "eco-obs", name: "Ecografía Obstétrica", price: 50.00 },
  { id: "elec-car", name: "Electrocardiograma", price: 25.00 },
  { id: "limp-dent", name: "Limpieza Dental", price: 35.00 },
  { id: "curacion", name: "Curación Simple", price: 15.00 },
  { id: "sutura", name: "Sutura", price: 40.00 },
  { id: "cert-med", name: "Certificado Médico", price: 20.00 },
  { id: "lab-sang", name: "Examen de Sangre (Básico)", price: 25.00 },
];

interface ServiceSelectorProps {
  onPriceChange: (total: number) => void;
  initialTotal?: number;
}

export function ServiceSelector({ onPriceChange, initialTotal }: ServiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<MedicalService[]>([]);
  const [customPrice, setCustomPrice] = useState(false);

  // Calcular total
  const total = selectedServices.reduce((sum, service) => sum + service.price, 0);

  // Notificar cambio de precio
  useEffect(() => {
    if (selectedServices.length > 0) {
      onPriceChange(total);
      setCustomPrice(false);
    }
  }, [selectedServices, onPriceChange, total]);

  const handleSelect = (service: MedicalService) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const removeService = (id: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedServices.map(service => (
          <Badge key={service.id} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
            {service.name} (${service.price.toFixed(2)})
            <button
              type="button"
              onClick={() => removeService(service.id)}
              className="ml-1 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selectedServices.length === 0 && (
          <span className="text-xs text-muted-foreground italic py-1.5">
            Sin servicios seleccionados
          </span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-xs h-9"
          >
            <span className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                Agregar Servicios
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar servicio..." />
            <CommandList>
              <CommandEmpty>No se encontraron servicios.</CommandEmpty>
              <CommandGroup heading="Servicios Disponibles">
                {AVAILABLE_SERVICES.map((service) => {
                  const isSelected = selectedServices.some(s => s.id === service.id);
                  return (
                    <CommandItem
                      key={service.id}
                      value={service.name}
                      onSelect={() => handleSelect(service)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-muted-foreground font-mono">
                          ${service.price.toFixed(2)}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedServices.length > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-dashed">
            <span className="text-xs font-semibold text-muted-foreground">Total Calculado:</span>
            <span className="text-sm font-bold text-green-600">${total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
