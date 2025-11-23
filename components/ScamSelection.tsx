
import React, { useState, useEffect } from 'react';
import { Target, Lock, Crosshair, Users, Shield, Radio, Globe, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
    loading: boolean;
    scamsCompleted: number;
}

const ScamSelection: React.FC<Props> = ({ onSelectDifficulty, loading, scamsCompleted }) => {
    const [scanText, setScanText] = useState<string[]>([]);

    useEffect(() => {
        if (loading) {
            const lines = [
                "INITIALIZING_SCAN...",
                "PINGING_GLOBAL_SERVERS...",
                "BYPASSING_FIREWALL_LAYER_7...",
                "DECRYPTING_USER_METADATA...",
                "FILTERING_LOW_VALUE_TARGETS...",
                "CROSS_REFERENCING_SOCIAL_MEDIA...",
                "VULNERABILITY_ASSESSMENT: PENDING...",
                "TARGET_LOCKED."
            ];
            let i = 0;
            setScanText([]);
            const interval = setInterval(() => {
                if (i < lines.length) {
                    setScanText(prev => [...prev, lines[i]]);
                    i++;
                }
            }, 400);
            return () => clearInterval(interval);
        }
    }, [loading]);

    const DifficultyCard = ({ level, label, range, unlocked, icon: Icon, colorClass, borderClass, onClick }: any) => (
        <button 
            onClick={onClick}
            disabled={!unlocked}
            className={`relative group overflow-hidden border-2 p-6 md:p-8 flex flex-col items-start text-left transition-all duration-300 w-full min-h-[240px] ${unlocked ? `bg-zinc-900/40 hover:bg-zinc-900/80 ${borderClass} cursor-pointer` : 'bg-zinc-950 border-zinc-900 opacity-40 cursor-not-allowed'}`}
        >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500 ${colorClass}`}>
                <Icon size={120} strokeWidth={0.5} />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-xs font-mono font-bold uppercase tracking-[0.2em] border px-2 py-1 ${unlocked ? `${colorClass} ${borderClass}` : 'text-zinc-600 border-zinc-800'}`}>
                            {unlocked ? 'AVAILABLE' : 'LOCKED'}
                        </span>
                        {unlocked && <Crosshair size={20} className={`${colorClass} opacity-0 group-hover:opacity-100 animate-spin-slow`} />}
                        {!unlocked && <Lock size={20} className="text-zinc-600" />}
                    </div>
                    
                    <h3 className={`text-3xl md:text-4xl font-black font-mono mb-2 tracking-tighter ${unlocked ? 'text-white' : 'text-zinc-600'}`}>
                        {label}
                    </h3>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-wide">
                        Exp. Payout: <span className={unlocked ? 'text-white' : 'text-zinc-600'}>{range}</span>
                    </p>
                </div>

                <div className="w-full mt-6">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1 uppercase">
                        <span>Risk Assessment</span>
                        <span>{level === 'easy' ? 'LOW' : level === 'medium' ? 'MODERATE' : 'CRITICAL'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 overflow-hidden">
                        <div className={`h-full ${level === 'easy' ? 'bg-green-500 w-1/3' : level === 'medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-full'}`}></div>
                    </div>
                </div>
            </div>
            
            {/* Scanning Line Effect on Hover */}
            {unlocked && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>}
        </button>
    );

    return (
        <div className="h-full w-full relative flex flex-col">
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center font-mono p-4"
                    >
                        <div className="w-full max-w-2xl">
                            <div className="flex items-center gap-4 mb-8 text-green-500">
                                <Radio className="animate-pulse" size={48} />
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter animate-pulse">ACQUIRING_TARGET</h2>
                            </div>
                            
                            <div className="bg-zinc-900/50 border border-green-500/30 p-4 rounded-sm font-mono text-xs md:text-sm h-64 overflow-hidden relative shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
                                <div className="flex flex-col justify-end h-full gap-1">
                                    {scanText.map((line, i) => (
                                        <div key={i} className="text-green-400">
                                            <span className="text-green-800 mr-2">{`>`}</span>
                                            {line}
                                        </div>
                                    ))}
                                    <div className="h-4 w-3 bg-green-500 animate-pulse inline-block"></div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex justify-between text-green-500/50 text-xs font-mono">
                                <span>ENCRYPTION: BYPASSED</span>
                                <span>PROXY: ROTATING</span>
                                <span>TRACE: 0%</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center gap-4 border-b border-zinc-800 pb-4">
                        <div className="p-3 bg-zinc-900 border border-zinc-700">
                            <Globe className="text-zinc-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tighter">GLOBAL_TARGET_DIRECTORY</h1>
                            <p className="text-zinc-500 text-xs md:text-sm font-mono uppercase tracking-widest">Select vulnerability sector</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <DifficultyCard 
                            level="easy"
                            label="THE ELDERLY"
                            range="$800 - $1,200"
                            unlocked={true}
                            icon={Users}
                            colorClass="text-green-500"
                            borderClass="border-green-500/50 hover:border-green-500"
                            onClick={() => onSelectDifficulty('easy')}
                        />
                        <DifficultyCard 
                            level="medium"
                            label="SMALL BIZ"
                            range="$2.5k - $3.5k"
                            unlocked={scamsCompleted >= 2}
                            icon={Binary}
                            colorClass="text-yellow-500"
                            borderClass="border-yellow-500/50 hover:border-yellow-500"
                            onClick={() => onSelectDifficulty('medium')}
                        />
                        <DifficultyCard 
                            level="hard"
                            label="THE EXEC"
                            range="$6k - $12k"
                            unlocked={scamsCompleted >= 5}
                            icon={Shield}
                            colorClass="text-red-500"
                            borderClass="border-red-500/50 hover:border-red-500"
                            onClick={() => onSelectDifficulty('hard')}
                        />
                    </div>
                    
                    <div className="mt-8 p-4 border border-zinc-800 bg-zinc-900/20 text-center md:text-left rounded flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-zinc-500 font-mono">
                            <span className="text-white font-bold block mb-1">OPERATIONAL ADVICE:</span>
                            Higher tier targets have advanced security protocols. Ensure "Tech" and "Social" skills are upgraded before engaging Executive class targets.
                        </div>
                        <div className="font-mono text-zinc-600 text-[10px] uppercase tracking-widest">
                            DATABASE_VER: 2.4.1
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScamSelection;
