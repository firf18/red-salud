export type UserRole = 'medico' | 'paciente' | 'farmacia' | 'laboratorio' | 'clinica' | 'aseguradora' | 'ambulancia' | 'admin' | 'corporate';

export interface Permissions {
    can_edit_users?: boolean;
    can_delete_users?: boolean;
    can_approve_pharmacies?: boolean;
    can_view_analytics?: boolean;
    can_manage_roles?: boolean;
    can_manage_system_announcements?: boolean;
    [key: string]: boolean | undefined;
}

export interface Profile {
    id: string;
    email: string | null;
    nombre_completo: string | null;
    role: UserRole;
    telefono: string | null;
    fecha_nacimiento: string | null;
    especialidad: string | null;
    licencia_medica: string | null;
    direccion: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    cedula: string | null;
    ciudad: string | null;
    estado: string | null;
    codigo_postal: string | null;
    cedula_verificada: boolean;
    sacs_verificado: boolean;
    access_level: number;
    permissions: Permissions;
}

export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data: any;
    new_data: any;
    severity: 'info' | 'warning' | 'critical';
    ip_address: string;
    created_at: string;
    profiles?: {
        nombre_completo: string | null;
        email: string | null;
    };
}
