import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    MapPin,
    Phone,
    User,
    ShieldCheck,
    Activity,
    BarChart3,
    Package,
    TrendingUp,
    Ticket,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    Lock,
    XCircle,
    Copy,
    Eye,
    EyeOff,
    ExternalLink,
    MoreVertical,
    Server,
    Database,
    Cpu,
    Store,
    AlertCircle
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
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

interface ActiveBranch {
    id: string;
    name: string;
    rif: string;
    address: string;
    city: string;
    state: string;
    manager: string;
    status: 'active' | 'inactive';
    subscription: string;
}

// Mock data for metrics - In a real scenario, this would come from Supabase
const revenueData = [
    { name: 'Lun', ingresos: 4500, ventas: 3200 },
    { name: 'Mar', ingresos: 5200, ventas: 3800 },
    { name: 'Mie', ingresos: 4800, ventas: 3100 },
    { name: 'Jue', ingresos: 6100, ventas: 4200 },
    { name: 'Vie', ingresos: 5800, ventas: 3900 },
    { name: 'Sab', ingresos: 7200, ventas: 4800 },
    { name: 'Dom', ingresos: 6500, ventas: 4100 },
];

const inventoryData = [
    { category: 'Antibióticos', stock: 85, ideal: 100 },
    { category: 'Analgésicos', stock: 92, ideal: 100 },
    { category: 'Pediatría', stock: 45, ideal: 100 },
    { category: 'Higiene', stock: 78, ideal: 100 },
    { category: 'Cardio', stock: 62, ideal: 100 },
];

const premiumEasing: any = [0.16, 1, 0.3, 1];

const PharmacyHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'branches' | 'analytics'>('overview');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Requests state
    const [requests, setRequests] = useState<PharmacyRequest[]>([]);
    const [filter, setFilter] = useState<'PENDIENTE' | 'ALL'>('PENDIENTE');

    // Credentials state
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; pharmacy: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Active Branches state
    const [activeBranches, setActiveBranches] = useState<ActiveBranch[]>([]);

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchRequests();
        } else if (activeTab === 'branches') {
            fetchActiveBranches();
        } else {
            // Simulate loading for overview/analytics
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 800);
            return () => clearTimeout(timer);
        }
    }, [activeTab, filter]);

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

            const mappedData: PharmacyRequest[] = (data || []).map(ticket => {
                const rif = ticket.metadata?.rif || 'N/A';
                const normalizedRif = rif.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const profile = profileMap.get(normalizedRif);

                return {
                    id: ticket.id,
                    pharmacy_name: ticket.name || 'Sin nombre',
                    rif: rif,
                    address: (ticket.metadata?.address || ticket.message || 'N/A'),
                    city: ticket.metadata?.city || 'N/A',
                    state: ticket.metadata?.state || 'N/A',
                    phone: ticket.phone || 'N/A',
                    owner_name: (ticket.metadata?.owner_name || ticket.metadata?.legalRepName || ticket.name || 'N/A'),
                    status: ticket.status === 'NUEVO' ? 'PENDIENTE' :
                        ticket.status === 'APROBADO' ? 'APROBADO' :
                            (ticket.status as any || 'PENDIENTE'),
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

    const fetchActiveBranches = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'farmacia');

            if (error) throw error;

            const mappedBranches: ActiveBranch[] = (data || []).map(p => ({
                id: p.id,
                name: p.nombre_completo || 'Sede Innominada',
                rif: p.rif || 'N/A',
                address: p.direccion || 'Sin dirección registrada',
                city: p.ciudad || 'N/A',
                state: p.estado || 'N/A',
                manager: 'Por asignar',
                status: 'active',
                subscription: p.subscription_type || 'demo'
            }));

            setActiveBranches(mappedBranches);
        } catch (error) {
            console.error('Error fetching active branches:', error);
            toast.error('Error al cargar sedes activas');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, newStatus: 'APROBADO' | 'RECHAZADO') => {
        try {
            const request = requests.find(r => r.id === id);
            if (!request) throw new Error('Solicitud no encontrada');

            if (newStatus === 'APROBADO') {
                const normalizedRif = request.rif.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const generatedEmail = `ph.${normalizedRif}@red-salud.corp`;
                const generatedPassword = Math.random().toString(36).slice(-10) + '!A1';

                const { error: authError } = await supabase.auth.signUp({
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

                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from('audit_logs').insert({
                    action: 'APPROVE_PHARMACY',
                    entity_type: 'PHARMACY',
                    entity_id: id,
                    user_id: user?.id,
                    new_data: { email: generatedEmail, pharmacy: request.pharmacy_name }
                });

                const { error: ticketError } = await supabase
                    .from('support_tickets')
                    .update({ status: newStatus })
                    .eq('id', id);

                if (ticketError) throw ticketError;

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

    const tabs = [
        { id: 'overview', label: 'VISTA GLOBAL', icon: Globe },
        { id: 'requests', label: 'SOLICITUDES', icon: Clock },
        { id: 'branches', label: 'SEDES ACTIVAS', icon: Building2 },
        { id: 'analytics', label: 'INTELIGENCIA', icon: BarChart3 },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header Tactical Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: premiumEasing }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-blue-500/50" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Gestión de Infraestructura</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase group transition-all">
                        HUB DE <span className="text-blue-500 group-hover:text-blue-400 transition-colors">FARMACIAS</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide max-w-xl uppercase leading-relaxed font-sans">
                        Centro de comando centralizado para monitoreo, validación y escalamiento de la red farmacéutica corporativa.
                    </p>
                </motion.div>

                {/* Tab Navigation Premium */}
                <div className="flex bg-slate-900/40 p-1.5 rounded-[2rem] border border-white/[0.05] backdrop-blur-3xl shadow-2xl relative">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-600'}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabHub"
                                    className="absolute inset-0 bg-blue-600 rounded-[1.5rem] shadow-[0_0_20px_rgba(37,99,235,0.3)] -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: premiumEasing }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-10">
                            {/* KPI Metrics Dashboard */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Sedes Operativas', value: '142', change: '+5.2%', icon: Building2, color: 'blue' },
                                    { label: 'Ingresos Totales', value: '$128.4K', change: '+12.5%', icon: TrendingUp, color: 'emerald' },
                                    { label: 'Stock Crítico', value: '18', change: '-2.4%', icon: Package, color: 'rose' },
                                    { label: 'Tickets Abiertos', value: '42', change: '+3', icon: Ticket, color: 'amber' }
                                ].map((kpi, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1, duration: 0.6, ease: premiumEasing }}
                                        className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] p-8 rounded-[2.5rem] group hover:border-blue-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden"
                                    >
                                        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-${kpi.color}-500/5 blur-3xl rounded-full group-hover:bg-${kpi.color}-500/10 transition-all`} />

                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`h-12 w-12 rounded-2xl bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 flex items-center justify-center text-${kpi.color}-500 group-hover:scale-110 transition-transform`}>
                                                <kpi.icon className="h-6 w-6" />
                                            </div>
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${kpi.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                {kpi.change}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                                            <h3 className="text-4xl font-black text-white italic tracking-tighter">{kpi.value}</h3>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Macro Financial Chart */}
                            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10">
                                    <Activity className="h-20 w-20 text-blue-500/5 animate-pulse" />
                                </div>

                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Rendimiento de Red</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comparativa Ingresos vs Ventas (Semanal)</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ingresos</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ventas</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '1rem',
                                                    fontSize: '10px',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="ingresos"
                                                stroke="#3b82f6"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorIngresos)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="ventas"
                                                stroke="#10b981"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorVentas)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-10">
                            {/* Strategic Control Bar for Requests */}
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
                                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'PENDIENTE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Ver Pendientes
                                        </button>
                                        <button
                                            onClick={() => setFilter('ALL')}
                                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Historial Total
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data Grid for Requests */}
                            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.03] rounded-[2.5rem] overflow-hidden shadow-inner relative">
                                <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
                                {loading ? (
                                    <div className="p-32 flex flex-col items-center justify-center gap-6">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="h-20 w-20 border-t-2 border-r-2 border-blue-500/40 border-l-2 border-b-2 border-transparent rounded-full"
                                        />
                                        <p className="text-white text-[11px] font-black uppercase tracking-[0.4em]">Sincronizando Bóveda</p>
                                    </div>
                                ) : requests.length > 0 ? (
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/[0.05] bg-slate-950/40">
                                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Identificación Nodo</th>
                                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Ubicación Geo</th>
                                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Status Operativo</th>
                                                    <th className="px-10 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-outfit">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {requests
                                                    .filter(req => {
                                                        const nameMatch = (req.pharmacy_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                                                        const rifMatch = (req.rif || '').toLowerCase().includes(searchTerm.toLowerCase());
                                                        return nameMatch || rifMatch;
                                                    })
                                                    .map((req, idx) => (
                                                        <motion.tr
                                                            key={req.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="group hover:bg-blue-600/[0.03] transition-colors"
                                                        >
                                                            <td className="px-10 py-8">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-blue-500 shadow-2xl">
                                                                        <Building2 className="h-6 w-6" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-white italic tracking-tight uppercase">{req.pharmacy_name}</p>
                                                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">RIF: {req.rif}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-8">
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="text-[11px] font-black text-white uppercase tracking-wide">{req.city}, {req.state}</p>
                                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter truncate max-w-[200px]">{req.address}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-8">
                                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${req.status === 'PENDIENTE' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : req.status === 'APROBADO' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
                                                                    <div className={`h-1.5 w-1.5 rounded-full ${req.status === 'PENDIENTE' ? 'bg-amber-500 animate-pulse' : req.status === 'APROBADO' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                                    {req.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-10 py-8">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    {req.status === 'PENDIENTE' && (
                                                                        <>
                                                                            <button onClick={() => handleAction(req.id, 'APROBADO')} className="h-10 w-10 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                                                                                <CheckCircle2 className="h-5 w-5" />
                                                                            </button>
                                                                            <button onClick={() => handleAction(req.id, 'RECHAZADO')} className="h-10 w-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all">
                                                                                <XCircle className="h-5 w-5" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-40 flex flex-col items-center justify-center text-center">
                                        <Database className="h-16 w-16 text-slate-800 mb-6" />
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">No hay solicitudes</h3>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">El buffer del sistema está limpio por ahora.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'branches' && (
                        <div className="space-y-10">
                            {/* Control Bar for Branches */}
                            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-50" />
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
                                    <input
                                        type="text"
                                        placeholder="BUSCAR SEDES ACTIVAS POR NOMBRE O RIF..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-950/60 border border-white/[0.05] rounded-2xl py-4 pl-14 pr-6 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all font-black tracking-widest uppercase"
                                    />
                                </div>
                            </div>

                            {/* Active Branches Grid */}
                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="h-12 w-12 border-t-2 border-r-2 border-emerald-500/40 border-l-2 border-b-2 border-transparent rounded-full"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeBranches
                                        .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.rif.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((branch, idx) => (
                                            <motion.div
                                                key={branch.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-6">
                                                    <div className={`h-2 w-2 rounded-full ${branch.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-600'}`} />
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                        <Store className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-white italic tracking-tighter uppercase line-clamp-1">{branch.name}</h3>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1">RIF: {branch.rif}</p>
                                                    </div>
                                                    <div className="space-y-3 pt-4 border-t border-white/[0.03]">
                                                        <div className="flex items-center gap-3 text-slate-400">
                                                            <MapPin className="h-3 w-3 text-emerald-500/60" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight">{branch.city}, {branch.state}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-400">
                                                            <User className="h-3 w-3 text-emerald-500/60" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight">Gerente: {branch.manager}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4">
                                                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${branch.subscription === 'demo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'}`}>
                                                            MODO {branch.subscription.toUpperCase()}
                                                        </span>
                                                        <button className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2 group/link">
                                                            GESTIONAR <ExternalLink className="h-3 w-3 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                            {/* Inventory Metrics */}
                            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] p-10 rounded-[3rem] shadow-2xl space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Niveles de Inventario</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado de Stock Agregado por Categoría</p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-500/20" />
                                </div>

                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={inventoryData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={true} vertical={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="category"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                width={120}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                            />
                                            <Bar
                                                dataKey="stock"
                                                fill="#3b82f6"
                                                radius={[0, 10, 10, 0]}
                                                barSize={24}
                                            />
                                            <Bar
                                                dataKey="ideal"
                                                fill="rgba(255,255,255,0.05)"
                                                radius={[0, 10, 10, 0]}
                                                barSize={8}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rotación Mensual</p>
                                        <p className="text-xl font-black text-white italic">78%</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Items Agotados</p>
                                        <p className="text-xl font-black text-white italic">12</p>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Health Charts */}
                            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
                                <div className="space-y-1 mb-10">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Salud Operativa (SLA)</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resolución de Tickets y Respuesta de Red</p>
                                </div>

                                <div className="flex-1 flex flex-col justify-center items-center space-y-12">
                                    <div className="relative h-48 w-48">
                                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent" />
                                            <circle
                                                cx="50" cy="50" r="45"
                                                stroke="#3b82f6"
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={`${92 * 2.827}, 282.7`}
                                                strokeLinecap="round"
                                                className="shadow-2xl shadow-blue-500"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-white italic tracking-tighter">92%</span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Eficiencia</span>
                                        </div>
                                    </div>

                                    <div className="w-full grid grid-cols-1 gap-4">
                                        {[
                                            { label: 'Tiempo Respuesta Promedio', val: '14 min', status: 'optimal' },
                                            { label: 'Resolución Primer Contacto', val: '84%', status: 'optimal' },
                                            { label: 'Satisfacción Operador', val: '4.8/5', status: 'optimal' }
                                        ].map((stat, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-slate-950/40 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-colors">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-white italic">{stat.val}</span>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

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

export default PharmacyHub;
