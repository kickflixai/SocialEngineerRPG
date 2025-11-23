import React, { useState, useEffect, useRef } from 'react';
import { Shield, Globe, User, Briefcase, ChevronRight, Lock, AlertTriangle, ScanLine } from 'lucide-react';
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

// Matrix Rain Component
const MatrixRain = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for(let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for(let i = 0; i < drops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975)
                    drops[i] = 0;

                drops[i]++;
            }
        };

        const interval = setInterval(draw, 30);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40" />;
};

const ScamSelection: React.FC<Props> = ({ onSelectDifficulty, loading, scamsCompleted }) => {
    const [scanText, setScanText] = useState<string[]>([]);

    useEffect(() => {
        if (loading) {
            let i = 0;
            setScanText([]);
            const shuffled = [...LOADING_LINES].sort(() => 0.5 - Math.random());
            
            const interval = setInterval(() => {
                const line = i < shuffled.length ? shuffled[i] : "STILL_SEARCHING...";
                setScanText(prev => [...prev.slice(-12), line]); 
                i++;
            }, 100); 
            return () => clearInterval(interval);
        }
    }, [loading]);

    const DifficultyCard = ({ level, label, range, unlocked, icon: Icon, colorClass, borderClass, onClick }: any) => (
        <button 
            onClick={onClick}
            disabled={!unlocked}
            className={`relative group overflow-hidden border-2 flex flex-col items-center text-center transition-all duration-300 w-full h-full min-h-[300px] ${unlocked ? `bg-black ${borderClass} cursor-pointer hover:bg-zinc-900` : 'bg-black border-zinc-900 opacity-30 cursor-not-allowed'}`}
        >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

            <div className="w-full p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
                <span className={`text-xs font-mono font-bold uppercase tracking-[0.2em] ${unlocked ? 'text-zinc-500' : 'text-zinc-800'}`}>
                    SECTOR_{level.toUpperCase()}
                </span>
                {!unlocked && <Lock size={14} className="text-zinc-800"/>}
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 w-full gap-6">
                <Icon size={64} strokeWidth={1} className={unlocked ? colorClass : 'text-zinc-800'} />
                
                <div>
                    <h3 className={`text-4xl font-black font-mono tracking-tighter ${unlocked ? 'text-white' : 'text-zinc-800'}`}>
                        {label}
                    </h3>
                    <div className={`text-sm font-mono mt-2 ${unlocked ? 'text-zinc-400' : 'text-zinc-800'}`}>
                        Est. Yield: <span className={unlocked ? colorClass : ''}>{range}</span>
                    </div>
                </div>

                {unlocked && (
                    <div className={`mt-auto px-6 py-2 border border-${colorClass.split('-')[1]}-900 bg-${colorClass.split('-')[1]}-900/10 text-${colorClass.split('-')[1]}-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2 group-hover:bg-${colorClass.split('-')[1]}-500 group-hover:text-black transition-colors`}>
                        INITIATE <ChevronRight size={14}/>
                    </div>
                )}
            </div>
        </button>
    );

    return (
        <div className="h-full w-full relative flex flex-col bg-black font-mono">
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono overflow-hidden"
                    >
                        <MatrixRain />
                        
                        <div className="relative z-10 w-full max-w-3xl p-8 flex flex-col items-center">
                            <div className="border border-green-500 bg-black/90 p-8 w-full shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                                <div className="flex items-center justify-center gap-4 mb-8">
                                    <ScanLine className="animate-spin-slow text-green-500" size={48} />
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white animate-pulse">ACQUIRING_TARGET</h2>
                                </div>
                                
                                <div className="h-64 overflow-hidden border-t border-b border-green-900/50 bg-green-950/10 p-4 font-mono text-xs md:text-sm text-green-400 relative">
                                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                                    <div className="flex flex-col justify-end h-full gap-1">
                                        {scanText.map((line, i) => (
                                            <div key={i} className="opacity-80">{line}</div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mt-4 text-center text-green-700 text-[10px] font-bold uppercase tracking-[0.3em]">
                                    Encryption Bypassed // Access Granted
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-10">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="mb-8 flex items-end justify-between border-b border-green-900/30 pb-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-black border border-green-900 text-green-600">
                                <Globe size={40} strokeWidth={1} />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">TARGET_DIRECTORY</h1>
                                <p className="text-green-800 text-sm font-bold uppercase tracking-widest mt-1">Select Vulnerability Sector</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch pb-8">
                        <DifficultyCard 
                            level="easy"
                            label="THE ELDERLY"
                            range="$800 - $1.2k"
                            unlocked={true}
                            icon={User}
                            colorClass="text-green-500"
                            borderClass="border-green-600"
                            onClick={() => onSelectDifficulty('easy')}
                        />
                        <DifficultyCard 
                            level="medium"
                            label="SMALL BIZ"
                            range="$2.5k - $3.5k"
                            unlocked={scamsCompleted >= 2}
                            icon={Briefcase}
                            colorClass="text-yellow-500"
                            borderClass="border-yellow-600"
                            onClick={() => onSelectDifficulty('medium')}
                        />
                        <DifficultyCard 
                            level="hard"
                            label="THE EXEC"
                            range="$6k - $12k"
                            unlocked={scamsCompleted >= 5}
                            icon={Shield}
                            colorClass="text-red-500"
                            borderClass="border-red-600"
                            onClick={() => onSelectDifficulty('hard')}
                        />
                    </div>
                    
                    {(scamsCompleted < 2 || scamsCompleted < 5) && (
                        <div className="p-4 border border-zinc-800 bg-black text-zinc-600 text-center text-xs font-mono uppercase tracking-widest">
                            <AlertTriangle size={14} className="inline mr-2 -mt-1"/>
                            Additional Targets Locked // Complete Operations to Increase Reputation
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScamSelection;
