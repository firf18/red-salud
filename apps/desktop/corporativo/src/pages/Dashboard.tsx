import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Building2,
    Activity,
    Clock,
    Megaphone,
    ChevronRight,
    Terminal,
    Shield,
    Database,
    Zap,
    Globe,
    Lock,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const StatCard = ({ label, value, icon: Icon, trend, color = 'blue', delay = 0, loading = false }: { label: string, value: string | number, icon: any, trend: string, color?: string, delay?: number, loading?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className="relative group h-full"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative bg-slate-900/40 backdrop-blur-md border border-white/[0.05] rounded-[2.5rem] p-8 h-full flex flex-col justify-between hover:border-blue-500/30 transition-all duration-500 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Icon className="h-32 w-32" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className="h-14 w-14 bg-slate-950/60 rounded-2xl flex items-center justify-center text-blue-500 border border-white/5 shadow-inner group-hover:scale-110 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all duration-500">
                    <Icon className="h-7 w-7" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${trend.startsWith('+') || trend === 'SECURE'
                    ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                    : trend === 'PENDING' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                    {trend}
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{label}</p>
                <div className="flex items-end gap-3">
                    {loading ? (
                        <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg" />
                    ) : (
                        <h3 className="text-4xl font-black text-white tracking-widest italic">{value}</h3>
                    )}
                    <div className="h-2 w-2 rounded-full bg-blue-500 mb-2 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.03] flex items-center gap-2 relative z-10">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Buffer de red activo</p>
            </div>
        </div>
    </motion.div>
);

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        poblacion: 0,
        farmacias: 0,
        tickets: 0,
        security: 'SECURE'
    });
    const [recentTickets, setRecentTickets] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [profilesRes, farmaciasRes, ticketsRes, activeTicketsRes, announcementsRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmacia'),
                supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
                supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(3),
                supabase.from('system_announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(2)
            ]);

            setStats({
                poblacion: profilesRes.count || 0,
                farmacias: farmaciasRes.count || 0,
                tickets: ticketsRes.count || 0,
                security: 'SECURE'
            });

            setRecentTickets(activeTicketsRes.data || []);
            setAnnouncements(announcementsRes.data || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Error al sincronizar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* System Status Banner */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Núcleo de Operaciones</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                        CENTRAL DE <span className="text-blue-500 not-italic">COMANDO</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs tracking-wide max-w-lg leading-relaxed uppercase opacity-70">
                        Monitorización perimétrica de la infraestructura Red-Salud. Estado crítico de nodos y flujo de datos biométricos en tiempo real.
                    </p>
                </div>

                <div className="flex items-center gap-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl">
                    <div className="flex flex-col gap-1 items-end">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Sistemas Estables</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pulse: {loading ? 'SYNCING...' : 'ACTIVE'}</p>
                    </div>
                    <div className="h-12 w-[1px] bg-white/5" />
                    <div className="flex items-center gap-4 text-slate-300">
                        <Clock className="h-6 w-6 text-blue-500" />
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-black italic">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} HRS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatCard label="Población Total" value={stats.poblacion.toLocaleString()} icon={Users} trend="+LIVE" delay={0.1} loading={loading} />
                <StatCard label="Nodos Farmacéuticos" value={stats.farmacias} icon={Building2} trend="NODES" delay={0.2} loading={loading} />
                <StatCard label="Tickets Soporte" value={stats.tickets} icon={Activity} trend="SUPPORT" delay={0.3} loading={loading} />
                <StatCard label="Integridad Sistema" value="100%" icon={Shield} trend="SECURE" delay={0.4} loading={loading} />
            </div>

            {/* Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Tactical Feed */}
                <div className="lg:col-span-2 relative group">
                    <div className="bg-slate-900/20 backdrop-blur-2xl border border-white/[0.05] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative min-h-[500px]">
                        <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />

                        <div className="p-10 border-b border-white/[0.05] flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Terminal de Solicitudes</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Buffer de verificación de nuevos nodos</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchDashboardData}
                                className="h-12 w-12 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center text-blue-500 hover:scale-105 transition-transform group/btn shadow-inner"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>

                        <div className="flex-1 p-8 space-y-4 relative z-10">
                            {recentTickets.length === 0 && !loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50 italic py-20">
                                    <Database className="h-12 w-12" />
                                    <p className="text-xs font-black uppercase tracking-widest">Sin solicitudes pendientes en el buffer</p>
                                </div>
                            ) : (
                                recentTickets.map((ticket, i) => (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="flex items-center gap-8 p-6 rounded-[2rem] hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.03] group/item"
                                    >
                                        <div className="h-14 w-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-blue-500 shadow-2xl group-hover/item:border-blue-500/20 transition-all">
                                            <Building2 className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-sm font-black text-white uppercase italic tracking-tight group-hover/item:text-blue-400 transition-colors">
                                                    {(ticket.metadata as any)?.pharmacyName || ticket.subject || 'Nueva Solicitud'}
                                                </p>
                                                <div className="h-1 w-1 rounded-full bg-slate-700" />
                                                <span className="text-[9px] font-black text-slate-500">REF: #{ticket.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-3 w-3 text-slate-600" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {(ticket.metadata as any)?.state || 'Sede Central'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-indigo-400">
                                                    <Database className="h-3 w-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {(ticket.metadata as any)?.rif || 'SIN RIF'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <div className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg ${ticket.status === 'open'
                                                ? 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                                                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                                                }`}>
                                                {ticket.status === 'open' ? 'Pendiente' : 'Completado'}
                                            </div>
                                            <span className="text-[10px] text-slate-600 font-bold italic uppercase tracking-tighter">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Cyber Security Widget */}
                <div className="space-y-8">
                    <div className="bg-slate-950/40 backdrop-blur-3xl border border-blue-500/20 rounded-[2.5rem] p-10 overflow-hidden relative group shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bóveda Central</h3>
                                    <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em] mt-1">Avisos y Protocolos</p>
                                </div>
                                <div className="h-12 w-12 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                    <Lock className="h-6 w-6 animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {announcements.length === 0 && !loading ? (
                                    <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl text-center">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Sin avisos activos</p>
                                    </div>
                                ) : (
                                    announcements.map((ann, i) => (
                                        <div key={ann.id} className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl relative overflow-hidden group/alert hover:bg-blue-600/10 transition-colors">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                <Megaphone className="h-12 w-12" />
                                            </div>
                                            <p className="text-xs font-black text-white mb-2 uppercase tracking-tight italic group-hover/alert:text-blue-400 transition-colors">{ann.title}</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter line-clamp-2">{ann.content}</p>
                                        </div>
                                    ))
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => window.location.href = '/announcements'}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all border border-blue-400/30"
                                >
                                    <Zap className="h-4 w-4 fill-white" />
                                    Gestionar Avisos
                                </motion.button>
                            </div>
                        </div>

                        {/* Futuristic UI elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-[1px] bg-gradient-to-r from-blue-500/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="bg-slate-900/20 border border-white/[0.03] rounded-3xl p-6 flex items-center gap-4 group hover:border-blue-500/20 transition-all">
                        <div className="h-12 w-12 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                            <Terminal className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Logs de Acceso</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase mt-0.5">Última conexión: LIVE hace 2m</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
