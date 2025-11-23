import React, { useState, useEffect } from 'react';
import { Shield, Radio, Globe, User, Briefcase, ChevronRight, Lock, AlertTriangle, ScanLine } from 'lucide-react';
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
    "BYPASSING_MORAL_COMPASS...",
    "IGNORING_ETHICS_COMMITTEE...",
    "CONVERTING_PDF_TO_DOCX_FOR_SOME_REASON...",
    "ARGUEING_WITH_CHATGPT...",
    "PRETENDING_TO_BE_THE_IRS...",
    "GUESSING_MOTHERS_MAIDEN_NAME...",
    "REROLLING_STATS...",
    "BUYING_BITCOIN_AT_THE_TOP...",
    "SEARCHING_FOR_UNPROTECTED_WIFI...",
    "GENERATING_SAD_BACKSTORY...",
    "LOCATING_PRINCE_OF_NIGERIA...",
    "REFRESHING_PAGE...",
    "DELETING_BROWSER_HISTORY...",
    "ENABLING_DARK_MODE...",
    "HACKING_INTO_MAINFRAME_(NOT_REAL)...",
    "ZOOM_ENHANCE...",
    "PLAYING_ELEVATOR_MUSIC...",
    "READING_TERMS_OF_SERVICE_(JUST_KIDDING)...",
    "ASKING_MOM_FOR_MONEY...",
    "STEALING_WIFI_FROM_NEIGHBOR...",
    "UPDATING_WINDOWS_95...",
    "INSTALLING_TOOLBARS...",
    "OPTIMIZING_IF_STATEMENTS...",
    "TARGET_LOCKED."
];

const ScamSelection: React.FC<Props> = ({ onSelectDifficulty, loading, scamsCompleted }) => {
    const [scanText, setScanText] = useState<string[]>([]);

    useEffect(() => {
        if (loading) {
            let i = 0;
            setScanText([]);
            // Pick random start lines but always end with Target Locked
            const shuffled = [...LOADING_LINES].sort(() => 0.5 - Math.random());
            // Ensure we have enough lines
            
            const interval = setInterval(() => {
                const line = i < shuffled.length ? shuffled[i] : "STILL_SEARCHING...";
                setScanText(prev => [...prev.slice(-8), line]); // Keep last 8 lines
                i++;
            }, 150); // Faster updates for more "hacker" feel
            return () => clearInterval(interval);
        }
    }, [loading]);

    const DifficultyCard = ({ level, label, range, unlocked, icon: Icon, colorClass, borderClass, onClick }: any) => (
        <button 
            onClick={onClick}
            disabled={!unlocked}
            className={`relative group overflow-hidden border flex flex-col items-center text-center transition-all duration-300 w-full h-full min-h-[300px] rounded-2xl ${unlocked ? `bg-zinc-900/40 hover:bg-zinc-900/80 ${borderClass} cursor-pointer hover:scale-[1.02] shadow-2xl` : 'bg-black border-zinc-900 opacity-40 cursor-not-allowed'}`}
        >
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>

            {/* Header Status */}
            <div className="w-full p-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-sm">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${unlocked ? 'text-zinc-500' : 'text-zinc-700'}`}>
                    SECTOR_{level.toUpperCase()}
                </span>
                {!unlocked ? <Lock size={14} className="text-zinc-700"/> : <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')} animate-pulse`}></div>}
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 w-full">
                <div className={`p-6 rounded-full border-2 mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${unlocked ? `${colorClass} ${borderClass} bg-black/50` : 'text-zinc-700 border-zinc-800'}`}>
                    <Icon size={48} strokeWidth={1.5} />
                </div>
                
                <h3 className={`text-4xl md:text-5xl font-black font-mono mb-2 tracking-tighter ${unlocked ? 'text-white' : 'text-zinc-700'}`}>
                    {label}
                </h3>
                
                <div className={`text-sm md:text-base font-mono mb-6 px-4 py-1.5 rounded-full ${unlocked ? 'bg-zinc-950 border border-zinc-800 text-zinc-300' : 'text-zinc-800'}`}>
                    Yield: <span className={`font-bold ${unlocked ? colorClass : ''}`}>{range}</span>
                </div>

                {/* Security Bars */}
                <div className="flex flex-col gap-1 items-center w-24 mb-6">
                    <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest">Risk Level</span>
                    <div className="flex gap-1 w-full h-1.5">
                        {[1,2,3].map(i => (
                            <div key={i} className={`flex-1 rounded-full ${level === 'easy' ? (i===1 ? 'bg-green-500' : 'bg-zinc-800') : level === 'medium' ? (i<=2 ? 'bg-yellow-500' : 'bg-zinc-800') : 'bg-red-500'}`}></div>
                        ))}
                    </div>
                </div>

                {unlocked && (
                    <div className={`w-full py-3 mt-auto rounded-lg font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${unlocked ? `bg-white/5 hover:bg-white/10 ${colorClass}` : ''}`}>
                        INITIATE HACK <ChevronRight size={14}/>
                    </div>
                )}
            </div>
        </button>
    );

    return (
        <div className="h-full w-full relative flex flex-col bg-black">
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center font-mono p-4"
                    >
                        <div className="w-full max-w-2xl border border-green-500/30 bg-black p-8 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)] rounded-3xl">
                            <div className="relative z-10 flex flex-col items-center">
                                <ScanLine className="animate-spin-slow text-green-500 mb-8 opacity-80" size={80} strokeWidth={1} />
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-8 animate-pulse text-center">ACQUIRING_TARGET</h2>
                                
                                <div className="w-full font-mono text-xs md:text-sm h-48 overflow-hidden relative border-y border-green-900/30 py-4 bg-green-950/5">
                                    <div className="flex flex-col justify-end h-full gap-1.5 items-center">
                                        {scanText.map((line, i) => (
                                            <motion.div 
                                                key={i} 
                                                initial={{opacity: 0, y: 10}} 
                                                animate={{opacity: 1, y: 0}} 
                                                className="text-green-400/80 w-full text-center"
                                            >
                                                {line}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex gap-4 text-green-700 text-[10px] font-mono uppercase tracking-widest w-full justify-center">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> ENCRYPTION: BYPASSED</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

                <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col">
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 gap-4">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-green-500 shadow-lg shadow-green-900/10">
                                <Globe size={40} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter text-glow">TARGET_DIRECTORY</h1>
                                <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest mt-1">Select vulnerability sector to exploit</p>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Network Status</div>
                            <div className="text-green-500 font-bold font-mono text-lg flex items-center justify-end gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> ONLINE
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
                        <DifficultyCard 
                            level="easy"
                            label="THE ELDERLY"
                            range="$800 - $1.2k"
                            unlocked={true}
                            icon={User}
                            colorClass="text-green-500"
                            borderClass="border-green-500 shadow-green-500/20"
                            onClick={() => onSelectDifficulty('easy')}
                        />
                        <DifficultyCard 
                            level="medium"
                            label="SMALL BIZ"
                            range="$2.5k - $3.5k"
                            unlocked={scamsCompleted >= 2}
                            icon={Briefcase}
                            colorClass="text-yellow-500"
                            borderClass="border-yellow-500 shadow-yellow-500/20"
                            onClick={() => onSelectDifficulty('medium')}
                        />
                        <DifficultyCard 
                            level="hard"
                            label="THE EXEC"
                            range="$6k - $12k"
                            unlocked={scamsCompleted >= 5}
                            icon={Shield}
                            colorClass="text-red-500"
                            borderClass="border-red-500 shadow-red-500/20"
                            onClick={() => onSelectDifficulty('hard')}
                        />
                    </div>
                    
                    {/* Locked warning */}
                    {(scamsCompleted < 2 || scamsCompleted < 5) && (
                        <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center gap-3 text-zinc-500 text-sm font-mono">
                            <AlertTriangle size={16} />
                            <span>HIGHER TIERS LOCKED: COMPLETE MORE OPERATIONS TO INCREASE REPUTATION</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScamSelection;
