import React, { useState, useEffect, useRef } from 'react';
import { Shield, Globe, User, Briefcase, ChevronRight, Lock, AlertTriangle, ScanLine, Terminal, Activity, Wifi, MapPin, Server, Search } from 'lucide-react';
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

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-20" />;
};

const ScamSelection: React.FC<Props> = ({ onSelectDifficulty, loading, scamsCompleted }) => {
    const [scanText, setScanText] = useState<string[]>([]);
    const [hoveredSector, setHoveredSector] = useState<'easy' | 'medium' | 'hard' | null>(null);

    useEffect(() => {
        if (loading) {
            let i = 0;
            setScanText([]);
            const shuffled = [...LOADING_LINES].sort(() => 0.5 - Math.random());
            
            const interval = setInterval(() => {
                const line = i < shuffled.length ? shuffled[i] : "STILL_SEARCHING...";
                setScanText(prev => [...prev.slice(-12), line]); 
                i++;
            }, 250); 
            return () => clearInterval(interval);
        }
    }, [loading]);

    const sectors = [
        { id: 'easy', label: 'THE ELDERLY', risk: 'LOW', yield: '$800 - $1.2k', req: 0, icon: User, desc: 'High trust vectors. Low technical barriers. Ideal for initial funding operations.' },
        { id: 'medium', label: 'SMALL BUSINESS', risk: 'MED', yield: '$2.5k - $3.5k', req: 2, icon: Briefcase, desc: 'Moderate security protocols. Vulnerable to invoice fraud and tax compliance schemes.' },
        { id: 'hard', label: 'EXECUTIVE', risk: 'HIGH', yield: '$6k - $12k', req: 5, icon: Shield, desc: 'Advanced security teams. High-value targets requiring precise social engineering.' },
    ];

    return (
        <div className="h-full w-full relative flex flex-col bg-black font-mono overflow-hidden">
             {/* Background Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

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

            {/* MAIN INTERFACE */}
            <div className="flex-1 p-4 md:p-8 relative z-10 flex flex-col">
                <div className="flex justify-between items-end border-b border-green-900/50 pb-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-green-500 mb-1">
                            <Globe size={16} className="animate-pulse"/>
                            <span className="text-xs font-bold tracking-[0.3em]">GLOBAL_NET_ACCESS</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">TARGET_DIRECTORY</h1>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] text-zinc-500 uppercase">System Status</div>
                        <div className="text-green-500 font-bold">ONLINE // UNSECURED</div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                    
                    {/* LEFT PANEL: DATABASE LIST */}
                    <div className="w-full md:w-2/3 border border-zinc-800 bg-black/50 flex flex-col">
                         {/* Table Header */}
                         <div className="flex bg-zinc-900/50 border-b border-zinc-800 p-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                             <div className="w-16">ID</div>
                             <div className="flex-1">SECTOR NAME</div>
                             <div className="w-24 text-center">RISK</div>
                             <div className="w-32 text-right">EST. YIELD</div>
                             <div className="w-24 text-center">STATUS</div>
                         </div>
                         
                         {/* Rows */}
                         <div className="flex-1 overflow-y-auto custom-scrollbar">
                             {sectors.map((sector, idx) => {
                                 const isUnlocked = scamsCompleted >= sector.req;
                                 const isHovered = hoveredSector === sector.id as any;
                                 
                                 return (
                                     <button
                                        key={sector.id}
                                        onClick={() => isUnlocked && onSelectDifficulty(sector.id as any)}
                                        onMouseEnter={() => setHoveredSector(sector.id as any)}
                                        onMouseLeave={() => setHoveredSector(null)}
                                        className={`w-full flex items-center p-4 border-b border-zinc-800 transition-all text-left group relative overflow-hidden ${
                                            isUnlocked 
                                            ? 'hover:bg-green-900/20 cursor-pointer' 
                                            : 'opacity-50 cursor-not-allowed bg-zinc-950/50'
                                        }`}
                                     >
                                         {isHovered && isUnlocked && <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>}
                                         {isHovered && isUnlocked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>}

                                         <div className="w-16 font-mono text-zinc-600 text-xs">0{idx + 1}</div>
                                         <div className="flex-1 font-mono font-bold text-sm md:text-base text-white group-hover:text-green-400 transition-colors flex items-center gap-3">
                                             <sector.icon size={16} className={isUnlocked ? 'text-zinc-500 group-hover:text-green-500' : 'text-zinc-700'} />
                                             {sector.label}
                                         </div>
                                         <div className={`w-24 text-center text-xs font-bold ${
                                             sector.risk === 'LOW' ? 'text-green-500' : sector.risk === 'MED' ? 'text-yellow-500' : 'text-red-500'
                                         }`}>
                                             {sector.risk}
                                         </div>
                                         <div className="w-32 text-right text-xs font-mono text-zinc-400 group-hover:text-white">
                                             {isUnlocked ? sector.yield : '????'}
                                         </div>
                                         <div className="w-24 text-center flex justify-center">
                                             {isUnlocked ? (
                                                 <ChevronRight size={16} className={`transition-transform ${isHovered ? 'translate-x-1 text-green-500' : 'text-zinc-600'}`} />
                                             ) : (
                                                 <Lock size={14} className="text-zinc-700" />
                                             )}
                                         </div>
                                     </button>
                                 );
                             })}
                             
                             {/* Fake Rows for aesthetic */}
                             {[...Array(5)].map((_, i) => (
                                 <div key={i} className="w-full flex p-4 border-b border-zinc-900 opacity-20 pointer-events-none">
                                     <div className="w-16 text-zinc-700 text-xs">0{i + 4}</div>
                                     <div className="flex-1 text-zinc-700 font-mono text-sm">CORRUPTED_SECTOR_{i+84}</div>
                                     <div className="w-24 text-center text-zinc-700 text-xs">ERR</div>
                                     <div className="w-32 text-right text-zinc-700 text-xs">---</div>
                                     <div className="w-24"></div>
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* RIGHT PANEL: PREVIEW */}
                    <div className="hidden md:flex w-1/3 bg-zinc-950 border border-green-900/30 flex-col relative overflow-hidden">
                        {/* Scanline */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 animate-scan pointer-events-none"></div>

                        {hoveredSector ? (
                            <div className="flex-1 p-6 flex flex-col">
                                <div className="border border-green-500/30 bg-green-900/10 p-4 mb-6 flex flex-col items-center justify-center min-h-[160px] relative">
                                    <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-green-500"></div>
                                    <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-green-500"></div>
                                    <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-bottom border-green-500"></div>
                                    <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-bottom border-green-500"></div>
                                    
                                    {(() => {
                                        const SecIcon = sectors.find(s => s.id === hoveredSector)?.icon || User;
                                        return <SecIcon size={64} strokeWidth={1} className="text-green-500 mb-4 animate-pulse" />;
                                    })()}
                                    <div className="text-green-400 font-mono text-sm uppercase tracking-widest">Target Acquired</div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Sector Analysis</div>
                                        <h3 className="text-xl font-bold text-white font-mono">{sectors.find(s => s.id === hoveredSector)?.label}</h3>
                                    </div>
                                    
                                    <div className="h-[1px] w-full bg-green-900/50"></div>

                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Intelligence Summary</div>
                                        <p className="text-xs text-green-400/80 font-mono leading-relaxed">
                                            {sectors.find(s => s.id === hoveredSector)?.desc}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-zinc-900 p-2 border border-zinc-800">
                                            <div className="text-[9px] text-zinc-500 uppercase">Est. Revenue</div>
                                            <div className="text-sm font-bold text-white">{sectors.find(s => s.id === hoveredSector)?.yield}</div>
                                        </div>
                                        <div className="bg-zinc-900 p-2 border border-zinc-800">
                                            <div className="text-[9px] text-zinc-500 uppercase">Trace Risk</div>
                                            <div className={`text-sm font-bold ${sectors.find(s => s.id === hoveredSector)?.risk === 'LOW' ? 'text-green-500' : 'text-red-500'}`}>
                                                {sectors.find(s => s.id === hoveredSector)?.risk}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-6 text-center">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="text-xs font-mono uppercase tracking-widest">Awaiting Selection...</p>
                                <p className="text-[10px] mt-2 max-w-[200px]">Hover over a sector to view vulnerability assessment.</p>
                            </div>
                        )}

                        <div className="p-2 border-t border-zinc-800 bg-black text-[10px] text-zinc-600 font-mono flex justify-between">
                             <span>MEM_USAGE: 42%</span>
                             <span>SECURE_CONNECTION</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScamSelection;