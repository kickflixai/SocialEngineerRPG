
import React from 'react';
import { Wifi, CheckCircle2, AlertTriangle, Zap, Target, Lock, Circle } from 'lucide-react';
import { ScamState } from '../types';

interface Props {
    scam: ScamState;
    mobileTab: 'comm' | 'intel' | 'sys';
}

const ScamStatus: React.FC<Props> = ({ scam, mobileTab }) => {
    return (
        <div className={`${mobileTab === 'intel' ? 'flex' : 'hidden'} md:flex flex-col gap-4 h-full relative z-10 col-span-1 overflow-y-auto custom-scrollbar pr-1`}>
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 md:p-6 flex flex-col items-center text-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0">
                <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 mb-3 mt-1 group">
                    <div className="absolute inset-0 rounded-full border border-dashed border-green-500/40 animate-spin-slow"></div>
                    <img src={scam.victim.avatarUrl} alt="Target" className="w-full h-full rounded-full object-cover border-4 border-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-1 -right-1 bg-black text-green-500 text-[9px] font-bold px-2 py-0.5 rounded border border-green-900 flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]"><Wifi size={8} className="animate-pulse" /> LIVE</div>
                </div>
                <h2 className="text-base md:text-lg font-bold text-white font-mono truncate w-full tracking-tight mb-0.5">{scam.victim.name}</h2>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">{scam.victim.age} Y/O // {scam.victim.occupation}</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 md:p-5 shadow-xl space-y-5 backdrop-blur-sm relative flex flex-col shrink-0">
                <div className="space-y-4 shrink-0">
                    <div>
                        <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-1"><span className="text-green-500 font-bold flex items-center gap-2"><CheckCircle2 size={12}/> TRUST</span><span className="text-white font-mono">{scam.trust}%</span></div>
                        <div className="h-2 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden shadow-inner relative"><div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-900 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-700 ease-out" style={{ width: `${scam.trust}%` }}></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-1"><span className="text-red-500 font-bold flex items-center gap-2"><AlertTriangle size={12}/> SUSPICION</span><span className="text-white font-mono">{scam.suspicion}%</span></div>
                        <div className="h-2 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden shadow-inner relative"><div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-700 ease-out" style={{ width: `${scam.suspicion}%` }}></div></div>
                    </div>
                </div>
                <div className="w-full bg-zinc-900/50 rounded-lg border border-blue-900/30 p-2">
                    <div className="flex justify-between items-end mb-1"><span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest flex items-center gap-1"><Zap size={10}/> HACKING POWER</span><span className="text-white font-mono text-xs font-bold">{scam.socialCharge}%</span></div>
                    <div className="w-full h-2 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden mb-1"><div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" style={{width: `${scam.socialCharge}%`}}></div></div>
                </div>
                <div className="border-t border-zinc-800 pt-4 flex-1 flex flex-col min-h-0">
                    <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={12} className="text-blue-500" /> Execution Steps</h4>
                    <div className="space-y-2">
                        {scam.objectives.map((obj, idx) => {
                            const isActive = !obj.isCompleted && (idx === 0 || scam.objectives[idx - 1].isCompleted);
                            const isLocked = !obj.isCompleted && !isActive;
                            return (
                                <div key={obj.id} className={`p-2 rounded border flex items-start gap-2 text-[10px] font-mono transition-all ${obj.isCompleted ? 'bg-green-900/20 border-green-500/30 text-green-400' : isActive ? 'bg-blue-900/20 border-blue-500/50 text-white shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                                    <div className="mt-0.5 shrink-0">{obj.isCompleted ? <CheckCircle2 size={12}/> : isLocked ? <Lock size={12}/> : <Circle size={12} className="animate-pulse text-blue-400"/>}</div>
                                    <div className="flex-1"><p className={`font-bold mb-0.5 ${isActive ? 'text-blue-400' : ''}`}>STEP 0{obj.order}: {obj.isFinal ? 'PAYLOAD' : 'INTEL'}</p><p className={isLocked ? 'opacity-50' : ''}>{obj.description}</p></div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScamStatus;
