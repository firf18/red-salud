"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Stethoscope,
  FileText,
  Shield,
  Settings,
  Eye,
  Activity,
  CreditCard,
} from "lucide-react";
import { ModalHeader } from "../components/modal-header";
import { TabNavigation } from "../components/tab-navigation";
import { ProfileTabDoctor } from "./tabs/profile-tab-doctor";
import { MedicalTabDoctor } from "./tabs/medical-tab-doctor";
import { DocumentsTabDoctor } from "./tabs/documents-tab-doctor";
import { SecurityTabNew as SecurityTab } from "../tabs/security-tab-new";
import { PreferencesTab } from "../tabs/preferences-tab";
import { PrivacyTab } from "../tabs/privacy-tab";
import { ActivityTab } from "../tabs/activity-tab";
import { BillingTab } from "../tabs/billing-tab";
import { useAvatarUpload } from "../hooks/use-avatar-upload";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Toast, type ToastType } from "@/components/ui/toast";
import type { TabType, TabConfig, DoctorProfileData } from "../types";

const TABS: TabConfig[] = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "medical", label: "Info. Profesional", icon: Stethoscope },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "preferences", label: "Preferencias", icon: Settings },
  { id: "privacy", label: "Privacidad", icon: Eye },
  { id: "activity", label: "Actividad", icon: Activity },
  { id: "billing", label: "Facturación", icon: CreditCard },
];

interface UserProfileModalDoctorProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userId?: string;
}

export function UserProfileModalDoctor({
  isOpen,
  onClose,
  userName,
  userEmail,
  userId,
}: UserProfileModalDoctorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { themeColor, setThemeColor } = useThemeColor();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estado del perfil del médico
  const [formData, setFormData] = useState<DoctorProfileData>({
    nombre_completo: userName,
    email: userEmail,
    telefono: "",
    cedula: "",
    mpps: "",
    especialidad: "",
    universidad: "",
    anos_experiencia: 0,
    bio: "",
    subespecialidades: "",
    certificaciones: "",
    idiomas: "",
  });

  const showNotification = (message: string, type: ToastType = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Cargar datos del perfil
  useEffect(() => {
    if (isOpen && userId) {
      loadDoctorProfile();
    }
  }, [isOpen, userId]);

  const loadDoctorProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/doctor/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          ...data,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showNotification("Error al cargar el perfil", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const {
    avatarHover,
    setAvatarHover,
    fileInputRef,
    handleAvatarClick,
    handleFileChange,
  } = useAvatarUpload(async (file) => {
    if (!userId) {
      showNotification("Error: Usuario no identificado", "error");
      return;
    }

    try {
      showNotification("Subiendo imagen...", "info");
      // TODO: Implementar subida con Supabase Storage
      console.log("Uploading file:", file, "for user:", userId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showNotification(
        "Imagen subida correctamente (pendiente implementación)",
        "warning"
      );
    } catch (error) {
      showNotification("Error al subir la imagen", "error");
    }
  });

  const handleSave = async () => {
    if (!userId) {
      showNotification("Error: Usuario no identificado", "error");
      return { success: false, error: "Usuario no identificado" };
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/doctor/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || "Error al guardar el perfil";
        showNotification(errorMessage, "error");
        return { success: false, error: errorMessage };
      }

      setIsEditing(false);
      showNotification("Perfil actualizado correctamente", "success");
      await loadDoctorProfile();

      return { success: true };
    } catch (error) {
      console.error("Error saving:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al conectar con el servidor";
      showNotification(errorMessage, "error");
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-100"
              aria-hidden="true"
            />

            <motion.dialog
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              open={isOpen}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[95vh] bg-white rounded-xl shadow-2xl z-101 overflow-hidden flex flex-col"
              style={{ translateX: "-50%", translateY: "-50%" }}
              aria-labelledby="profile-modal-title"
              aria-modal="true"
            >
              <ModalHeader
                userName={userName}
                userEmail={userEmail}
                onClose={onClose}
                avatarHover={avatarHover}
                onAvatarHover={setAvatarHover}
                onAvatarClick={handleAvatarClick}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                themeColor={themeColor}
                onThemeColorChange={setThemeColor}
              />

              <TabNavigation
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />

              <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {activeTab === "profile" && (
                        <ProfileTabDoctor
                          formData={formData}
                          setFormData={setFormData}
                          isEditing={isEditing}
                          setIsEditing={setIsEditing}
                          handleSave={handleSave}
                        />
                      )}
                      {activeTab === "medical" && (
                        <MedicalTabDoctor
                          formData={formData}
                          setFormData={setFormData}
                          isEditing={isEditing}
                          setIsEditing={setIsEditing}
                          handleSave={handleSave}
                        />
                      )}
                      {activeTab === "documents" && <DocumentsTabDoctor />}
                      {activeTab === "security" && (
                        <SecurityTab userEmail={userEmail} userId={userId} />
                      )}
                      {activeTab === "preferences" && <PreferencesTab />}
                      {activeTab === "privacy" && <PrivacyTab userId={userId} />}
                      {activeTab === "activity" && <ActivityTab userId={userId} />}
                      {activeTab === "billing" && <BillingTab userId={userId} />}
                    </AnimatePresence>
                  )}
                </div>
              </main>
            </motion.dialog>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
