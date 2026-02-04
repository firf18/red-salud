import React, { useState, useEffect } from 'react';
import { Bell, Database, Globe, User, Save, RefreshCcw, Shield, Users, Activity, Search, ShieldCheck, Key, Filter, Clock, Eye, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Profile, AuditLog, UserRole } from '@/types';
import { toast } from 'sonner';
import { X, Mail, Lock, UserPlus } from 'lucide-react';

interface UserRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre_completo: '',
        role: 'corporate' as UserRole,
        access_level: 1,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedCreds, setGeneratedCreds] = useState<{ email: string; pass: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Generar credenciales automáticas
            const suffix = Math.random().toString(36).slice(-4);
            const userNameSlug = formData.nombre_completo.toLowerCase().split(' ')[0] || 'user';
            const generatedEmail = `${userNameSlug}.${suffix}@red-salud.corp`;
            const generatedPassword = `RS.${Math.random().toString(36).slice(-8).toUpperCase()}!`;

            // 1. Crear usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: generatedEmail,
                password: generatedPassword,
                options: {
                    data: {
                        nombre_completo: formData.nombre_completo,
                        role: formData.role,
                        access_level: formData.access_level,
                    }
                }
            });

            if (authError) throw authError;

            // 2. Registrar en Auditoría
            await supabase.from('audit_logs').insert({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                action: 'CREATE_IDENTITY',
                entity_type: 'profile',
                entity_id: authData.user?.id || 'unknown',
                severity: 'info',
                new_data: { ...formData, email: generatedEmail }
            });

            setGeneratedCreds({ email: generatedEmail, pass: generatedPassword });
            toast.success('Identidad generada exitosamente');
            onSuccess();
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast.error('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                <div className="p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/20">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Nueva Identidad</h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Configuración de perfil administrativo</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    {!generatedCreds ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nombre del Operador</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.nombre_completo}
                                            onChange={e => setFormData({ ...formData, nombre_completo: e.target.value.toUpperCase() })}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all uppercase"
                                            placeholder="EJ. CARLOS RODRIGUEZ"
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter px-1">
                                        El sistema generará una identidad digital única basada en este nombre.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nivel de Acceso</label>
                                        <select
                                            value={formData.access_level}
                                            onChange={e => setFormData({ ...formData, access_level: parseInt(e.target.value) })}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                                        >
                                            {[1, 2, 3, 4, 5].map(lvl => (
                                                <option key={lvl} value={lvl} className="bg-slate-900">Nivel {lvl}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Rol Operativo</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                                        >
                                            <option value="corporate" className="bg-slate-900">Corporativo</option>
                                            <option value="admin" className="bg-slate-900">Administrador</option>
                                            <option value="auditor" className="bg-slate-900">Auditor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 border border-blue-400/30 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
                                >
                                    {isSubmitting ? (
                                        <RefreshCcw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Generar Identidad Digital'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-8 py-4">
                            <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl text-center space-y-4">
                                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase italic">Identidad Creada</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                                    El operador podrá personalizar estas credenciales desde su panel de perfil.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Usuario / Correo</p>
                                    <div className="flex items-center justify-between">
                                        <code className="text-sm font-black text-white tracking-wider font-mono">{generatedCreds.email}</code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(generatedCreds.email);
                                                toast.success('Usuario copiado');
                                            }}
                                            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <Save className="h-4 w-4 text-slate-500" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Clave Temporal</p>
                                    <div className="flex items-center justify-between">
                                        <code className="text-xl font-black text-blue-500 tracking-wider font-mono">{generatedCreds.pass}</code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(generatedCreds.pass);
                                                toast.success('Clave copiada');
                                            }}
                                            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <Save className="h-4 w-4 text-slate-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
                            >
                                Finalizar
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

interface IdentityManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Profile | null;
    onSuccess: () => void;
}

const IdentityManagementModal: React.FC<IdentityManagementModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const [newEmail, setNewEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) setNewEmail(user.email || '');
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            // we use the supabase service role or admin api if available, 
            // but here we simulate the intention for the corporate flow
            const updates: any = {};
            if (newEmail !== user.email) updates.email = newEmail;
            if (newPass) updates.password = newPass;

            if (Object.keys(updates).length === 0) {
                toast.error('No hay cambios para aplicar');
                return;
            }

            // Note: In a real production app, this would call a secure edge function 
            // since users shouldn't be able to update other users' auth data directly.
            // For now, we interact with the profile and log the intent.
            const { error } = await supabase.from('profiles').update({
                email: newEmail,
                updated_at: new Date().toISOString()
            }).eq('id', user.id);

            if (error) throw error;

            await supabase.from('audit_logs').insert({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                action: 'UPDATE_IDENTITY',
                entity_type: 'profile',
                entity_id: user.id,
                severity: 'warning',
                new_data: updates
            });

            toast.success('Identidad actualizada localmente. (Nota: Cambios de Auth requieren permisos de admin)');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2rem] p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-600/10 rounded-2xl text-amber-500">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase italic">Gestionar Credenciales</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{user.nombre_completo}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Usuario / Email</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nueva Clave (Opcional)</label>
                        <input
                            type="password"
                            placeholder="Dejar vacío para no cambiar"
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg"
                    >
                        {isSubmitting ? 'Procesando...' : 'Guardar Cambios'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all"
                    >
                        Cancelar
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'users' | 'audit' | 'security'>('general');
    const [users, setUsers] = useState<Profile[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<Profile | null>(null);

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'audit', label: 'Auditoría', icon: Activity },
        { id: 'security', label: 'Seguridad', icon: Shield },
    ];

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'users') {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('access_level', { ascending: false });
                if (error) throw error;
                setUsers(data || []);
            } else if (activeTab === 'audit') {
                const { data, error } = await supabase
                    .from('audit_logs')
                    .select('*, profiles(nombre_completo, email)')
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (error) throw error;
                setLogs(data || []);
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast.error('Error al cargar datos: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <UserRegistrationModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSuccess={() => fetchData()}
            />
            <IdentityManagementModal
                isOpen={!!selectedUserForEdit}
                onClose={() => setSelectedUserForEdit(null)}
                user={selectedUserForEdit}
                onSuccess={() => fetchData()}
            />
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-blue-600 rounded-full" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Panel de Control</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                            CONFIGURACIÓN <span className="text-blue-500 not-italic">SISTEMA</span>
                        </h1>
                    </div>

                    <div className="flex bg-slate-900/40 backdrop-blur-xl border border-white/[0.05] p-1.5 rounded-[2rem]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all relative ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-600 rounded-2xl -z-10 shadow-lg shadow-blue-600/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-50'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-8">
                                {/* General Settings */}
                                <section className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-10 space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/20">
                                            <Globe className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Parámetros Globales</h2>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Configuración base de la infraestructura</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Organización</label>
                                            <input
                                                type="text"
                                                defaultValue="RED SALUD CORPORATÍVO"
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificador Regional</label>
                                            <input
                                                type="text"
                                                defaultValue="LATAM-VZ-01"
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-700 hover:border-white/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                                        <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-all">
                                            Restaurar
                                        </button>
                                        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 border border-blue-400/30 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                                            <Save className="h-4 w-4" />
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </section>

                                {/* Notification Settings */}
                                <section className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-600/10 rounded-2xl text-amber-500 border border-amber-500/20">
                                            <Bell className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Protocolos de Alerta</h2>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Gestión de notificaciones push y críticas</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'Alertas de Seguridad Crítica', desc: 'Notificar inmediatamente fallos en el vault masestro', active: true },
                                            { label: 'Nuevos Nodos Farmacéuticos', desc: 'Notificar cuando una farmacia solicita acceso', active: true },
                                            { label: 'Reportes de Sistema Semanales', desc: 'Envío automático de analíticas por correo', active: false },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-slate-950/30 border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all">
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{item.label}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 italic uppercase mt-1">{item.desc}</p>
                                                </div>
                                                <div className={`h-6 w-12 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                {/* Database Health Widget */}
                                <div className="bg-slate-950/40 backdrop-blur-3xl border border-emerald-500/20 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Database className="h-24 w-24" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Estado Database</h3>
                                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-8">Conexión Supabase Activa</p>

                                    <div className="space-y-6 relative z-10">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latencia Media</span>
                                            <span className="text-xl font-black text-white italic">24ms</span>
                                        </div>
                                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        </div>

                                        <button className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all">
                                            <RefreshCcw className="h-4 w-4" />
                                            Re-Sincronizar Indices
                                        </button>
                                    </div>
                                </div>

                                {/* User Profile Summary */}
                                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/[0.05] rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                                    <div className="h-20 w-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
                                        <User className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase italic">Root Admin</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mb-6 italic">Master Authority - Sector 01</p>

                                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Cambiar Credenciales
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Stats for Users */}
                                {[
                                    { label: 'Total Usuarios', val: users.length.toString(), icon: Users, color: 'blue' },
                                    { label: 'Admin Root', val: users.filter(u => u.access_level === 5).length.toString(), icon: ShieldCheck, color: 'amber' },
                                    { label: 'Niveles 1-3', val: users.filter(u => u.access_level > 0 && u.access_level < 4).length.toString(), icon: User, color: 'emerald' },
                                    { label: 'Sesiones Activas', val: '4', icon: Activity, color: 'purple' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-900/20 border border-white/[0.05] p-6 rounded-[2rem] flex items-center gap-4">
                                        <div className={`p-4 bg-${stat.color}-600/10 rounded-2xl text-${stat.color}-500 border border-${stat.color}-500/20`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-2xl font-black text-white italic">{stat.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <section className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] overflow-hidden">
                                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Directorio Administrativo</h2>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Gestión de identidades corporativas y privilegios</p>
                                    </div>
                                    <button
                                        onClick={() => setIsUserModalOpen(true)}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 border border-blue-400/30 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        + Nueva Identidad
                                    </button>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-950/30">
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Identidad</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Nivel</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Estado</th>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={4} className="px-10 py-20 text-center">
                                                        <RefreshCcw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cargando Directorio...</p>
                                                    </td>
                                                </tr>
                                            ) : users.map((user, i) => (
                                                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-white uppercase overflow-hidden">
                                                                {user.avatar_url ? (
                                                                    <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    user.nombre_completo?.[0] || '?'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-white uppercase">{user.nombre_completo || 'Sin Nombre'}</p>
                                                                <p className="text-[10px] font-bold text-slate-500 italic lowercase">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-500">LVL {user.access_level}</span>
                                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{user.role}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <span className={`h-2 w-2 rounded-full inline-block mr-2 ${user.access_level > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.access_level > 0 ? 'ACTIVO' : 'RESTRINGIDO'}</span>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <button
                                                            onClick={() => setSelectedUserForEdit(user)}
                                                            className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all"
                                                            title="Gestionar Identidad"
                                                        >
                                                            <Key className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all" title="Ver Permisos">
                                                            <Shield className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="space-y-8">
                            <section className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-10 space-y-8">
                                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-600/10 rounded-2xl text-purple-500 border border-purple-500/20">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Audit Log</h2>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Traza de eventos críticos e integridad del sistema</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="BUSCAR EVENTO..."
                                                className="bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black text-white outline-none w-64 focus:border-purple-500/50 transition-all uppercase"
                                            />
                                        </div>
                                        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">
                                            <Filter className="h-4 w-4" />
                                            Filtros
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {isLoading ? (
                                        <div className="py-20 text-center">
                                            <RefreshCcw className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consultando Logs...</p>
                                        </div>
                                    ) : logs.length === 0 ? (
                                        <div className="py-20 text-center border border-white/5 rounded-3xl bg-slate-950/20">
                                            <Activity className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No hay eventos registrados</p>
                                        </div>
                                    ) : logs.map((log, i) => (
                                        <div key={log.id} className="flex items-center gap-6 p-6 bg-slate-950/30 border border-white/5 rounded-3xl hover:border-purple-500/20 transition-all group">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${log.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                log.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                    'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                }`}>
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                                                        {log.profiles?.nombre_completo || 'Sistema'}
                                                    </span>
                                                    <span className="h-1 w-1 bg-slate-700 rounded-full" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase italic">{log.action}</span>
                                                </div>
                                                <p className="text-sm font-black text-white uppercase mt-1">
                                                    Target: <span className="text-purple-500 italic font-medium">{log.entity_type} [{log.entity_id.slice(0, 8)}]</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </p>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${log.severity === 'critical' ? 'bg-red-500 text-white' :
                                                    log.severity === 'warning' ? 'bg-amber-500 text-black' :
                                                        'bg-blue-500 text-white'
                                                    }`}>
                                                    {log.severity}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-white/5 flex justify-center">
                                    <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-all flex items-center gap-2">
                                        Cargar más Eventos
                                        <RefreshCcw className="h-3 w-3" />
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-10">
                            <section className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-600/10 rounded-2xl text-red-500 border border-red-500/20">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Protocolos de Alta Seguridad</h2>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Gestión del motor de cifrado y claves maestras</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-white uppercase">Clave Maestra de Emergencia</h3>
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-500 rounded text-[8px] font-black uppercase">Crítico</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                                            Esta clave permite el bypass total del sistema en caso de pérdida de DB. Su rotación invalida todas las sesiones activas.
                                        </p>
                                        <button className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">
                                            Rotar Clave Maestra
                                        </button>
                                    </div>

                                    <div className="p-8 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-white uppercase">Doble Factor Autenticación (2FA)</h3>
                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-[8px] font-black uppercase">Recomendado</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                                            Forzar el uso de 2FA para todos los usuarios con nivel de acceso superior a LVL 3.
                                        </p>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Estado: Desactivado</span>
                                            <button className="h-6 w-12 bg-slate-800 rounded-full p-1 cursor-pointer transition-colors hover:bg-slate-700">
                                                <div className="h-4 w-4 bg-white rounded-full" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-600/10 rounded-2xl text-amber-500 border border-amber-500/20">
                                        <Eye className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Sistemas de Monitoreo</h2>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Detección de intrusiones y anomalías</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { name: 'Detección de Login Foráneo', active: true, desc: 'Notificar si hay accesos desde IPs no registradas' },
                                        { name: 'Rate Limiting Avanzado', active: true, desc: 'Limitar peticiones por minuto a 100/sec' },
                                        { name: 'Modo Pánico', active: false, desc: 'Bloqueo inmediato de todas las conexiones externas' },
                                    ].map((policy, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-slate-950/10 border border-white/5 rounded-3xl">
                                            <div>
                                                <h4 className="text-xs font-black text-white uppercase">{policy.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-600 uppercase mt-1 italic">{policy.desc}</p>
                                            </div>
                                            <div className={`h-6 w-12 rounded-full p-1 transition-colors ${policy.active ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${policy.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SettingsPage;
