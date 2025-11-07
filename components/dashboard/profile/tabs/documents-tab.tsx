import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Download,
  Check,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDocument } from "@/lib/supabase/services/storage-service";

interface DocumentsTabProps {
  userId?: string;
}

export function DocumentsTab({ userId }: DocumentsTabProps) {
  const [document, setDocument] = useState({
    status: "not_uploaded" as "verified" | "pending" | "rejected" | "not_uploaded",
    uploadedAt: null as string | null,
    rejectionReason: null as string | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validar tipo de archivo
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      alert("Solo se permiten archivos JPG, PNG o PDF");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo no debe superar los 5MB");
      return;
    }

    setIsUploading(true);
    const result = await uploadDocument(userId, file, "cedula", "Cédula de Identidad");
    
    if (result.success) {
      setDocument({
        status: "pending",
        uploadedAt: new Date().toISOString(),
        rejectionReason: null,
      });
    } else {
      alert("Error al subir el documento");
    }
    setIsUploading(false);
  };

  const getStatusBadge = (status: typeof document.status) => {
    const badges = {
      verified: (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
          <Check className="h-3 w-3" aria-hidden="true" />
          Verificado
        </span>
      ),
      pending: (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
          <Clock className="h-3 w-3" aria-hidden="true" />
          En Revisión
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
          <XCircle className="h-3 w-3" aria-hidden="true" />
          Rechazado
        </span>
      ),
      not_uploaded: (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
          <Upload className="h-3 w-3" aria-hidden="true" />
          Sin Subir
        </span>
      ),
    };

    return badges[status];
  };

  const progressPercentage = document.status === "verified" ? 100 : 0;

  return (
    <motion.article
      key="documents"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Documentos y Verificación
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Sube tus documentos para verificar tu cuenta y acceder a todos los
          servicios
        </p>
      </header>

      {/* Verification Status */}
      <aside className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">
              Estado de Verificación
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {document.status === "verified" ? "Documento verificado" : "Documento pendiente"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {progressPercentage}%
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">Completado</p>
          </div>
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </aside>

      {/* Document Upload */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Cédula de Identidad
        </h3>

        <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Cédula de Identidad
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {document.uploadedAt
                    ? `Subido el ${new Date(document.uploadedAt).toLocaleDateString("es-VE")}`
                    : "No subido"}
                </p>
                <div className="mt-2">{getStatusBadge(document.status)}</div>
              </div>
            </div>

            <div className="flex gap-2">
              {document.status === "not_uploaded" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Subiendo..." : "Subir"}
                </Button>
              )}
              {document.status === "verified" && (
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              )}
              {(document.status === "pending" || document.status === "rejected") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Reemplazar
                </Button>
              )}
            </div>
          </div>

          {document.status === "rejected" && document.rejectionReason && (
            <aside className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Motivo del rechazo:</strong> {document.rejectionReason}
              </p>
            </aside>
          )}
        </article>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </section>

      {/* Info Box */}
      <aside className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Requisitos para el Documento
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Formato: JPG, PNG o PDF</li>
              <li>Tamaño máximo: 5 MB</li>
              <li>La imagen debe ser clara y legible</li>
              <li>Debe mostrar el documento completo</li>
              <li>No se aceptan documentos vencidos</li>
            </ul>
          </div>
        </div>
      </aside>
    </motion.article>
  );
}
