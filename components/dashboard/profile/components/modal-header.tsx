import { X, Camera } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ModalHeaderProps {
  userName: string;
  userEmail: string;
  onClose: () => void;
  avatarHover: boolean;
  onAvatarHover: (hover: boolean) => void;
  onAvatarClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ModalHeader({
  userName,
  userEmail,
  onClose,
  avatarHover,
  onAvatarHover,
  onAvatarClick,
  fileInputRef,
  onFileChange,
}: ModalHeaderProps) {
  return (
    <>
      {/* Header with gradient */}
      <header className="relative h-32 bg-gradient-to-br from-blue-600 to-teal-600 shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Avatar Section */}
      <section className="relative px-8 -mt-16 shrink-0">
        <div
          className="relative inline-block"
          onMouseEnter={() => onAvatarHover(true)}
          onMouseLeave={() => onAvatarHover(false)}
        >
          <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-4xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {avatarHover && (
            <button
              onClick={onAvatarClick}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity"
              aria-label="Cambiar foto de perfil"
            >
              <Camera className="h-7 w-7 text-white" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            aria-label="Seleccionar imagen"
          />
        </div>
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
      </section>
    </>
  );
}
