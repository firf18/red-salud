import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    User,
    Phone,
    MessageSquare,
    Search,
    Clock,
    CheckCircle2,
    MoreVertical,
    Send,
    AlertCircle,
    BadgeHelp,
    Briefcase,
    Building2,
    Shield,
    Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const premiumEasing: any = [0.16, 1, 0.3, 1];

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    priority: string;
    message: string;
    status: 'NUEVO' | 'CONTACTADO' | 'CERRADO';
    created_at: string;
}

const LeadsPage: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'NUEVO' | 'ALL'>('NUEVO');

    useEffect(() => {
        fetchLeads();
    }, [activeFilter]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('support_tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (activeFilter === 'NUEVO') {
                query = query.eq('status', 'NUEVO');
            }

            const { data, error } = await query;
            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Error al cargar las solicitudes');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: 'CONTACTADO' | 'CERRADO') => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Estado actualizado a ${newStatus}`);
            fetchLeads();
        } catch (error) {
            console.error('Error updating lead:', error);
            toast.error('Error al actualizar la solicitud');
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSubjectBadge = (subject: string) => {
        switch (subject) {
            case 'empresas': return { icon: Briefcase, text: 'Alianza Comercial', color: 'blue' };
            case 'soporte': return { icon: BadgeHelp, text: 'Soporte Técnico', color: 'red' };
            default: return { icon: MessageSquare, text: 'Consulta General', color: 'slate' };
        }
    };

    return (
        <div className="space-y-12 max-w-7xl mx-auto py-4">
            {/* Header / Tactical Title */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-white/5 pb-12 relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Inteligencia Externa</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                        BANDEJA DE <span className="text-blue-500 not-italic">LEADS</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs tracking-wide max-w-lg leading-relaxed uppercase opacity-70">
                        Gestión perimétrica de alianzas corporativas y solicitudes de soporte recibidas desde el portal público.
                    </p>
                </div>

                <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/5 shadow-2xl relative z-10">
                    <button
                        onClick={() => setActiveFilter('NUEVO')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeFilter === 'NUEVO' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:text-slate-400'
                            }`}
                    >
                        PENDIENTES
                    </button>
                    <button
                        onClick={() => setActiveFilter('ALL')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeFilter === 'ALL' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:text-slate-400'
                            }`}
                    >
                        HISTORIAL
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Tickets Activos', value: leads.length, icon: Mail, color: 'blue' },
                    { label: 'Alianzas B2B', value: leads.filter(l => l.subject === 'empresas').length, icon: Building2, color: 'indigo' },
                    { label: 'SLA Promedio', value: '2.4h', icon: Zap, color: 'amber' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, ease: premiumEasing }}
                        className="bg-slate-900/20 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] group hover:border-blue-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <stat.icon className="h-32 w-32" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-inner">
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</p>
                        </div>
                        <h3 className="text-4xl font-black text-white italic tracking-widest">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Intel Bar */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-4 flex gap-6 items-center shadow-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR EN BASE DE DATOS DE INTELIGENCIA..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-xs text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/20 transition-all font-bold uppercase tracking-widest"
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Clock className="h-10 w-10 text-blue-500/40 animate-pulse" />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sincronizando Leads...</p>
                    </div>
                ) : filteredLeads.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 pb-20">
                        <AnimatePresence mode="popLayout">
                            {filteredLeads.map((lead) => {
                                const { icon: SubIcon, text: subText } = getSubjectBadge(lead.subject);
                                return (
                                    <motion.div
                                        key={lead.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-slate-900/10 backdrop-blur-xl border border-white/[0.03] rounded-[2.5rem] p-8 group hover:bg-blue-600/[0.03] hover:border-blue-500/30 transition-all duration-500 shadow-2xl"
                                    >
                                        <div className="flex flex-col lg:flex-row gap-10">
                                            <div className="flex-1 space-y-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-16 w-16 rounded-[1.5rem] bg-slate-950 border border-white/5 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-blue-500/30 transition-all">
                                                            <User className="h-7 w-7 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">{lead.name}</h4>
                                                            <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase mt-1">{lead.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20 bg-blue-500/5 text-blue-400 flex items-center gap-2 shadow-lg shadow-blue-900/5`}>
                                                            <SubIcon className="h-4 w-4" />
                                                            {subText}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-[9px] font-bold uppercase tracking-tighter">{new Date(lead.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-950/60 rounded-[2rem] p-8 border border-white/[0.02] relative group-hover:border-blue-500/10 transition-colors">
                                                    <MessageSquare className="absolute -top-3 -left-3 h-8 w-8 text-blue-500/10" />
                                                    <p className="text-sm text-slate-300 leading-relaxed italic font-medium">"{lead.message}"</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-10 pt-2">
                                                    {lead.company && (
                                                        <div className="flex items-center gap-3">
                                                            <Building2 className="h-4 w-4 text-slate-500" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{lead.company}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="h-4 w-4 text-slate-500" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lead.phone || 'NO PROVIDO'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:w-64 flex flex-row lg:flex-col gap-4 justify-center lg:justify-start lg:border-l lg:border-white/5 lg:pl-10">
                                                {lead.status === 'NUEVO' && (
                                                    <button
                                                        onClick={() => updateStatus(lead.id, 'CONTACTADO')}
                                                        className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all group/btn"
                                                    >
                                                        <Send className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                        CONTACTAR
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateStatus(lead.id, 'CERRADO')}
                                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-slate-950/60 hover:bg-slate-900 text-slate-400 border border-white/5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                    FINALIZAR
                                                </button>
                                                <button className="h-16 w-16 flex items-center justify-center bg-slate-950/60 rounded-[1.5rem] border border-white/5 hover:border-blue-500/30 transition-colors">
                                                    <MoreVertical className="h-5 w-5 text-slate-700" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="p-32 flex flex-col items-center justify-center text-center bg-[#070707] rounded-[4rem] border border-dashed border-white/5 shadow-inner">
                        <div className="h-24 w-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mb-8 ring-1 ring-white/10 relative">
                            <Mail className="h-10 w-10 text-slate-800" />
                            <motion.div
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full"
                            />
                        </div>
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Bandeja Vacía</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto">Estado de sistema: Sin nuevas intercepciones de datos externos.</p>
                    </div>
                )}
            </div>

            {/* Tactical Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 p-4 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sincronización Activa</span>
                        </div>
                        <div className="h-4 w-px bg-white/5" />
                        <div className="flex items-center gap-2 text-blue-400">
                            <Shield className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">SSL 256-Bit Cryptography</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadsPage;
