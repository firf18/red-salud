import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Stethoscope,
    Building2,
    Heart,
    Activity,
    ShieldCheck,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';

interface RoleCategory {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    count: string;
    path: string;
    isComingSoon?: boolean;
}

const roles: RoleCategory[] = [
    {
        id: 'pacientes',
        title: 'Pacientes',
        description: 'Gestión y monitoreo de la base de datos de ciudadanos registrados.',
        icon: Heart,
        color: 'rose',
        count: '1,240',
        path: '/dashboard/roles/paciente'
    },
    {
        id: 'doctores',
        title: 'Doctores',
        description: 'Control del escuadrón médico, credenciales y estados operativos.',
        icon: Stethoscope,
        color: 'blue',
        count: '458',
        path: '/dashboard/roles/medico'
    },
    {
        id: 'farmacias',
        title: 'Farmacias',
        description: 'Administración de nodos farmacéuticos y solicitudes de registro.',
        icon: Building2,
        color: 'indigo',
        count: '142',
        path: '/roles/farmacias'
    },
    {
        id: 'ambulancia',
        title: 'Ambulancias',
        description: 'Despliegue y monitoreo de unidades de respuesta rápida.',
        icon: Activity,
        color: 'amber',
        count: '0',
        path: '/dashboard/roles/ambulancia',
        isComingSoon: true
    },
    {
        id: 'clinica',
        title: 'Clínicas',
        description: 'Gestión de centros hospitalarios y convenios corporativos.',
        icon: Building2,
        color: 'emerald',
        count: '0',
        path: '/dashboard/roles/clinica',
        isComingSoon: true
    },
    {
        id: 'seguro',
        title: 'Seguros',
        description: 'Integración con aseguradoras y validación de pólizas.',
        icon: ShieldCheck,
        color: 'cyan',
        count: '0',
        path: '/dashboard/roles/seguro',
        isComingSoon: true
    },
    {
        id: 'secretaria',
        title: 'Secretarias',
        description: 'Gestión de personal de apoyo administrativo en centros médicos.',
        icon: Users,
        color: 'violet',
        count: '0',
        path: '/dashboard/roles/secretaria',
        isComingSoon: true
    }
];

const RolesHub: React.FC = () => {
    const navigate = useNavigate();
    const premiumEasing: any = [0.16, 1, 0.3, 1];

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: premiumEasing }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-blue-500/50" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Arquitectura de Red</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase group transition-all">
                        ROLES <span className="text-blue-500 group-hover:text-blue-400 transition-colors">CENTRAL</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide max-w-xl uppercase leading-relaxed">
                        Control maestro de identidades y privilegios asignados en el ecosistema Red-Salud.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: premiumEasing }}
                    className="flex bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/[0.05] backdrop-blur-3xl shadow-2xl items-center gap-8 px-10"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Roles</span>
                        <span className="text-2xl font-black text-white italic">{roles.length}</span>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Activos</span>
                        <span className="text-2xl font-black text-blue-500 italic">3</span>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Próximamente</span>
                        <span className="text-2xl font-black text-amber-500 italic">4</span>
                    </div>
                </motion.div>
            </div>

            {/* Tactical Control Bar */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30" />

                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR CATEGORÍA DE ROL..."
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-16 pr-6 text-xs font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button className="px-8 py-4 bg-slate-950/60 border border-white/[0.03] rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white hover:border-white/10 transition-all flex items-center gap-3">
                        <Filter className="h-4 w-4" />
                        Filtros Avanzados
                    </button>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        Gestión Global
                    </button>
                </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {roles.map((role, idx) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * idx, ease: premiumEasing }}
                        whileHover={{ y: -5, transition: { duration: 0.4 } }}
                        onClick={() => navigate(role.path)}
                        className={`group relative p-8 rounded-[2.5rem] border backdrop-blur-xl cursor-pointer overflow-hidden transition-all
                            ${role.isComingSoon
                                ? 'bg-slate-900/10 border-white/[0.02] opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                : `bg-slate-900/20 border-white/[0.05] hover:border-${role.color}-500/30 hover:bg-${role.color}-500/[0.02]`
                            }`}
                    >
                        {/* Decorative Background */}
                        <div className={`absolute -top-24 -right-24 w-64 h-64 bg-${role.color}-500/5 blur-[80px] rounded-full group-hover:bg-${role.color}-500/10 transition-all duration-700`} />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-start justify-between">
                                <div className={`h-16 w-16 rounded-2xl bg-${role.color}-500/10 border border-${role.color}-500/20 flex items-center justify-center text-${role.color}-500 group-hover:scale-110 group-hover:bg-${role.color}-500/20 transition-all duration-500`}>
                                    <role.icon className="h-8 w-8 text-current" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Registros</p>
                                    <p className="text-xl font-black text-white tracking-tighter italic">{role.count}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{role.title}</h3>
                                    {role.isComingSoon && (
                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest">WIP</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide h-12 line-clamp-2">
                                    {role.description}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${role.isComingSoon ? 'bg-slate-700' : `bg-${role.color}-500 animate-pulse`}`} />
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        {role.isComingSoon ? 'No Disponible' : 'En Línea'}
                                    </span>
                                </div>
                                <div className={`h-10 w-10 rounded-full bg-slate-950/40 border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-${role.color}-500 group-hover:border-${role.color}-500/30 transition-all`}>
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-${role.color}-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </motion.div>
                ))}
            </div>

            {/* Tactical Footer Overlay Information */}
            <div className="mt-12 p-8 bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12">
                    <Users className="h-48 w-48 text-blue-500/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Protocolo de Identidad Unificada</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-2xl">
                            Todos los roles operativos comparten el mismo motor de encriptación AES-256 para garantizar que la data sensible esté aislada pero conectada proporcionalmente bajo el Master Vault.
                        </p>
                    </div>
                    <button className="px-10 py-5 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-500 hover:text-white transition-all flex items-center gap-3 shrink-0">
                        <ShieldCheck className="h-5 w-5" />
                        Auditoría de Acceso
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RolesHub;
