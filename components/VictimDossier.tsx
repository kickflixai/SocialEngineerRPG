
import React, { useState } from 'react';
import { Victim, PlayerState } from '../types';
import { User, Briefcase, Lock, Unlock, Fingerprint, Database, Siren, Loader2, BrainCircuit } from 'lucide-react';
import { SCAM_CATEGORIES } from '../constants';

interface Props {
  victim: Victim;
  player: PlayerState;
  onExecute: (category: string) => void;
  onAbort: () => void;
  loading: boolean;
}

const VictimDossier: React.FC<Props> = ({ victim, player, onExecute, loading }) => {
  const hasDoxxing = player.skills.includes('doxxing_suite');
  const hasScraper = player.skills.includes('social_scraper');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Helper to render a trait bar
  const TraitBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
      <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500">
              <span>{label}</span>
              <span className="text-white">{value}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${color}`} 
                style={{ width: `${value}%` }}
              ></div>
          </div>
      </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-black/40 p-2 md:p-8">
      <div className="max-w-6xl w-full mx-auto bg-zinc-950 border-x md:border border-zinc-800/80 md:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative">
        {/* CRT Line */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20 opacity-50"></div>

        {/* Left: Photo & Basic ID */}
        <div className="w-full md:w-1/3 bg-black/60 p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col items-center relative shrink-0">
           <div className="relative w-32 h-32 md:w-56 md:h-56 mb-4 md:mb-6 rounded-xl overflow-hidden border-2 border-zinc-700 shadow-[0_0_30px_rgba(0,255,0,0.1)] group shrink-0">
               <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay z-10"></div>
               <img src={victim.avatarUrl} alt={victim.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
               <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] animate-scan opacity-50"></div>
           </div>

           <h2 className="text-2xl md:text-3xl font-bold text-white font-mono text-center mb-1 tracking-tighter">{victim.name}</h2>
           <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mb-4 md:mb-8">
               <span className={`w-2 h-2 rounded-full animate-pulse ${victim.difficulty === 'easy' ? 'bg-green-500 shadow-[0_0_10px_green]' : victim.difficulty === 'medium' ? 'bg-yellow-500 shadow-[0_0_10px_yellow]' : 'bg-red-500 shadow-[0_0_10px_red]'}`}></span>
               Class: {victim.difficulty}
           </div>

           <div className="w-full space-y-2 md:space-y-4 mb-4 md:mb-6">
               <div className="flex justify-between p-3 md:p-4 bg-zinc-900/50 rounded border-l-2 border-zinc-700 hover:border-green-500 transition-colors">
                   <span className="text-zinc-500 text-xs uppercase flex items-center gap-2 font-bold"><User size={12}/> Age</span>
                   <span className="text-white font-mono">{victim.age}</span>
               </div>
               <div className="flex justify-between p-3 md:p-4 bg-zinc-900/50 rounded border-l-2 border-zinc-700 hover:border-green-500 transition-colors">
                   <span className="text-zinc-500 text-xs uppercase flex items-center gap-2 font-bold"><Briefcase size={12}/> Role</span>
                   <span className="text-white font-mono text-right text-xs">{victim.occupation}</span>
               </div>
           </div>

           <div className="w-full bg-zinc-900/30 p-3 md:p-4 rounded border border-zinc-800/50 mb-4">
               <h4 className="text-zinc-400 text-xs font-bold uppercase mb-2 flex items-center gap-2 tracking-wider">
                   <Fingerprint size={14} className="text-blue-500"/> Psych Profile
               </h4>
               <p className="text-zinc-300 text-xs leading-relaxed font-mono">{victim.personality}</p>
           </div>
        </div>

        {/* Right: Intel & Strategy Selection */}
        <div className="w-full md:w-2/3 p-6 md:p-8 bg-zinc-900/20 flex flex-col h-auto relative">
           <div className="mb-6 shrink-0">
               <h3 className="text-xl md:text-2xl font-bold text-white font-mono mb-1 flex items-center gap-3 tracking-tighter">
                   <Database size={24} className="text-green-500"/> INTEL_DATABASE
               </h3>
               <p className="text-zinc-500 text-sm font-mono">Decrypting subject metadata...</p>
           </div>

           {/* PSYCHOMETRICS (New Section) */}
           {victim.traits && (
               <div className="mb-6 bg-zinc-950/50 border border-zinc-800 p-4 rounded-xl shrink-0">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BrainCircuit size={14} className="text-purple-500"/> Psychometrics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <TraitBar label="Skepticism" value={victim.traits.skepticism} color="bg-red-500" />
                        <TraitBar label="Neuroticism" value={victim.traits.neuroticism} color="bg-orange-500" />
                        <TraitBar label="Tech Lit" value={victim.traits.techLiteracy} color="bg-blue-500" />
                        <TraitBar label="Openness" value={victim.traits.openness} color="bg-green-500" />
                    </div>
               </div>
           )}

           {/* Intel Grid */}
           <div className="grid grid-cols-1 gap-4 mb-8 shrink-0">
               {/* Hidden Fact */}
               <div className={`p-5 rounded-xl border backdrop-blur-sm transition-all ${hasDoxxing ? 'bg-green-950/20 border-green-500/30' : 'bg-zinc-950/50 border-zinc-800'}`}>
                   <div className="flex justify-between items-start mb-3">
                       <h4 className={`text-xs font-bold uppercase flex items-center gap-2 tracking-wider ${hasDoxxing ? 'text-green-400' : 'text-red-400'}`}>
                           {hasDoxxing ? <Unlock size={14}/> : <Lock size={14}/>} Deep Web Leak
                       </h4>
                   </div>
                   {hasDoxxing ? (
                       <p className="text-green-100 text-sm font-mono">{victim.hiddenFact}</p>
                   ) : (
                       <p className="text-red-900/50 font-mono text-sm select-none tracking-widest">
                           ENCRYPTED // NO ACCESS
                       </p>
                   )}
                   {!hasDoxxing && <div className="mt-2 text-[10px] uppercase text-zinc-600 bg-black/40 inline-block px-2 py-1 rounded">Req: Doxxing Suite</div>}
               </div>

                {/* Weakness */}
                <div className={`p-5 rounded-xl border backdrop-blur-sm transition-all ${hasScraper ? 'bg-green-950/20 border-green-500/30' : 'bg-zinc-950/50 border-zinc-800'}`}>
                   <div className="flex justify-between items-start mb-3">
                       <h4 className={`text-xs font-bold uppercase flex items-center gap-2 tracking-wider ${hasScraper ? 'text-green-400' : 'text-red-400'}`}>
                           {hasScraper ? <Unlock size={14}/> : <Lock size={14}/>} Exploit Vector
                       </h4>
                   </div>
                   {hasScraper ? (
                       <p className="text-green-100 text-sm font-mono">{victim.weakness}</p>
                   ) : (
                       <p className="text-red-900/50 font-mono text-sm select-none tracking-widest">
                           ENCRYPTED // NO ACCESS
                       </p>
                   )}
                   {!hasScraper && <div className="mt-2 text-[10px] uppercase text-zinc-600 bg-black/40 inline-block px-2 py-1 rounded">Req: Social Scraper</div>}
               </div>
           </div>

           {/* Strategy Selection */}
           <div className="flex-1 flex flex-col min-h-0">
                <h3 className="text-sm font-bold text-white font-mono mb-4 uppercase tracking-widest border-b border-zinc-800 pb-2">Select Payload Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                    {SCAM_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-4 text-left rounded-lg border text-xs font-mono transition-all relative overflow-hidden group ${
                                selectedCategory === cat 
                                ? 'bg-green-900/20 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                            }`}
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${selectedCategory === cat ? 'bg-green-500' : 'bg-transparent group-hover:bg-zinc-700'}`}></div>
                            {cat}
                        </button>
                    ))}
                </div>
           </div>

           {/* Footer Actions */}
           <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col md:flex-row justify-end items-center gap-4 shrink-0 relative z-20 pb-8 md:pb-0">
               <div className="w-full md:w-auto flex items-center gap-4 order-1 md:order-2">
                   {loading && <span className="text-green-500 font-mono text-xs animate-pulse hidden md:inline">ESTABLISHING UPLINK...</span>}
                   <button 
                    onClick={() => selectedCategory && onExecute(selectedCategory)}
                    disabled={!selectedCategory || loading}
                    className="w-full md:w-auto px-8 md:px-10 py-4 bg-green-600 hover:bg-green-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] font-mono tracking-tighter text-lg"
                   >
                       {loading ? <Loader2 size={20} className="animate-spin"/> : <Siren size={20}/>}
                       INITIATE_HACK
                   </button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VictimDossier;
