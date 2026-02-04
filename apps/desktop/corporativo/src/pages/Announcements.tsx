import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone,
    Plus,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Info,
    Eye,
    Power,
    Clock,
    Layout,
    Stethoscope,
    Building2,
    User,
    Save,
    X,
    MessageSquare,
    Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
    target_app: 'all' | 'medico' | 'paciente' | 'farmacia';
    is_active: boolean;
    created_at: string;
}

const AnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        type: 'info' as Announcement['type'],
        target_app: 'all' as Announcement['target_app'],
        is_active: true
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('system_announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // If table doesn't exist, we'll handle it or show empty
                if (error.code === 'PGRST116' || error.message.includes('not found')) {
                    setAnnouncements([]);
                } else {
                    throw error;
                }
            } else {
                setAnnouncements(data || []);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Error al cargar los avisos. ¿Está creada la tabla?');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newNote.title || !newNote.content) {
            toast.error('Por favor complete título y contenido');
            return;
        }

        try {
            const { error } = await supabase
                .from('system_announcements')
                .insert([newNote]);

            if (error) throw error;

            toast.success('Aviso publicado correctamente');
            setIsAdding(false);
            setNewNote({
                title: '',
                content: '',
                type: 'info',
                target_app: 'all',
                is_active: true
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error('Error al guardar el aviso');
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        try {
            const { error } = await supabase
                .from('system_announcements')
                .update({ is_active: !current })
                .eq('id', id);

            if (error) throw error;
            fetchAnnouncements();
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que desea eliminar este aviso?')) return;
        try {
            const { error } = await supabase
                .from('system_announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Aviso eliminado');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return { icon: AlertTriangle, color: 'inherit', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' };
            case 'success': return { icon: CheckCircle2, color: 'inherit', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500' };
            case 'error': return { icon: AlertTriangle, color: 'inherit', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500' };
            default: return { icon: Info, color: 'inherit', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' };
        }
    };

    const getAppIcon = (app: string) => {
        switch (app) {
            case 'medico': return { icon: Stethoscope, label: 'Médicos' };
            case 'farmacia': return { icon: Building2, label: 'Farmacias' };
            case 'paciente': return { icon: User, label: 'Pacientes' };
            default: return { icon: Globe, label: 'Toda la Red' };
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Avisos del Sistema</h1>
                    <p className="text-slate-500 font-medium text-sm text-balance max-w-md">
                        Crea notificaciones y anuncios dinámicos que aparecerán en todas las aplicaciones de la red.
                    </p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" /> Crear Nuevo Aviso
                </button>
            </div>

            {/* Create Form Modalish */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900/40 border border-blue-500/30 rounded-[2.5rem] p-8 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Megaphone className="h-6 w-6 text-blue-500" /> Nuevo Anuncio
                            </h3>
                            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título del Aviso</label>
                                    <input
                                        type="text"
                                        value={newNote.title}
                                        onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                        placeholder="Ej: Mantenimiento Programado"
                                        className="w-full bg-slate-950 border border-white/[0.05] rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-500/40 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contenido / Mensaje</label>
                                    <textarea
                                        value={newNote.content}
                                        onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                                        rows={4}
                                        placeholder="Describa el anuncio aquí..."
                                        className="w-full bg-slate-950 border border-white/[0.05] rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-500/40 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Aviso</label>
                                        <div className="space-y-2">
                                            {['info', 'warning', 'success', 'error'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setNewNote({ ...newNote, type: t as any })}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${newNote.type === t ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-slate-950 border border-white/[0.05] text-slate-500'
                                                        }`}
                                                >
                                                    <div className={`h-2 w-2 rounded-full ${t === 'info' ? 'bg-blue-500' : t === 'warning' ? 'bg-amber-500' : t === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">App Destino</label>
                                        <div className="space-y-2">
                                            {['all', 'medico', 'paciente', 'farmacia'].map(a => (
                                                <button
                                                    key={a}
                                                    onClick={() => setNewNote({ ...newNote, target_app: a as any })}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${newNote.target_app === a ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400' : 'bg-slate-950 border border-white/[0.05] text-slate-500'
                                                        }`}
                                                >
                                                    {getAppIcon(a).label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Save className="h-5 w-5" /> Publicar Oficialmente
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.map((note) => {
                    const style = getTypeIcon(note.type);
                    const app = getAppIcon(note.target_app);
                    const Icon = style.icon;
                    const AppIcon = app.icon;

                    return (
                        <motion.div
                            key={note.id}
                            className={`p-6 rounded-[2rem] border ${style.border} ${style.bg} relative overflow-hidden group`}
                        >
                            <div className="absolute top-0 right-0 p-4 flex gap-2">
                                <button
                                    onClick={() => toggleActive(note.id, note.is_active)}
                                    className={`p-2 rounded-xl border border-white/[0.05] transition-all ${note.is_active ? 'bg-white shadow-lg text-slate-900' : 'bg-slate-900 text-slate-600'}`}
                                >
                                    <Power className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="p-2 rounded-xl bg-slate-900/50 border border-white/[0.05] text-slate-600 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${style.text} bg-white/5`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="pr-20">
                                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-tight">{note.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${style.text}`}>{note.type}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                                            <AppIcon className="h-3 w-3" /> {app.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                                {note.content}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(note.created_at).toLocaleDateString()}</span>
                                </div>
                                {note.is_active && (
                                    <div className="flex items-center gap-2 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                                        <Eye className="h-3.5 w-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest animate-pulse">En emisión</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {announcements.length === 0 && !loading && (
                    <div className="col-span-full p-20 text-center bg-slate-900/10 rounded-[3rem] border border-dashed border-white/[0.05]">
                        <MessageSquare className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No hay avisos configurados</p>
                    </div>
                )}
            </div>

            {/* Banner/Footer for SQL */}
            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl flex items-center gap-4">
                <Layout className="h-8 w-8 text-blue-500/40" />
                <div className="flex-1">
                    <p className="text-xs text-white font-bold">Nota Técnica</p>
                    <p className="text-[10px] text-slate-500 italic">Este sistema requiere que el backend/frontend de las apps solicitantes consulten la tabla `system_announcements` filtrando por `is_active = true`.</p>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementsPage;
