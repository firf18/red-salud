import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    Settings,
    LogOut,
    Bell,
    Search,
    User as UserIcon,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
      ${isActive
                ? 'bg-teal-600/10 text-teal-500 shadow-sm border border-teal-500/10'
                : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'}
    `}
    >
        <Icon className="h-5 w-5" />
        <span className="font-bold text-xs tracking-wide">{label}</span>
        <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
    </NavLink>
);

const DashboardLayout: React.FC = () => {
    const { signOut } = useAuth();
    const { profile } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#070b14] overflow-hidden text-slate-300 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/[0.03] bg-slate-900/20 backdrop-blur-3xl flex flex-col p-6 z-20">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2.5 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl shadow-lg shadow-teal-900/20">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-extrabold text-sm tracking-tighter text-white">RED SALUD <span className="text-teal-500">PRO</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/pacientes" icon={Users} label="Pacientes" />
                    <SidebarItem to="/agenda" icon={Calendar} label="Agenda Médica" />
                    <SidebarItem to="/consultas" icon={ClipboardList} label="Consultas" />
                    <div className="pt-6 pb-2 px-4">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Configuración</span>
                    </div>
                    <SidebarItem to="/configuracion" icon={Settings} label="Ajustes" />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/[0.03]">
                    <div className="bg-slate-800/30 rounded-2xl p-4 flex items-center gap-3 mb-4 ring-1 ring-white/[0.02]">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-teal-500/20 to-blue-500/20 flex items-center justify-center border border-teal-500/20">
                            <UserIcon className="h-4 w-4 text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{profile?.full_name || 'Dr. Médico'}</p>
                            <p className="text-[9px] text-slate-500 font-medium truncate italic">{profile?.doctor_profiles?.[0]?.specialty || 'Especialista'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-bold text-xs tracking-wide">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-950/20 relative">
                <header className="h-16 border-b border-white/[0.03] bg-slate-900/10 backdrop-blur-md flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4 bg-slate-800/20 border border-white/[0.03] px-4 py-2 rounded-xl w-64 group focus-within:w-80 transition-all">
                        <Search className="h-4 w-4 text-slate-600 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar paciente o cita..."
                            className="bg-transparent border-none outline-none text-[11px] text-white placeholder:text-slate-600 w-full"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:text-teal-400 transition-colors bg-slate-800/20 rounded-xl border border-white/[0.03]">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-500 rounded-full border-2 border-slate-900 shadow-sm" />
                        </button>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Outlet />
                    </motion.div>
                </section>
            </main>
        </div>
    );
};

export default DashboardLayout;
