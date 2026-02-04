import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    ShieldCheck,
    Key,
    AlertTriangle,
    Fingerprint,
    Cpu,
    Database,
    ChevronRight,
    RefreshCw,
    Terminal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SecurityMaster: React.FC = () => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVaultStatus();
    }, []);

    const fetchVaultStatus = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('master_vault')
                .select('*')
                .single();

            if (data) setStatus(data);
        } catch (error) {
            console.error('Error fetching vault status:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-8 bg-blue-600 rounded-full" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocolo de Seguridad</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                    SEGURIDAD <span className="text-blue-500 not-italic">MAESTRA</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Vault Health Overview */}
                    <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <Shield className="h-40 w-40 text-blue-500" />
                        </div>

                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
                                    <ShieldCheck className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Estado del Bóveda</h2>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">SISTEMA TOTALMENTE OPERATIVO</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchVaultStatus}
                                className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-inner active:scale-95"
                            >
                                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            {[
                                { label: 'Status', value: status?.is_initialized ? 'Iniciado' : 'Pendiente', color: 'text-emerald-500' },
                                { label: 'Cifrado', value: 'AES-256-GCM', color: 'text-blue-400' },
                                { label: 'Integridad', value: '100% Valid', color: 'text-indigo-400' }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl group/card hover:border-blue-500/30 transition-all">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                                    <p className={`text-sm font-black uppercase tracking-tight ${item.color}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[2rem] relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-4">
                                <Key className="h-5 w-5 text-blue-500" />
                                <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Hash de Clave Maestra</h3>
                            </div>
                            <div className="flex gap-2 font-mono text-[10px] text-slate-400 break-all bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                                <Terminal className="h-4 w-4 text-blue-500/50 shrink-0" />
                                {status?.seed_phrase_hash || 'SHA256:0x000000000000000000000000000000000000000000000000'}
                            </div>
                        </div>
                    </div>

                    {/* Operational Compliance */}
                    <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.05] rounded-[3rem] p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <Database className="h-6 w-6 text-slate-500" />
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tight italic">Registros de Seguridad (Logs)</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                { event: 'Acceso Maestro Concedido', user: 'OCTAVIAN-ALPHA', time: '2m ago', type: 'SUCCESS' },
                                { event: 'Actualización de Políticas RLS', user: 'SYSTEM-ROOT', time: '1h ago', type: 'ADMIN' },
                                { event: 'Verificación de Integridad Vault', user: 'CRON-TASK', time: '5h ago', type: 'ROUTINE' }
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-950/30 border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-2 w-2 rounded-full ${log.type === 'SUCCESS' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{log.event}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">{log.user}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Threat Protection Widget */}
                    <div className="bg-slate-950/40 backdrop-blur-3xl border border-blue-500/20 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                        <div className="relative z-10">
                            <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 mb-8">
                                <Fingerprint className="h-8 w-8" />
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Protocolos Activos</h3>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest mb-10 italic">Nivel de encriptación grado militar habilitado en todos los nodos.</p>

                            <div className="space-y-4 mb-10">
                                {['2FA Mandatory', 'Encryption E2E', 'Automatic Erasure'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-5 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group/btn">
                                <Cpu className="h-4 w-4 text-blue-500" />
                                Auditoría de Nodos
                                <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Zona de Riesgo</h3>
                        </div>
                        <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest leading-relaxed italic">
                            Acciones irreversibles que pueden comprometer la integridad de la red.
                        </p>
                        <button className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all">
                            Reiniciar Bóveda Maestra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityMaster;
