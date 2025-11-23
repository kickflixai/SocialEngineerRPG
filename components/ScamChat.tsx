
import React, { useRef, useEffect } from 'react';
import { Power, Target, Zap, Loader2, Lightbulb, Package, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScamState, PlayerState } from '../types';

interface Props {
    scam: ScamState;
    player: PlayerState;
    mobileTab: 'comm' | 'intel' | 'sys';
    input: string;
    setInput: (s: string) => void;
    processing: boolean;
    hints: string[];
    loadingHints: boolean;
    onSend: (override?: string) => void;
    onRequestHint: () => void;
    onOpenInventory: () => void;
    onAbortConfirm: () => void;
    onSuccessModal: () => void;
    allCompleted: boolean;
}

const ScamChat: React.FC<Props> = ({ 
    scam, player, mobileTab, input, setInput, processing, hints, loadingHints, 
    onSend, onRequestHint, onOpenInventory, onAbortConfirm, onSuccessModal, allCompleted 
}) => {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const activeObjective = scam.objectives.find(o => !o.isCompleted) || scam.objectives[scam.objectives.length - 1];

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => {
        if (mobileTab === 'comm') scrollToBottom();
    }, [scam.history, processing, hints, mobileTab]);

    useEffect(() => {
        if (!processing && mobileTab === 'comm') {
            setTimeout(() => { inputRef.current?.focus(); }, 50);
        }
    }, [processing, mobileTab]);

    return (
        <div className={`${mobileTab === 'comm' ? 'flex' : 'hidden'} md:flex flex-1 md:col-span-1 flex-col bg-zinc-950 border border-zinc-800/60 rounded-xl overflow-hidden relative shadow-2xl h-full z-10`}>
            <div className="h-auto min-h-14 bg-black/60 backdrop-blur border-b border-zinc-800 flex flex-col px-3 md:px-6 py-2 md:py-3 shrink-0 justify-center">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div><div className="text-xs md:text-sm font-mono font-bold text-white tracking-widest">SECURE_CHANNEL_V2</div></div>
                    <div className="flex items-center gap-2 md:gap-3"><button onClick={onAbortConfirm} className="text-[10px] font-bold font-mono flex items-center gap-2 px-2 py-1.5 rounded border border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40 hover:border-red-500 transition-all"><Power size={12} /> <span className="hidden md:inline">DISCONNECT</span></button></div>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded px-2 py-1.5 md:px-3 md:py-2 flex items-center gap-2 md:gap-3 animate-pulse">
                    <Target size={12} className="text-blue-400 shrink-0" />
                    <div className="flex flex-col min-w-0"><span className="text-[9px] text-blue-300 font-mono font-bold tracking-wider uppercase whitespace-nowrap">CURRENT TASK:</span><span className="text-[10px] text-white font-mono truncate">{activeObjective.description}</span></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 to-black custom-scrollbar min-h-0 relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                {scam.history.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: msg.sender === 'player' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex relative z-10 ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'victim' && <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-2 md:mr-3 border border-zinc-600 shadow-lg flex-shrink-0 self-end mb-1"><img src={scam.victim.avatarUrl} alt="avatar" className="w-full h-full object-cover" /></div>}
                    {msg.sender === 'system' ? (
                            <div className="max-w-[90%] p-2 rounded border bg-yellow-900/20 border-yellow-500/30 text-yellow-200 font-mono text-xs tracking-tight flex items-center gap-2"><Zap size={12} className="text-yellow-500 animate-pulse shrink-0"/>{msg.text}</div>
                    ) : (
                        <div className={`max-w-[90%] p-3 rounded-xl text-xs md:text-sm leading-relaxed shadow-lg backdrop-blur-md border ${msg.sender === 'player' ? 'bg-green-900/10 border-green-500/30 text-green-50 rounded-br-none' : 'bg-zinc-800/60 border-zinc-600/30 text-zinc-200 rounded-bl-none'}`}><p>{msg.text}</p></div>
                    )}
                </motion.div>
                ))}
                <AnimatePresence>
                {hints.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col gap-2 items-end mb-2 relative z-20">
                        <span className="text-[9px] md:text-[10px] text-blue-400 font-mono uppercase tracking-wider bg-black/80 px-2 rounded">Suggested Response Vectors</span>
                        <div className="flex flex-wrap gap-2 justify-end max-w-2xl">
                            {hints.map((hint, idx) => <button key={idx} onClick={() => onSend(hint)} className="text-[10px] md:text-xs bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 text-blue-200 px-2 py-1 md:px-3 md:py-2 rounded-lg text-left hover:border-blue-500 transition-colors">"{hint}"</button>)}
                        </div>
                    </motion.div>
                )}
                {processing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start items-center gap-2 relative z-10">
                            <div className="bg-zinc-900/50 border border-zinc-700/50 px-3 py-2 md:px-4 md:py-3 rounded-xl rounded-bl-none flex gap-1.5 items-center">
                                <span className="text-[10px] md:text-xs text-zinc-500 font-mono animate-pulse">TYPING</span>
                            <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-75"></div><div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-1" />
            </div>

            <div className="p-2 md:p-3 bg-black/80 backdrop-blur border-t border-zinc-800 shrink-0 relative z-20">
                <div className="flex gap-2">
                    <div className="relative flex gap-2">
                    <button onClick={onRequestHint} disabled={loadingHints || processing || scam.trust < 20} className={`p-3 rounded-lg border bg-black border-zinc-700 text-zinc-400 transition-all relative group ${scam.trust >= 20 ? 'hover:text-blue-400 hover:border-blue-500' : 'opacity-30 cursor-not-allowed'}`}>
                            {loadingHints ? <Loader2 size={18} className="animate-spin"/> : <Lightbulb size={18}/>}
                    </button>
                    <button onClick={onOpenInventory} className="p-3 rounded-lg border bg-black border-zinc-700 text-zinc-400 hover:text-purple-400 hover:border-purple-500 transition-all relative group">
                            <Package size={18}/>
                            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{player.inventory.length}</span>
                    </button>
                    </div>

                    {allCompleted ? (
                        <button 
                        onClick={onSuccessModal}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg p-3 flex items-center justify-center gap-2 animate-pulse"
                        >
                            <CheckCircle2 size={20} /> MISSION COMPLETE - SECURE FUNDS
                        </button>
                    ) : (
                    <>
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={input} 
                            autoFocus={window.innerWidth > 768}
                            onChange={(e) => { setInput(e.target.value); }} 
                            onKeyDown={(e) => e.key === 'Enter' && onSend()} 
                            disabled={processing} 
                            placeholder="Type payload..." 
                            className="flex-1 bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 outline-none transition-all font-mono text-xs"
                        />
                        <button onClick={() => onSend()} disabled={processing || !input.trim()} className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-zinc-800 text-black font-bold px-4 rounded-lg transition-all flex items-center justify-center"><Send size={18} /></button>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScamChat;
