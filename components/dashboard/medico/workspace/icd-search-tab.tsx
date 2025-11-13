"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X, Plus, AlertCircle } from "lucide-react";

interface ICDSearchTabProps {
  diagnosticos: string[];
  onAddDiagnostico: (codigo: string, descripcion: string) => void;
  onRemoveDiagnostico: (index: number) => void;
}

export function ICDSearchTab({
  diagnosticos,
  onAddDiagnostico,
  onRemoveDiagnostico,
}: ICDSearchTabProps) {
  const [icdSearchQuery, setIcdSearchQuery] = useState("");
  const [icdResults, setIcdResults] = useState<any[]>([]);
  const [isSearchingICD, setIsSearchingICD] = useState(false);

  const handleSearchICD = async () => {
    if (!icdSearchQuery.trim()) return;

    setIsSearchingICD(true);
    try {
      const response = await fetch(`/api/icd11/search?q=${encodeURIComponent(icdSearchQuery)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setIcdResults(data.data.slice(0, 10));
      } else {
        setIcdResults([]);
      }
    } catch (error) {
      console.error("Error searching ICD-11:", error);
      setIcdResults([]);
    } finally {
      setIsSearchingICD(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar código o diagnóstico... (ej: gastritis, diabetes)"
          value={icdSearchQuery}
          onChange={(e) => setIcdSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchICD();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleSearchICD} disabled={isSearchingICD || !icdSearchQuery.trim()}>
          {isSearchingICD ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {diagnosticos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Diagnósticos Seleccionados</h3>
          {diagnosticos.map((diagnostico, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg bg-blue-50 border-blue-200 flex items-start justify-between"
            >
              <p className="text-sm font-medium text-gray-900 flex-1">{diagnostico}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveDiagnostico(index)}
                className="flex-shrink-0 ml-2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {icdResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Resultados de Búsqueda</h3>
          {icdResults.map((result, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-start justify-between transition-colors"
              onClick={() => onAddDiagnostico(result.code, result.title)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {result.code}
                  </Badge>
                  <h3 className="font-medium text-sm">{result.title}</h3>
                </div>
                {result.definition && (
                  <p className="text-xs text-gray-600 mt-1">{result.definition}</p>
                )}
              </div>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!isSearchingICD && icdSearchQuery && icdResults.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No se encontraron resultados</p>
          <p className="text-xs text-gray-500 mt-1">
            Intenta con otros términos de búsqueda o usa la IA para sugerencias
          </p>
        </div>
      )}
    </div>
  );
}
