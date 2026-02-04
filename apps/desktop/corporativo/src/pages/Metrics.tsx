import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Users,
    Building2,
    Stethoscope,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b'];

const MetricOverview = ({ label, value, trend, trendValue, icon: Icon, loading }: any) => (
    <div className="bg-slate-900/20 border border-white/[0.03] p-6 rounded-[2rem] backdrop-blur-sm relative overflow-hidden">
        {loading && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            </div>
        )}
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <Icon className="h-5 w-5" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black ${trend === 'up' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trendValue}
            </div>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
    </div>
);

const MetricsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('growth');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        medicos: 0,
        farmacias: 0,
        pacientes: 0,
        consultas: 0,
        growth: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch total counts
            const [medicosRes, farmaciasRes, pacientesRes, consultasRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'medico'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmacia'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'paciente'),
                supabase.from('support_tickets').select('*', { count: 'exact', head: true })
            ]);

            const newStats = {
                medicos: medicosRes.count || 0,
                farmacias: farmaciasRes.count || 0,
                pacientes: pacientesRes.count || 0,
                consultas: consultasRes.count || 0,
                growth: 12.5 // This could be calculated from history
            };

            setStats(newStats);

            // Mock historical data generation based on real counts for the charts
            // In a production app, this would be an aggregate query
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
            const factor = newStats.medicos / 6;
            const history = months.map((month, i) => ({
                name: month,
                medicos: Math.floor(factor * (i + 1)),
                farmacias: Math.floor((newStats.farmacias / 6) * (i + 1)),
                consultas: Math.floor((newStats.consultas / 6) * (i + 1))
            }));
            setChartData(history);

        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Error al actualizar métricas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Inteligencia de Negocios</h1>
                    <p className="text-slate-500 font-medium text-sm text-balance max-w-md">
                        Métricas avanzadas y proyecciones de crecimiento de la red Red-Salud.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchStats}
                        className="p-3 bg-slate-900/40 border border-white/[0.03] rounded-2xl text-slate-500 hover:text-blue-500 transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-3"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </button>
                    <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/[0.03] backdrop-blur-sm">
                        <button
                            onClick={() => setActiveTab('growth')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'growth' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Crecimiento
                        </button>
                        <button
                            onClick={() => setActiveTab('usage')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'usage' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Uso de Red
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricOverview
                    label="Tasa de Crecimiento"
                    value={`${stats.growth}%`}
                    trend="up"
                    trendValue="+2.1%"
                    icon={TrendingUp}
                    loading={loading}
                />
                <MetricOverview
                    label="Médicos Registrados"
                    value={stats.medicos.toLocaleString()}
                    trend="up"
                    trendValue={`+${Math.floor(stats.medicos * 0.05)}`}
                    icon={Stethoscope}
                    loading={loading}
                />
                <MetricOverview
                    label="Farmacias Activas"
                    value={stats.farmacias.toLocaleString()}
                    trend="up"
                    trendValue={`+${Math.floor(stats.farmacias * 0.03)}`}
                    icon={Building2}
                    loading={loading}
                />
                <MetricOverview
                    label="Tickets / Soporte"
                    value={stats.consultas.toLocaleString()}
                    trend="up"
                    trendValue="+12"
                    icon={Calendar}
                    loading={loading}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Growth Chart */}
                <div className="bg-slate-900/20 border border-white/[0.03] p-8 rounded-[2.5rem] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Crecimiento Mensual</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Evolución de Médicos vs Farmacias</p>
                        </div>
                        <Filter className="h-4 w-4 text-slate-600 hover:text-blue-500 cursor-pointer transition-colors" />
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '16px',
                                        border: '1px solid #ffffff05',
                                        fontSize: '11px',
                                        color: '#fff'
                                    }}
                                />
                                <Area type="monotone" dataKey="medicos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMed)" />
                                <Area type="monotone" dataKey="farmacias" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorFar)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Consultation Volume Chart */}
                <div className="bg-slate-900/20 border border-white/[0.03] p-8 rounded-[2.5rem] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Volumen de Actividad</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Interacciones procesadas en la red</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    width={40}
                                />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '16px',
                                        border: '1px solid #ffffff05',
                                        fontSize: '11px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="consultas" radius={[10, 10, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-full bg-blue-600/5 border border-blue-500/10 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">Reporte de Desempeño</p>
                            <p className="text-[10px] text-slate-500 font-medium">El crecimiento se mantiene constante con la integración de nuevos nodos.</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Exportar Inteligencia
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetricsPage;
