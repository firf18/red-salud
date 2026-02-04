import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    Clock,
    Activity,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, trend }: { label: string, value: string, icon: any, trend: string }) => (
    <div className="bg-slate-900/40 border border-white/[0.03] rounded-3xl p-6 backdrop-blur-sm group hover:border-teal-500/20 transition-all duration-500">
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400 group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                <TrendingUp className="h-3 w-3" />
                {trend}
            </div>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-end gap-2">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
            <div className="h-2 w-2 rounded-full bg-teal-500 mb-2 animate-pulse" />
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Buen día, Dr.</h1>
                    <p className="text-slate-500 font-medium text-sm">Gestiona tus consultas y pacientes para hoy.</p>
                </div>
                <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-slate-900/40 rounded-2xl border border-white/[0.03] backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-teal-500" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Pacientes hoy" value="12" icon={Users} trend="+15%" />
                <StatCard label="Citas pendientes" value="08" icon={Calendar} trend="+4%" />
                <StatCard label="Reportes críticos" value="02" icon={Activity} trend="-" />
                <StatCard label="Ingresos estimados" value="$1.2k" icon={TrendingUp} trend="+8%" />
            </div>

            {/* Main Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Appointments */}
                <div className="lg:col-span-2 bg-slate-900/20 border border-white/[0.03] rounded-[2rem] overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-white/[0.03] flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Próximas Citas</h2>
                        <button className="text-teal-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            Ver Agenda Completa <ArrowUpRight className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-800/30 transition-colors border border-transparent hover:border-white/[0.02] group">
                                    <div className="w-16 flex flex-col items-center">
                                        <span className="text-xs font-black text-teal-500">09:30</span>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase">AM</span>
                                    </div>
                                    <div className="px-4 border-l border-white/[0.03]">
                                        <p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">Ana María González</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Control Cardiología</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Confirmada</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rapid Actions */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-white px-2">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <button className="p-6 bg-gradient-to-br from-teal-600 to-blue-700 rounded-3xl text-left group shadow-xl shadow-teal-900/20 hover:scale-[1.02] transition-all">
                            <Calendar className="h-6 w-6 text-white/50 mb-4 group-hover:text-white transition-colors" />
                            <h3 className="font-bold text-white text-sm">Nueva Cita</h3>
                            <p className="text-white/60 text-[10px] mt-1 font-medium">Agendar paciente manualmente</p>
                        </button>
                        <button className="p-6 bg-slate-900/60 border border-white/[0.03] rounded-3xl text-left group hover:border-teal-500/20 transition-all">
                            <ClipboardList className="h-6 w-6 text-slate-700 mb-4 group-hover:text-teal-500 transition-colors" />
                            <h3 className="font-bold text-white text-sm">Emitir Receta</h3>
                            <p className="text-slate-500 text-[10px] mt-1 font-medium">Digital y firmada vía Red-Salud</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
