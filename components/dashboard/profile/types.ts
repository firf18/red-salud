// Tipos compartidos para el perfil de usuario

export type TabType =
  | "profile"
  | "medical"
  | "documents"
  | "security"
  | "preferences"
  | "privacy"
  | "activity"
  | "billing";

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userId?: string;
}

export interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  cedula: string;
  fechaNacimiento: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  tipoSangre: string;
  alergias: string;
  condicionesCronicas: string;
  medicamentosActuales: string;
  cirugiasPrevias: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
  relacionEmergencia: string;
}

export interface TabComponentProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSave: () => Promise<void>;
}

export interface DocumentStatus {
  id: number;
  type: string;
  name: string;
  status: "verified" | "pending" | "rejected" | "not_uploaded";
  uploadedAt: string | null;
  file: File | null;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  device: string;
  location: string;
  ip: string;
  timestamp: string;
  status: "success" | "failed";
}

export interface Session {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
  invoice: string;
}
