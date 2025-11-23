import React, { useState, useEffect } from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, Package, Power, Activity, Crosshair, Trophy, Zap, Terminal, Globe, Wifi } from 'lucide-react';
import { ALL_SKILLS, ACHIEVEMENTS } from '../constants';
import { motion } from 'framer-motion';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
  onOpenInventory: () => void;
  onReset: () => void;
}

const TerminalCard = ({ children, title, className = "", icon: Icon, rightContent }: any) => (
    <div className={`bg-black/80 border border-green-900/30 flex flex-col relative overflow-hidden group hover:border-green-500/50 transition-colors ${className}`}>
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-green-700/50"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-green-700/50"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-green-700/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-green-700/50"></div>

        {/* Header */}
        <div className="bg-green-950/10 border-b border-green-900/20 p-2 flex justify-between items-center shrink-0 h-8">
            <div className="flex items-center gap-2 text-green-600">
                {Icon && <Icon size={12} />}
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">{title}</span>
            </div>
            {rightContent}
        </div>
        
        {/* Content with Flex-1 to fill space properly */}
        <div className="flex-1 min-h-0 relative p-0 flex flex-col">
            {children}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        </div>
    </div>
);

const ActionButton = ({ title, sub, icon: Icon, onClick, color = "green" }: any) => (
    <button 
        onClick={onClick}
        className={`group relative w-full h-full border border-zinc-800 bg-zinc-950/50 hover:bg-black transition-all duration-300 flex flex-col items-start justify-between p-5 overflow-hidden hover:border-${color}-500/50`}
    >
        <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`}>
             <Icon size={56} strokeWidth={1} className={`text-${color}-500`} />
        </div>

        <div className="relative z-10 mt-auto">
            <div className={`flex items-center gap-2 text-${color}-500 mb-2 opacity-50 group-hover:opacity-100`}>
                <div className={`w-1 h-1 bg-${color}-500`}></div>
                <div className={`h-[1px] w-12 bg-${color}-500`}></div>
            </div>
            <h3 className={`text-xl font-bold font-mono uppercase tracking-widest text-white group-hover:text-${color}-400 group-hover:text-glow`}>{title}</h3>
            <p className={`text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 group-hover:text-${color}-600 mt-1`}>{sub}</p>
        </div>
    </button>
);

const Dashboard: React.FC<Props> = ({ player, onChangeView, onOpenInventory, onReset }) => {
  const activeSkills = Object.entries(player.skills).filter(([_, level]) => level > 0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-full bg-black text-green-500 font-mono p-4 lg:p-6 flex flex-col gap-4 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.05),transparent_70%)] pointer-events-none"></div>

        {/* --- ROW 1: STATUS & DATA (More compact) --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[140px] shrink-0">
            
            {/* 1.1: PROFILE (Col 4) */}
            <TerminalCard title="PERSONNEL_RECORD" icon={Terminal} className="md:col-span-4" 
                rightContent={<div className="flex gap-1"><div className="w-1.5 h-1.5 bg-green-500 animate-pulse"></div></div>}>
                <div className="flex h-full p-3 gap-4 items-center relative z-10">
                    <div className="relative h-24 w-24 shrink-0 border border-green-800 p-1">
                        <img src={player.attributes.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-green-900 text-[8px] text-green-300 px-1 border border-green-700">IMG_01</div>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Alias</div>
                        <div className="text-lg font-bold text-white tracking-wider truncate">{player.attributes.name}</div>
                        
                        <div className="h-[1px] w-full bg-green-900/50 my-2"></div>
                        
                        <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                            <div>
                                <div className="text-[8px] text-zinc-600 uppercase">Class</div>
                                <div className="text-[10px] text-green-400 font-bold uppercase truncate">{player.attributes.archetype}</div>
                            </div>
                            <div>
                                <div className="text-[8px] text-zinc-600 uppercase">Origin</div>
                                <div className="text-[10px] text-green-400 font-bold uppercase truncate">{player.attributes.country}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </TerminalCard>

            {/* 1.2: METRICS (Col 5) */}
            <TerminalCard title="FINANCIAL_DATA" icon={Activity} className="md:col-span-5">
                 <div className="grid grid-cols-2 h-full relative z-10">
                     <div className="p-3 border-r border-green-900/30 flex flex-col justify-center">
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Liquid Assets</div>
                        <div className="text-2xl lg:text-3xl font-bold text-white tracking-tighter shadow-green-500/50 drop-shadow-sm truncate">
                            ${player.money.toLocaleString()}
                        </div>
                        <div className="text-[8px] text-green-700 mt-1 flex items-center gap-1">
                            <Wifi size={10} /> ENCRYPTED_WALLET
                        </div>
                     </div>
                     <div className="p-3 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-900/5"></div>
                        <div className="text-[9px] text-red-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                             <ShieldAlert size={12}/> Threat Level
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-red-500 tracking-tighter relative z-10">
                            {Math.round(player.threatLevel)}%
                        </div>
                        <div className="w-full bg-red-950 h-1 mt-2 relative overflow-hidden">
                            <div className="h-full bg-red-600 transition-all duration-500" style={{width: `${player.threatLevel}%`}}></div>
                        </div>
                     </div>
                 </div>
            </TerminalCard>

            {/* 1.3: CONTROLS (Col 3) */}
            <TerminalCard title="SYSTEM_CMDS" icon={Power} className="md:col-span-3">
                <div className="flex flex-col h-full p-2 gap-2 justify-center">
                    <button onClick={onOpenInventory} className="flex-1 bg-zinc-900/50 border border-zinc-800 hover:border-green-500 hover:bg-green-900/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-3 uppercase font-bold text-xs tracking-widest group">
                        <Package size={16} className="text-zinc-600 group-hover:text-green-500"/> 
                        <span>Inventory</span>
                        <span className="bg-zinc-800 text-white px-1.5 py-0.5 text-[9px]">{player.inventory.length}</span>
                    </button>
                    <button onClick={onReset} className="h-8 bg-red-950/10 border border-red-900/30 hover:bg-red-950/30 hover:border-red-600/50 text-red-800 hover:text-red-500 transition-all flex items-center justify-center gap-2 uppercase font-bold text-[9px] tracking-widest">
                        Initialize Wipe
                    </button>
                </div>
            </TerminalCard>
        </div>

        {/* --- ROW 2: ACTIONS (Compact) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[180px] shrink-0">
             <div className="col-span-1 h-full shadow-[0_0_50px_rgba(34,197,94,0.05)]">
                <ActionButton 
                    title="Acquire Target" 
                    sub="Global Network Scan" 
                    icon={Crosshair} 
                    color="green" 
                    onClick={() => onChangeView(GameView.SCAM_SELECTION)} 
                />
             </div>
             <div className="col-span-1 h-full shadow-[0_0_50px_rgba(59,130,246,0.05)]">
                <ActionButton 
                    title="Neural Upgrades" 
                    sub="Enhance Capabilities" 
                    icon={BrainCircuit} 
                    color="blue" 
                    onClick={() => onChangeView(GameView.SKILL_TREE)} 
                />
             </div>
             <div className="col-span-1 h-full shadow-[0_0_50px_rgba(168,85,247,0.05)]">
                <ActionButton 
                    title="Black Market" 
                    sub="Illegal Hardware" 
                    icon={ShoppingBag} 
                    color="purple" 
                    onClick={() => onChangeView(GameView.SHOP)} 
                />
             </div>
        </div>

        {/* --- ROW 3: LISTS (Flex-grow to fill rest, but not too tall) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
            
            {/* 3.1: AUGMENTS */}
            <TerminalCard title="ACTIVE_AUGMENTS" icon={Zap} className="col-span-1">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {activeSkills.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2 p-6">
                            <BrainCircuit size={24} />
                            <div className="text-[9px] uppercase text-center">No Neural Mods Installed</div>
                        </div>
                    ) : (
                        <div className="divide-y divide-green-900/20">
                            {activeSkills.map(([id, level]) => {
                                const skillDef = ALL_SKILLS.find(s => s.id === id);
                                return (
                                    <div key={id} className="p-2 px-3 hover:bg-green-900/5 flex justify-between items-center group transition-colors">
                                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide group-hover:text-green-300 truncate">{skillDef?.name}</span>
                                        <div className="flex gap-0.5 shrink-0">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1 h-1.5 ${i < level ? 'bg-green-500' : 'bg-green-900/20'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </TerminalCard>

            {/* 3.2: LOGS */}
            <TerminalCard title="OPERATION_LOGS" icon={Terminal} className="col-span-1">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {player.history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2 p-6">
                            <Globe size={24} />
                            <div className="text-[9px] uppercase text-center">Database Empty</div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {player.history.map(item => (
                                <div key={item.id} className="p-2 px-3 hover:bg-zinc-900/50 flex gap-3 items-center group transition-colors cursor-default">
                                    <div className="w-6 h-6 shrink-0 bg-black border border-zinc-800 overflow-hidden">
                                        <img src={item.victimAvatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100" alt="V" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[10px] font-bold text-zinc-300 uppercase truncate max-w-[60%]">{item.victimName}</span>
                                            <span className={`text-[10px] font-bold ${item.outcome === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                {item.outcome === 'success' ? `+$${item.payout}` : 'FAIL'}
                                            </span>
                                        </div>
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-wider truncate">{item.method}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </TerminalCard>

            {/* 3.3: ACHIEVEMENTS */}
            <TerminalCard title="AWARDS_DB" icon={Trophy} className="col-span-1">
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                     <div className="divide-y divide-zinc-800">
                        {ACHIEVEMENTS.map(ach => {
                            const isUnlocked = player.achievements.includes(ach.id);
                            return (
                                <div key={ach.id} className={`p-2 px-3 flex items-start gap-3 transition-colors ${isUnlocked ? 'bg-green-950/10 hover:bg-green-950/20' : 'opacity-30 hover:opacity-40'}`}>
                                    <div className={`mt-0.5 w-3.5 h-3.5 shrink-0 border flex items-center justify-center ${isUnlocked ? 'border-yellow-600 text-yellow-500' : 'border-zinc-700 text-zinc-700'}`}>
                                        <Trophy size={8} />
                                    </div>
                                    <div>
                                        <div className={`text-[9px] font-bold uppercase tracking-wider ${isUnlocked ? 'text-yellow-500' : 'text-zinc-600'}`}>{ach.title}</div>
                                        <div className="text-[8px] text-zinc-500 leading-tight mt-0.5 font-mono">{ach.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            </TerminalCard>
        </div>

        {/* Footer Timestamp */}
        <div className="absolute bottom-2 right-4 text-[9px] font-mono text-zinc-800 uppercase tracking-widest hidden lg:block pointer-events-none">
            SERVER_TIME: {time.toISOString().split('T')[1].split('.')[0]} UTC
        </div>
    </div>
  );
};

export default Dashboard;