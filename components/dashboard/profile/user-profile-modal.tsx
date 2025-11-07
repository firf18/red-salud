"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  FileText,
  Shield,
  Settings,
  Eye,
  Activity,
  CreditCard,
} from "lucide-react";
import { ModalHeader } from "./components/modal-header";
import { TabNavigation } from "./components/tab-navigation";
import { ProfileTab } from "./tabs/profile-tab";
import { MedicalTab } from "./tabs/medical-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { SecurityTab } from "./tabs/security-tab";
import { PreferencesTab } from "./tabs/preferences-tab";
import { PrivacyTab } from "./tabs/privacy-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { BillingTab } from "./tabs/billing-tab";
import { useProfileForm } from "./hooks/use-profile-form";
import { useAvatarUpload } from "./hooks/use-avatar-upload";
import type { UserProfileModalProps, TabType, TabConfig } from "./types";

const TABS: TabConfig[] = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "medical", label: "Info. Médica", icon: Heart },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "preferences", label: "Preferencias", icon: Settings },
  { id: "privacy", label: "Privacidad", icon: Eye },
  { id: "activity", label: "Actividad", icon: Activity },
  { id: "billing", label: "Facturación", icon: CreditCard },
];

export function UserProfileModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  userId,
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const {
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    isSaving,
    setIsSaving,
    resetForm,
  } = useProfileForm({
    nombre: userName,
    email: userEmail,
  });

  const {
    avatarHover,
    setAvatarHover,
    fileInputRef,
    handleAvatarClick,
    handleFileChange,
  } = useAvatarUpload(async (file) => {
    // TODO: Implementar subida con Supabase Storage
    console.log("Uploading file:", file);
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar guardado con Supabase MCP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.dialog
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            open={isOpen}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-2xl z-[101] overflow-hidden flex flex-col"
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
            />

            <TabNavigation
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <ProfileTab
                      formData={formData}
                      setFormData={setFormData}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                      handleSave={handleSave}
                    />
                  )}
                  {activeTab === "medical" && (
                    <MedicalTab
                      formData={formData}
                      setFormData={setFormData}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                      handleSave={handleSave}
                    />
                  )}
                  {activeTab === "documents" && <DocumentsTab userId={userId} />}
                  {activeTab === "security" && (
                    <SecurityTab userEmail={userEmail} />
                  )}
                  {activeTab === "preferences" && <PreferencesTab />}
                  {activeTab === "privacy" && <PrivacyTab userId={userId} />}
                  {activeTab === "activity" && <ActivityTab userId={userId} />}
                  {activeTab === "billing" && <BillingTab userId={userId} />}
                </AnimatePresence>
              </div>
            </main>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  );
}
