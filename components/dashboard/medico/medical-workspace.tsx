"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { StructuredTemplate } from "@/lib/templates/structured-templates";
import { WorkspaceHeader } from "./workspace/workspace-header";
import { TabsHeader } from "./workspace/tabs-header";
import { FreeNotesEditor } from "./workspace/free-notes-editor";
import { ICDSearchTab } from "./workspace/icd-search-tab";
import { HistorialPanel } from "./workspace/historial-panel";
import { AIRecommendationsPanel } from "./workspace/ai-recommendations-panel";
import { HistorialDetailDialog } from "./workspace/historial-detail-dialog";
import { TemplateMarketplace } from "./templates/template-marketplace";
import { StructuredTemplateEditor } from "./templates/structured-template-editor";
import { StructuredTemplateMarketplace } from "./templates/structured-template-marketplace";
import { useAutocomplete } from "./workspace/use-autocomplete";
import { useHistorial } from "./workspace/use-historial";
import { useAIAnalysis } from "./workspace/use-ai-analysis";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MedicalWorkspaceProps {
  paciente: {
    cedula: string;
    nombre_completo: string;
    edad: number | null;
    genero: string;
  };
  alergias: string[];
  setAlergias: (value: string[]) => void;
  condicionesCronicas: string[];
  setCondicionesCronicas: (value: string[]) => void;
  medicamentosActuales: string[];
  setMedicamentosActuales: (value: string[]) => void;
  notasMedicas: string;
  setNotasMedicas: (value: string) => void;
  diagnosticos: string[];
  setDiagnosticos: (value: string[]) => void;
  onSave: () => void;
  onBack: () => void;
  loading: boolean;
}

export function MedicalWorkspace({
  paciente,
  alergias,
  condicionesCronicas,
  medicamentosActuales,
  setMedicamentosActuales,
  notasMedicas,
  setNotasMedicas,
  diagnosticos,
  setDiagnosticos,
  onSave,
  onBack,
  loading,
}: MedicalWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("estructurado");
  const [showHistorial, setShowHistorial] = useState(true);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showStructuredMarketplace, setShowStructuredMarketplace] = useState(false);
  const [selectedStructuredTemplate, setSelectedStructuredTemplate] = useState<StructuredTemplate | null>(null);
  const [userId, setUserId] = useState<string>("");

  // Custom hooks
  const autocomplete = useAutocomplete({ notasMedicas, paciente });
  const historial = useHistorial(paciente.cedula);
  const aiAnalysis = useAIAnalysis({
    notasMedicas,
    paciente,
    alergias,
    condicionesCronicas,
    medicamentosActuales,
    diagnosticos,
    setDiagnosticos,
  });

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleTemplateSelect = (content: string) => {
    setNotasMedicas(content);
    setShowMarketplace(false);
    setTimeout(() => {
      autocomplete.notasTextareaRef.current?.focus();
    }, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      <WorkspaceHeader
        paciente={paciente}
        loading={loading}
        onBack={onBack}
        onSave={onSave}
        onPrint={handlePrint}
      />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsHeader
              activeTab={activeTab}
              selectedStructuredTemplate={selectedStructuredTemplate}
              notasMedicas={notasMedicas}
              isAnalyzing={aiAnalysis.isAnalyzing}
              onShowStructuredMarketplace={() => setShowStructuredMarketplace(true)}
              onShowMarketplace={() => setShowMarketplace(true)}
              onAnalyzeWithAI={aiAnalysis.handleAnalyzeWithAI}
            />

            <TabsContent value="estructurado" className="flex-1 m-0 flex flex-col overflow-hidden">
              <div className="flex-1 flex overflow-hidden">
                <ScrollArea className="flex-1 bg-white">
                  <StructuredTemplateEditor
                    template={selectedStructuredTemplate}
                    onChange={(content: string) => setNotasMedicas(content)}
                    paciente={paciente}
                    medications={medicamentosActuales}
                    onMedicationsChange={setMedicamentosActuales}
                  />
                </ScrollArea>

                {aiAnalysis.showRecommendations && aiAnalysis.aiAnalysis && (
                  <AIRecommendationsPanel
                    aiAnalysis={aiAnalysis.aiAnalysis}
                    onClose={() => aiAnalysis.setShowRecommendations(false)}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="notas" className="flex-1 m-0 flex flex-col overflow-hidden">
              <div className="flex-1 flex overflow-hidden">
                <FreeNotesEditor
                  notasMedicas={notasMedicas}
                  setNotasMedicas={setNotasMedicas}
                  autocomplete={autocomplete}
                />

                {aiAnalysis.showRecommendations && aiAnalysis.aiAnalysis && (
                  <AIRecommendationsPanel
                    aiAnalysis={aiAnalysis.aiAnalysis}
                    onClose={() => aiAnalysis.setShowRecommendations(false)}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="icd" className="flex-1 m-0 p-6 overflow-auto">
              <ICDSearchTab
                diagnosticos={diagnosticos}
                onAddDiagnostico={(codigo, descripcion) => {
                  const diagnostico = `${codigo} - ${descripcion}`;
                  if (!diagnosticos.includes(diagnostico)) {
                    setDiagnosticos([...diagnosticos, diagnostico]);
                  }
                }}
                onRemoveDiagnostico={(index) => {
                  setDiagnosticos(diagnosticos.filter((_, i) => i !== index));
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <HistorialPanel
          historialClinico={historial.historialClinico}
          showHistorial={showHistorial}
          onToggle={() => setShowHistorial(!showHistorial)}
          onSelectItem={historial.setSelectedHistorial}
        />
      </div>

      <HistorialDetailDialog
        historial={historial.selectedHistorial}
        onClose={() => historial.setSelectedHistorial(null)}
      />

      <TemplateMarketplace
        open={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onSelectTemplate={handleTemplateSelect}
        userId={userId}
      />

      <StructuredTemplateMarketplace
        open={showStructuredMarketplace}
        onClose={() => setShowStructuredMarketplace(false)}
        onSelectTemplate={(template) => {
          setSelectedStructuredTemplate(template);
          setShowStructuredMarketplace(false);
        }}
      />
    </div>
  );
}
