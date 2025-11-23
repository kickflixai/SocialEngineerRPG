
import React, { useState, useEffect } from 'react';
import { Shield, Radio, Globe, Binary, User, Users, Briefcase, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
    loading: boolean;
    scamsCompleted: number;
}

const LOADING_LINES = [
    "INITIALIZING_SCAN...",
    "PINGING_GLOBAL_SERVERS...",
    "BYPASSING_FIREWALL_LAYER_7...",
    "DECRYPTING_USER_METADATA...",
    "FILTERING_LOW_VALUE_TARGETS...",
    "CROSS_REFERENCING_SOCIAL_MEDIA...",
    "CHECKING_LINKEDIN_FOR_GULLIBILITY...",
    "SCANNING_FACEBOOK_MARKETPLACE...",
    "ANALYZING_BOOMER_MEMES...",
    "LOCATING_UNSECURED_WEBCAMS...",
    "BRUTE_FORCING_PASSWORD_123456...",
    "DOWNLOADING_MORE_RAM...",
    "ACCESSING_DARK_WEB_DIRECTORY...",
    "FILTERING_OUT_BOTS...",
    "IDENTIFYING_RICH_PEOPLE_WITH_NO_TECH_SKILLS...",
    "BYPASSING_TWO_FACTOR_AUTHENTICATION...",
    "INJECTING_SQL_PAYLOAD...",
    "TRIANGULATING_IP_ADDRESS...",
    "CHECKING_CREDIT_SCORES...",
    "SEARCHING_FOR_OPEN_PORTS...",
    "COMPILING_VICTIM_DOSSIER...",
    "GENERATING_FAKE_ID...",
    "ESTABLISHING_ENCRYPTED_TUNNEL...",
    "MASKING_SIGNATURE...",
    "TARGET_LOCKED."
];

const ScamSelection: React.FC<Props> = ({ onSelectDifficulty, loading, scamsCompleted }) => {
    const [scanText, setScanText] = useState<string[]>([]);

    useEffect(() => {
        if (loading) {
            let i = 0;
            setScanText([]);
            // Pick random start lines but always end with Target Locked
            const shuffled = [...LOADING_LINES].sort(() => 0.5 - Math.random()).slice(0, 8);
            shuffled[shuffled.length-1] = "TARGET_ACQUIRED.";
            
            const interval = setInterval(() => {
                if (i < shuffled.length) {
                    setScanText(prev => [...prev.slice(-6), shuffled[i]]); // Keep last 6 lines
                    i++;
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [loading]);

    const DifficultyCard = ({ level, label, range, unlocked, icon: Icon, colorClass, borderClass, onClick, desc }: any) => (
        <button 
            onClick={onClick}
            disabled={!unlocked}
            className={`relative group overflow-hidden border p-6 md:p-8 flex flex-col items-start text-left transition-all duration-300 w-full min-h-[260px] ${unlocked ? `bg-zinc-950 hover:bg-zinc-900 ${borderClass} cursor-pointer hover:scale-[1.02] shadow-xl` : 'bg-black border-zinc-900 opacity-40 cursor-not-allowed'}`}
        >
            {/* Folder Tab Visual */}
            <div className={`absolute top-0 left-0 w-24 h-1 ${unlocked ? colorClass.replace('text-', 'bg-') : 'bg-zinc-800'}`}></div>

            <div className={`absolute top-4 right-4 p-2 rounded-full border ${unlocked ? `${colorClass} ${borderClass}` : 'text-zinc-700 border-zinc-800'}`}>
                <Icon size={24} />
            </div>

            <div className="mt-4 w-full">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${unlocked ? 'text-zinc-500' : 'text-zinc-700'}`}>
                        SECTOR_{level.toUpperCase()}
                    </span>
                    {!unlocked && <Lock size={14} className="text-zinc-700"/>}
                </div>
                
                <h3 className={`text-3xl md:text-4xl font-black font-mono mb-2 tracking-tighter ${unlocked ? 'text-white' : 'text-zinc-700'}`}>
                    {label}
                </h3>
                
                <div className={`text-sm font-mono mb-4 px-2 py-1 inline-block ${unlocked ? 'bg-zinc-900 text-zinc-300' : 'text-zinc-800'}`}>
                    Est. Yield: <span className={unlocked ? colorClass : ''}>{range}</span>
                </div>

                <p className="text-xs text-zinc-500 font-mono leading-relaxed h-12 overflow-hidden">
                    {desc}
                </p>

                <div className="w-full mt-6 pt-4 border-t border-dashed border-zinc-800 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-zinc-600">Security Level</span>
                        <div className="flex gap-1 mt-1">
                            {[1,2,3].map(i => (
                                <div key={i} className={`w-3 h-1 ${level === 'easy' ? (i===1 ? 'bg-green-500' : 'bg-zinc-800') : level === 'medium' ? (i<=2 ? 'bg-yellow-500' : 'bg-zinc-800') : 'bg-red-500'}`}></div>
                            ))}
                        </div>
                    </div>
                    {unlocked && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${colorClass} group-hover:translate-x-1 transition-transform`}>
                            INITIATE <ChevronRight size={12}/>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );

    return (
        <div className="h-full w-full relative flex flex-col bg-black">
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono p-4"
                    >
                        <div className="w-full max-w-xl border-2 border-green-500/50 bg-zinc-900/50 p-6 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.2)]">
                            {/* Scanning Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <Radio className="animate-pulse text-green-500 mb-6" size={64} />
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-8 animate-pulse text-center">ACQUIRING_TARGET</h2>
                                
                                <div className="w-full font-mono text-xs md:text-sm h-48 overflow-hidden relative border-t border-b border-green-900/50 py-4">
                                    <div className="flex flex-col justify-end h-full gap-1">
                                        {scanText.map((line, i) => (
                                            <div key={i} className="text-green-400/80">
                                                <span className="text-green-700 mr-2">{`>`}</span>
                                                {line}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mt-6 flex gap-4 text-green-700 text-[10px] font-mono uppercase tracking-widest w-full justify-between">
                                    <span>ENCRYPTION: BYPASSED</span>
                                    <span>TRACE: 0%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-900 border border-zinc-800 text-green-500">
                                <Globe size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter text-glow">TARGET_DIRECTORY</h1>
                                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Select vulnerability sector to exploit</p>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Global Network Status</div>
                            <div className="text-green-500 font-bold font-mono">ONLINE // UNSECURED</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <DifficultyCard 
                            level="easy"
                            label="THE ELDERLY"
                            range="$800 - $1.2k"
                            unlocked={true}
                            icon={User}
                            colorClass="text-green-500"
                            borderClass="border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                            desc="High trust, low tech literacy. Vulnerable to 'Grandson' and 'Support' scripts. Low risk of police involvement."
                            onClick={() => onSelectDifficulty('easy')}
                        />
                        <DifficultyCard 
                            level="medium"
                            label="SMALL BIZ"
                            range="$2.5k - $3.5k"
                            unlocked={scamsCompleted >= 2}
                            icon={Briefcase}
                            colorClass="text-yellow-500"
                            borderClass="border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                            desc="Moderate security. Vulnerable to 'Invoice Fraud' and 'Tax Audits'. Requires some technical tools."
                            onClick={() => onSelectDifficulty('medium')}
                        />
                        <DifficultyCard 
                            level="hard"
                            label="THE EXEC"
                            range="$6k - $12k"
                            unlocked={scamsCompleted >= 5}
                            icon={Shield}
                            colorClass="text-red-500"
                            borderClass="border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                            desc="High security environment. Protected by assistants. Vulnerable to 'CEO Fraud' and 'Legal Threats'. Critical risk."
                            onClick={() => onSelectDifficulty('hard')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScamSelection;
