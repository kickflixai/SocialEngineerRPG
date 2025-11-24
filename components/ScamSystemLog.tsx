
import React from 'react';
import { Fingerprint, Database, Terminal, Wifi, Code, ArrowRight } from 'lucide-react';
import { ScamState, PlayerState } from '../types';

interface Props {
    scam: ScamState;
    player: PlayerState;
    mobileTab: 'comm' | 'intel' | 'sys';
    processing: boolean;
    lastThought: string | null;
    onOpenHack: () => void;
}

const ScamSystemLog: React.FC<Props> = ({ scam, player, mobileTab, processing, lastThought, onOpenHack }) => {
    // Tech 2 (Doxxing) reveals Hidden Secret
    const hasDoxxing = (player.skills['tech_2'] || 0) > 0; 
    // Social 2 (Cold Reading) reveals Psych Profile & Weakness
    const hasProfiler = (player.skills['social_2'] || 0) > 0;

    const secretRevealed = hasDoxxing || scam.revealedFacts.includes('secret');

    return (
        <div className={`${mobileTab === 'sys' ? 'flex' : 'hidden'} md:flex flex-col gap-4 h-full relative z-10 col-span-1 overflow-y-auto custom-scrollbar pr-1`}>
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-3 shrink-0 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center justify-between">
                    <span>Target Analysis</span>
                </h3>
                
                <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800/50 flex flex-col gap-1">
                    <h4 className="text-zinc-400 text-[10px] font-bold uppercase flex items-center gap-2 tracking-wider">
                        <Fingerprint size={12} className="text-purple-400"/> Psych Profile
                    </h4>
                    <p className="text-zinc-300 text-xs leading-relaxed font-mono">{scam.victim.personality}</p>
                </div>

                <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800/50 flex flex-col gap-1">
                    <h4 className="text-zinc-400 text-[10px] font-bold uppercase flex items-center gap-2 tracking-wider">
                        <Database size={12} className="text-orange-400"/> Intel
                    </h4>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">SECRET:</span>
                        <span className={`font-mono ${secretRevealed ? 'text-green-400' : 'text-red-900'}`}>{secretRevealed ? scam.victim.hiddenFact : 'ENCRYPTED'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">WEAKNESS:</span>
                        <span className={`font-mono ${hasProfiler ? 'text-green-400' : 'text-red-900'}`}>{hasProfiler ? scam.victim.weakness : 'ENCRYPTED'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl flex flex-col relative overflow-hidden shadow-xl flex-1 min-h-[12rem]">
                <div className="p-2 border-b border-zinc-800 bg-black/40 flex justify-between items-center">
                    <p className="text-green-600 uppercase font-bold text-[10px] flex items-center gap-2 tracking-widest"><Terminal size={12} className="text-green-500" /> SYS_LOG</p>
                    <div className="flex items-center gap-2"><Wifi size={12} className={processing ? "animate-pulse text-green-500" : "text-zinc-600"}/></div>
                </div>
                <div className="flex-1 p-2 font-mono text-[10px] overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="flex flex-col justify-start gap-2">
                        <div className="text-zinc-500">&gt;&gt; CONNECTION ESTABLISHED</div>
                            {lastThought && (
                            <div className="text-green-400 typing-effect leading-tight"><span className="text-zinc-500 mr-2">&gt;&gt;</span>{lastThought}</div>
                        )}
                        </div>
                        {processing && (
                        <div className="flex flex-col gap-1 text-green-500/50 justify-start mt-2"><div className="animate-pulse">&gt;&gt; ANALYZING INPUT VECTOR...</div></div>
                    )}
                </div>
            </div>

            <button 
                onClick={onOpenHack}
                className="w-full py-4 bg-zinc-900 hover:bg-blue-900/20 border border-zinc-700 hover:border-blue-500 rounded-xl text-zinc-400 hover:text-blue-400 transition-all font-bold font-mono text-xs flex items-center justify-center gap-2 group shadow-lg shrink-0"
            >
                <Code size={16} /> INITIALIZE HACKING CONSOLE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
            </button>
        </div>
    );
};

export default ScamSystemLog;
