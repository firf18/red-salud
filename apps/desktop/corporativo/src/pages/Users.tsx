import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MoreVertical,
    Shield,
    User,
    MapPin,
    Calendar,
    Stethoscope,
    Building2,
    Heart,
    Lock,
    RefreshCw,
    Plus,
    X,
    Mail,
    UserPlus,
    ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Profile, Permissions, UserRole } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

// Using Profile from @/types

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const { accessLevel, isRoot } = usePermissions();
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        nombre_completo: '',
        role: 'corporate' as UserRole,
        access_level: 1,
        permissions: {
            can_manage_users: false,
            can_manage_roles: false,
            can_view_analytics: false,
            can_edit_settings: false,
            can_manage_medical_records: false,
            can_process_payments: false,
            can_manage_inventory: false,
            can_access_audit_logs: false,
            can_broadcast_announcements: false,
            can_configure_system: false
        } as Permissions
    });
    const [creating, setCreating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (roleFilter !== 'ALL') {
                query = query.eq('role', roleFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error al cargar la lista de usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            // 1. Sign up user in Auth
            const { error: authError } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        nombre_completo: newUser.nombre_completo,
                        role: newUser.role,
                        access_level: newUser.access_level,
                        permissions: newUser.permissions
                    }
                }
            });

            if (authError) throw authError;

            toast.success('Usuario creado exitosamente. Se ha enviado un correo de confirmación.');
            setShowAddModal(false);
            setNewUser({
                email: '',
                password: '',
                nombre_completo: '',
                role: 'corporate',
                access_level: 1,
                permissions: {
                    can_manage_users: false,
                    can_manage_roles: false,
                    can_view_analytics: false,
                    can_edit_settings: false,
                    can_manage_medical_records: false,
                    can_process_payments: false,
                    can_manage_inventory: false,
                    can_access_audit_logs: false,
                    can_broadcast_announcements: false,
                    can_configure_system: false
                }
            });
            fetchUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast.error(error.message || 'Error al crear usuario');
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.nombre_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'medico': return { icon: Stethoscope, text: 'Médico', color: 'blue' };
            case 'farmacia': return { icon: Building2, text: 'Farmacia', color: 'indigo' };
            case 'paciente': return { icon: Heart, text: 'Paciente', color: 'rose' };
            case 'admin': return { icon: Shield, text: 'Admin', color: 'emerald' };
            case 'corporate': return { icon: Lock, text: 'Corporativo', color: 'amber' };
            default: return { icon: User, text: role, color: 'slate' };
        }
    };

    const premiumEasing: any = [0.16, 1, 0.3, 1];

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto pb-20">
            {/* Tactical Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: premiumEasing }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-blue-500/50" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Personal de Operaciones</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase group transition-all">
                        DIRECTORIO <span className="text-blue-500 group-hover:text-blue-400 transition-colors">GLOBAL</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide max-w-xl uppercase">
                        Panel de monitoreo y control de identidades integradas en la red central de Red-Salud.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: premiumEasing }}
                    className="flex bg-slate-900/40 p-2 rounded-[2rem] border border-white/[0.05] backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar"
                >
                    {['ALL', 'medico', 'farmacia', 'paciente', 'admin'].map((role, idx) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-3 ${roleFilter === role
                                ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] scale-105'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <span className="opacity-40">0{idx + 1}</span>
                            {role === 'ALL' ? 'Todos los Rangos' : role}
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Tactical Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Activos', value: users.length, color: 'blue', icon: User },
                    { label: 'Escuadrón Médico', value: users.filter(u => u.role === 'medico').length, color: 'emerald', icon: Stethoscope },
                    { label: 'Nodos Farmacia', value: users.filter(u => u.role === 'farmacia').length, color: 'indigo', icon: Building2 },
                    { label: 'Cédulas Paciente', value: users.filter(u => u.role === 'paciente').length, color: 'rose', icon: Heart }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * (i + 1), ease: premiumEasing }}
                        className="group bg-slate-900/20 backdrop-blur-xl border border-white/[0.03] p-8 rounded-[2.5rem] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-10 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <stat.icon className="h-8 w-8 text-slate-500/30 mb-6 group-hover:text-blue-500/60 transition-colors" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Intelligence & Data Bar */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30" />

                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR IDENTIDAD POR NOMBRE O ENCRIPTACIÓN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-16 pr-6 text-xs font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchUsers}
                        className="p-4 bg-slate-950/60 border border-white/[0.03] rounded-2xl text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all flex-1 md:flex-none flex items-center justify-center font-black uppercase tracking-widest text-[10px]"
                    >
                        <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </motion.button>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 transition-all flex-1 md:flex-none whitespace-nowrap flex items-center gap-3"
                    >
                        <Plus className="h-5 w-5" />
                        Añadir Identidad
                    </button>
                </div>
            </div>

            {/* Tactical Grid Body */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.03] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none" />

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Identidad</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Rango / Rol</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Ubicación Táctica</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Fecha de Alta</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Protocolos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden relative">
                                                    <motion.div
                                                        animate={{ left: ['-100%', '100%'] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                        className="absolute inset-0 w-1/2 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                                    />
                                                </div>
                                                <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando Base de Datos...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, idx) => {
                                        const role = getRoleBadge(user.role);
                                        return (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                                className="group hover:bg-blue-600/[0.03] transition-all cursor-default"
                                            >
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-14 w-14 rounded-2xl bg-slate-950/80 border border-white/[0.05] flex items-center justify-center text-slate-600 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <User className="h-6 w-6 relative z-10" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-base font-black text-white tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{user.nombre_completo || 'SIN IDENTIFICAR'}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold tracking-widest">{user.email?.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-${role.color}-500/20 bg-${role.color}-500/5 text-${role.color}-500 inline-flex items-center gap-2.5`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full bg-${role.color}-500 animate-pulse`} />
                                                            <role.icon className="h-3.5 w-3.5" />
                                                            {role.text}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 px-3">
                                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                                <div
                                                                    key={lvl}
                                                                    className={`h-1 w-3 rounded-full ${lvl <= (user.access_level || 1) ? 'bg-blue-500' : 'bg-slate-800'}`}
                                                                />
                                                            ))}
                                                            <span className="text-[8px] font-black text-slate-500 uppercase ml-1">LVL {user.access_level || 1}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-3 text-slate-400">
                                                        <MapPin className="h-4 w-4 text-blue-500/40" />
                                                        <span className="text-[11px] font-black uppercase tracking-[0.15em] italic">{user.ciudad || 'N/A'}, {user.estado || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-3 text-slate-500 font-bold">
                                                        <Calendar className="h-4 w-4 opacity-50" />
                                                        <span className="text-[11px] uppercase tracking-widest">{new Date(user.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                                            className="p-3 bg-slate-950/40 border border-white/[0.05] rounded-xl text-slate-500 hover:text-blue-500 transition-all shadow-xl"
                                                        >
                                                            <Lock className="h-4.5 w-4.5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                                            className="p-3 bg-slate-950/40 border border-white/[0.05] rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"
                                                        >
                                                            <MoreVertical className="h-4.5 w-4.5" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Shield className="h-16 w-16 text-slate-600 mb-2" />
                                                <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.4em]">Sin Resultados de Inteligencia</p>
                                                <p className="text-[10px] text-slate-700 uppercase tracking-widest font-bold">No se detectaron perfiles que coincidan con los parámetros</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tactical Footer / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-white/[0.03]">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Encripción de Datos</p>
                        <p className="text-xs font-bold text-white tracking-widest">AES-256 MILITARY GRADE</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sincronización</p>
                        <p className="text-xs font-bold text-white tracking-widest">REAL-TIME QUANTUM LINK</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 justify-end">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estado de Seguridad</p>
                        <p className="text-xs font-black text-blue-500 tracking-[0.2em] italic uppercase">Acceso Nivel {accessLevel} {isRoot ? 'ROOT' : 'Autorizado'}</p>
                    </div>
                </div>
            </div>

            {/* NEW USER MODAL - ULTRA PREMIUM */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !creating && setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-slate-900/95 border border-white/[0.05] w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] relative flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
                                            <UserPlus className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Nueva Identidad</h2>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Autorización de Nivel {accessLevel} requerida</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-colors"
                                    >
                                        <X className="h-7 w-7" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-10 pb-10">
                                    {/* SECCIÓN 1: DATOS BÁSICOS */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-px w-8 bg-blue-500/30" />
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Información de Perfil</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/40 transition-all font-bold"
                                                        placeholder="EJ. JOHN DOE"
                                                        value={newUser.nombre_completo}
                                                        onChange={e => setNewUser({ ...newUser, nombre_completo: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email de Enlace</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                                    <input
                                                        required
                                                        type="email"
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/40 transition-all font-bold"
                                                        placeholder="nombre@redsalud.com"
                                                        value={newUser.email}
                                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Password Temporal</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                                    <input
                                                        required
                                                        type="password"
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/40 transition-all font-bold font-mono"
                                                        placeholder="••••••••••••"
                                                        value={newUser.password}
                                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Asignación de Rango</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewUser({ ...newUser, role: 'corporate' })}
                                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${newUser.role === 'corporate' ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/[0.02] border-white/[0.05] text-slate-500'}`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Corporativo</span>
                                                        <Lock className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewUser({ ...newUser, role: 'admin' })}
                                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${newUser.role === 'admin' ? 'bg-emerald-600/20 border-emerald-500/50 text-white' : 'bg-white/[0.02] border-white/[0.05] text-slate-500'}`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
                                                        <Shield className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECCIÓN 2: NIVEL DE ACCESO */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px w-8 bg-amber-500/30" />
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Jerarquía / Nivel de Acceso</span>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2.5rem] space-y-8">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-3xl font-black text-white italic tracking-tighter uppercase">NIVEL {newUser.access_level}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                        {newUser.access_level === 1 && 'Personal de Operaciones Base'}
                                                        {newUser.access_level === 2 && 'Supervisor de Módulo'}
                                                        {newUser.access_level === 3 && 'Gerente de Departamento'}
                                                        {newUser.access_level === 4 && 'Director de Operaciones'}
                                                        {newUser.access_level === 5 && 'Privilegios Root / Sistema Total'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1.5 h-10 items-end">
                                                    {[1, 2, 3, 4, 5].map((lvl) => (
                                                        <div
                                                            key={lvl}
                                                            className={`w-4 rounded-full transition-all duration-500 ${lvl <= newUser.access_level ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}
                                                            style={{ height: `${20 + lvl * 20}%` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                step="1"
                                                value={newUser.access_level}
                                                onChange={(e) => setNewUser({ ...newUser, access_level: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* SECCIÓN 3: PERMISOS TÁCTICOS */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px w-8 bg-emerald-500/30" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Atribuciones / Permisos Tácticos</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(newUser.permissions).map(([key, value]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setNewUser({
                                                        ...newUser,
                                                        permissions: { ...newUser.permissions, [key]: !value }
                                                    })}
                                                    className={`p-5 rounded-[1.5rem] border transition-all flex items-center justify-between group ${value ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-white/[0.02] border-white/[0.05] text-slate-500 hover:border-white/10'}`}
                                                >
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black uppercase tracking-widest">{key.replace(/can_/g, '').replace(/_/g, ' ')}</p>
                                                        <p className="text-[8px] opacity-40 font-bold uppercase tracking-tight mt-1">Status: {value ? 'Activado' : 'Bloqueado'}</p>
                                                    </div>
                                                    <div className={`h-6 w-10 rounded-full border border-white/10 relative transition-colors ${value ? 'bg-emerald-500' : 'bg-slate-900 shadow-inner'}`}>
                                                        <motion.div
                                                            animate={{ x: value ? 18 : 2 }}
                                                            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-lg"
                                                        />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            disabled={creating}
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-[2rem] py-6 text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(37,99,235,0.2)] transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                            {creating ? <RefreshCw className="h-6 w-6 animate-spin" /> : <>AUTORIZAR NUEVA IDENTIDAD <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" /></>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UsersPage;
