import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    MoreVertical,
    MapPin,
    Phone,
    User,
    ShieldCheck,
    AlertCircle,
    Server,
    Database,
    Cpu,
    Activity,
    Copy,
    Eye,
    EyeOff,
    ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PharmacyRequest {
    id: string;
    pharmacy_name: string;
    rif: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    owner_name: string;
    status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    created_at: string;
    subscription_type?: 'none' | 'demo' | 'real';
    trial_expires_at?: string;
}

const PharmaciesPage: React.FC = () => {
    const [requests, setRequests] = useState<PharmacyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDIENTE' | 'ALL'>('PENDIENTE');
    const [searchTerm, setSearchTerm] = useState('');
    const premiumEasing: any = [0.16, 1, 0.3, 1];

    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; pharmacy: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('support_tickets')
                .select('*')
                .eq('subject', 'empresas')
                .order('created_at', { ascending: false });

            if (filter === 'PENDIENTE') {
                query = query.eq('status', 'NUEVO');
            }

            const { data, error } = await query;
            if (error) throw error;

            // Fetch profiles to get trial info
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('rif, subscription_type, trial_expires_at')
                .eq('role', 'farmacia');

            const profileMap = new Map();
            profilesData?.forEach(p => {
                if (p.rif) {
                    const normalized = p.rif.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    profileMap.set(normalized, p);
                }
            });

            // Map support tickets to pharmacy requests
            const mappedData: PharmacyRequest[] = (data || []).map(ticket => {
                const rif = ticket.metadata?.rif || 'N/A';
                const normalizedRif = rif.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const profile = profileMap.get(normalizedRif);

                return {
                    id: ticket.id,
                    pharmacy_name: ticket.name,
                    rif: rif,
                    address: ticket.message || '',
                    city: ticket.metadata?.city || 'N/A',
                    state: ticket.metadata?.state || 'N/A',
                    phone: ticket.phone,
                    owner_name: ticket.metadata?.legalRepName || ticket.name,
                    status: ticket.status === 'NUEVO' ? 'PENDIENTE' :
                        ticket.status === 'APROBADO' ? 'APROBADO' : 'RECHAZADO',
                    created_at: ticket.created_at,
                    subscription_type: profile?.subscription_type,
                    trial_expires_at: profile?.trial_expires_at
                };
            });

            setRequests(mappedData);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Error al cargar las solicitudes');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, newStatus: 'APROBADO' | 'RECHAZADO') => {
        try {
            const request = requests.find(r => r.id === id);
            if (!request) throw new Error('Solicitud no encontrada');

            if (newStatus === 'APROBADO') {
                // 1. Generate credentials
                const normalizedRif = request.rif.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const generatedEmail = `ph.${normalizedRif}@red-salud.corp`;
                const generatedPassword = Math.random().toString(36).slice(-10) + '!A1';

                // 2. Create user in Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: generatedEmail,
                    password: generatedPassword,
                    options: {
                        data: {
                            nombre_completo: request.pharmacy_name,
                            role: 'farmacia',
                            access_level: 1,
                            rif: request.rif,
                            subscription_type: 'demo',
                            trial_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        }
                    }
                });

                if (authError) {
                    if (authError.message.includes('already registered')) {
                        toast.error('Esta farmacia ya tiene una cuenta asociada');
                        return;
                    }
                    throw authError;
                }

                // 3. Log to audit_logs
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from('audit_logs').insert({
                    action: 'APPROVE_PHARMACY',
                    entity_type: 'PHARMACY',
                    entity_id: id,
                    user_id: user?.id,
                    new_data: { email: generatedEmail, pharmacy: request.pharmacy_name }
                });

                // 4. Update ticket status
                const { error: ticketError } = await supabase
                    .from('support_tickets')
                    .update({ status: newStatus })
                    .eq('id', id);

                if (ticketError) throw ticketError;

                // 5. Show credentials to the admin
                setCreatedCredentials({
                    email: generatedEmail,
                    password: generatedPassword,
                    pharmacy: request.pharmacy_name
                });
                setShowCredentialsModal(true);
                toast.success('Farmacia aprobada y cuenta creada');
            } else {
                const { error } = await supabase
                    .from('support_tickets')
                    .update({ status: newStatus })
                    .eq('id', id);

                if (error) throw error;
                toast.success('Solicitud rechazada');
            }

            fetchRequests();
        } catch (error: any) {
            console.error('Error handling action:', error);
            toast.error(error.message || 'Error al actualizar el estado');
        }
    };

    const filteredRequests = requests.filter(req =>
        req.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.rif.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="space-y-10">
            {/* Header with System Stats */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Infraestructura de Red</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        CONTROL DE <span className="text-blue-500 not-italic">SEDES</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs tracking-wide max-w-lg leading-relaxed uppercase opacity-70">
                        Administración centralizada de nodos farmacéuticos. Verifique la integridad legal y operativa antes de la autorización.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/[0.03] p-4 rounded-3xl flex items-center gap-4 min-w-[180px]">
                            <div className="h-10 w-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activas</p>
                                <p className="text-xl font-black text-white italic">142</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/[0.03] p-4 rounded-3xl flex items-center gap-4 min-w-[180px]">
                            <div className="h-10 w-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendientes</p>
                                <p className="text-xl font-black text-white italic">{requests.filter(r => r.status === 'PENDIENTE').length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Control Bar */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-50" />

                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/60" />
                    <input
                        type="text"
                        placeholder="BUSCAR NODOS POR NOMBRE O RIF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/[0.05] rounded-2xl py-4 pl-14 pr-6 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/30 transition-all font-black tracking-widest uppercase"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/[0.05]">
                        <button
                            onClick={() => setFilter('PENDIENTE')}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'PENDIENTE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Ver Pendientes
                        </button>
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Historial Total
                        </button>
                    </div>

                    <button className="flex items-center gap-3 px-6 py-4 bg-slate-950/40 hover:bg-slate-800 transition-all rounded-2xl border border-white/[0.05] group/btn">
                        <Filter className="h-4 w-4 text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filtros</span>
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.03] rounded-[2.5rem] overflow-hidden shadow-inner relative">
                <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />

                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="h-20 w-20 border-t-2 border-r-2 border-blue-500/40 border-l-2 border-b-2 border-transparent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Cpu className="h-8 w-8 text-blue-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-white text-[11px] font-black uppercase tracking-[0.4em]">Sincronizando Bóveda</p>
                            <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ left: ['-100%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative h-full w-1/2 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                                />
                            </div>
                        </div>
                    </div>
                ) : filteredRequests.length > 0 ? (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.05] bg-slate-950/40">
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Identificación Nodo</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Ubicación Geo</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Operador Responsable</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Status Operativo</th>
                                    <th className="px-10 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                <AnimatePresence mode="popLayout">
                                    {filteredRequests.map((req, idx) => (
                                        <motion.tr
                                            key={req.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.5, ease: premiumEasing }}
                                            className="group hover:bg-blue-600/[0.03] transition-colors relative"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        <div className="absolute -inset-2 bg-blue-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <div className="relative h-14 w-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-blue-500 group-hover:scale-105 group-hover:border-blue-500/30 transition-all shadow-2xl">
                                                            <Building2 className="h-7 w-7" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{req.pharmacy_name}</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-4 w-[2px] bg-blue-600/40" />
                                                            <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase">ID: {req.rif}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-white/80">
                                                        <MapPin className="h-3 w-3 text-blue-500" />
                                                        <span className="text-[11px] font-black uppercase tracking-wide">{req.city}, <span className="text-blue-500/60 font-medium">{req.state}</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 font-bold max-w-[200px] truncate uppercase tracking-tighter">{req.address}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center group-hover:border-blue-500/20 transition-colors">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{req.owner_name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-slate-700" />
                                                            <p className="text-[10px] text-slate-600 font-bold tracking-widest">{req.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <motion.div
                                                    initial={false}
                                                    className={`inline-flex items-center gap-3 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl ${req.status === 'PENDIENTE'
                                                        ? 'bg-amber-500/5 text-amber-500 border-amber-500/20 shadow-amber-900/5'
                                                        : req.status === 'APROBADO'
                                                            ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-emerald-900/5'
                                                            : 'bg-red-500/5 text-red-500 border-red-500/20 shadow-red-900/5'
                                                        }`}
                                                >
                                                    <div className={`h-1.5 w-1.5 rounded-full ${req.status === 'PENDIENTE' ? 'bg-amber-500 animate-pulse' : req.status === 'APROBADO' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {req.status}
                                                </motion.div>
                                                {req.subscription_type && req.subscription_type !== 'none' && (
                                                    <div className="flex flex-col gap-1 mt-2">
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border w-fit uppercase tracking-widest ${req.subscription_type === 'demo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            }`}>
                                                            MODO {req.subscription_type === 'demo' ? 'TRIAL' : 'PRO'}
                                                        </span>
                                                        {req.trial_expires_at && (
                                                            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-tighter pl-1">
                                                                Expira: {new Date(req.trial_expires_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center justify-end gap-3">
                                                    {req.status === 'PENDIENTE' ? (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAction(req.id, 'APROBADO')}
                                                                className="h-12 w-12 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 transition-all shadow-lg group/btn"
                                                            >
                                                                <CheckCircle2 className="h-6 w-6" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAction(req.id, 'RECHAZADO')}
                                                                className="h-12 w-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 transition-all shadow-lg"
                                                            >
                                                                <XCircle className="h-6 w-6" />
                                                            </motion.button>
                                                        </>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            className="h-12 w-12 flex items-center justify-center bg-slate-950/60 hover:bg-slate-800 text-slate-500 transition-all rounded-2xl border border-white/[0.05]"
                                                        >
                                                            <MoreVertical className="h-5 w-5" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 bg-slate-800/20 rounded-full blur-3xl" />
                            <div className="relative h-32 w-32 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center text-slate-800 shadow-3xl">
                                <Database className="h-16 w-16" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter italic">Base de Datos Vacía</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                            No se detectan solicitudes {filter === 'PENDIENTE' ? 'pendientes' : ''} en el buffer del sistema.
                        </p>
                    </div>
                )}
            </div>

            {/* Tactical Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                <div className="p-6 bg-slate-900/20 border border-white/[0.03] rounded-3xl flex items-center gap-5">
                    <ShieldCheck className="h-6 w-6 text-blue-500/60" />
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo Legal</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 leading-tight tracking-tighter">Validación biométrica contra base de datos central activa.</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-900/20 border border-white/[0.03] rounded-3xl flex items-center gap-5">
                    <Server className="h-6 w-6 text-emerald-500/60" />
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Sincronización</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 leading-tight tracking-tighter">Latencia de red optimizada para despliegue regional.</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-900/20 border border-white/[0.03] rounded-3xl flex items-center gap-5">
                    <AlertCircle className="h-6 w-6 text-amber-500/60" />
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Alerta de Seguridad</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 leading-tight tracking-tighter">Reporte cualquier anomalía en los datos del RIF de inmediato.</p>
                    </div>
                </div>
            </div>

            {/* Credentials Modal */}
            <AnimatePresence>
                {showCredentialsModal && createdCredentials && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />

                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Acceso Autorizado</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Credenciales Generadas para la Sede</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-950/60 rounded-3xl border border-white/[0.03] space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1">ID de Acceso (Email)</label>
                                            <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 rounded-xl border border-white/[0.05]">
                                                <span className="flex-1 text-xs font-bold text-blue-400 truncate">{createdCredentials.email}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(createdCredentials.email);
                                                        toast.success('Email copiado');
                                                    }}
                                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1">Llave Maestra Temporal</label>
                                            <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 rounded-xl border border-white/[0.05]">
                                                <span className="flex-1 text-xs font-mono font-bold text-emerald-400">
                                                    {showPassword ? createdCredentials.password : '••••••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(createdCredentials.password);
                                                        toast.success('Contraseña copiada');
                                                    }}
                                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-4">
                                        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                            Estas credenciales son de un solo uso para la activación inicial. Por protocolo de seguridad, el operador deberá cambiar la contraseña tras el primer acceso. <span className="text-blue-500 font-black">Periodo Demo: 30 días activado.</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowCredentialsModal(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Optional: download as text file or send via email logic
                                            toast.info('Función de envío en desarrollo');
                                        }}
                                        className="flex-[1.5] py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Compartir Acceso
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PharmaciesPage;
