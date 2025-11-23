import React, { useState, useEffect } from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, Package, Power, Activity, Crosshair, Globe, History, Trophy, Award, TrendingUp, Skull, Zap, Lock, Terminal } from 'lucide-react';
import { ALL_SKILLS, ACHIEVEMENTS } from '../constants';
import { motion } from 'framer-motion';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
  onOpenInventory: () => void;
  onReset: () => void;
}

const TerminalCard = ({ children, title, className = "", icon: Icon }: any) => (
    <div className={`bg-black border border-green-900/50 flex flex-col relative overflow-hidden ${className}`}>
        {/* Terminal Header */}
        <div className="bg-zinc-950 border-b border-green-900/30 p-2 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-green-600">
                {Icon && <Icon size={14} />}
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-900/50 rounded-full"></div>
                <div className="w-2 h-2 bg-green-900/50 rounded-full"></div>
            </div>
        </div>
        {/* Content */}
        <div className="flex-1 min-h-0 relative p-3 md:p-4">
            {children}
            {/* CRT Scanline overlay for just this card */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
        </div>
    </div>
);

const ActionButton = ({ title, sub, icon: Icon, onClick, color = "green" }: any) => (
    <button 
        onClick={onClick}
        className={`group relative w-full h-full border border-${color}-900/30 bg-black hover:bg-${color}-900/10 transition-all duration-200 flex flex-col items-center justify-center gap-3 p-4 overflow-hidden`}
    >
        <div className={`absolute inset-0 bg-${color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-${color}-600`}></div>
        <div className={`absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-${color}-600`}></div>
        <div className={`absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-${color}-600`}></div>
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-${color}-600`}></div>

        <Icon size={48} strokeWidth={1} className={`text-${color}-500 group-hover:scale-110 transition-transform duration-300`} />
        
        <div className="text-center relative z-10">
            <h3 className={`text-xl md:text-2xl font-black font-mono uppercase tracking-tighter text-white group-hover:text-${color}-400`}>{title}</h3>
            <p className={`text-[10px] md:text-xs font-mono uppercase tracking-widest text-${color}-700`}>{sub}</p>
        </div>
    </button>
);

const Dashboard: React.FC<Props> = ({ player, onChangeView, onOpenInventory, onReset }) => {
  const activeSkills = Object.entries(player.skills).filter(([_, level]) => level > 0);

  return (
    <div className="h-screen w-full bg-black text-green-500 font-mono p-4 overflow-hidden flex flex-col gap-4">
        
        {/* --- ROW 1: STATUS & CONTROLS (Approx 20% Height) --- */}
        <div className="h-[20%] min-h-[140px] grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            
            {/* 1.1: PROFILE */}
            <TerminalCard title="USER_IDENTITY" icon={Terminal} className="col-span-1">
                <div className="flex gap-4 h-full items-center">
                    <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 border-2 border-green-700 p-0.5">
                        <img src={player.attributes.avatarUrl} alt="Avatar" className="w-full h-full object-cover grayscale contrast-125" />
                        <div className="absolute top-0 left-0 w-full h-full bg-green-500/10"></div>
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h2 className="text-xl md:text-2xl font-bold text-white truncate">{player.attributes.name}</h2>
                        <div className="text-xs text-green-600 uppercase tracking-widest mb-2">{player.attributes.archetype}</div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-green-800">
                             <div className="bg-green-900/10 px-2 py-1 border border-green-900/30">
                                REP LVL: <span className="text-green-400 font-bold">{Math.floor(player.scamsCompleted / 3) + 1}</span>
                             </div>
                             <div className="bg-green-900/10 px-2 py-1 border border-green-900/30">
                                OPS: <span className="text-green-400 font-bold">{player.scamsCompleted}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </TerminalCard>

            {/* 1.2: ECONOMY & THREAT */}
            <TerminalCard title="SYSTEM_METRICS" icon={Activity} className="col-span-1">
                 <div className="flex h-full items-center gap-4">
                     <div className="flex-1 text-center border-r border-green-900/30 pr-4">
                        <div className="text-[10px] uppercase text-green-700 mb-1">Available Funds</div>
                        <div className="text-2xl md:text-4xl font-bold text-white tracking-tighter shadow-green-500/50 drop-shadow-sm">
                            ${player.money.toLocaleString()}
                        </div>
                     </div>
                     <div className="flex-1 text-center pl-4">
                        <div className="text-[10px] uppercase text-red-700 mb-1 flex items-center justify-center gap-1"><ShieldAlert size={10}/> Global Threat</div>
                        <div className="text-2xl md:text-4xl font-bold text-red-500 tracking-tighter">
                            {Math.round(player.threatLevel)}%
                        </div>
                        <div className="w-full bg-red-950 h-1 mt-2">
                            <div className="h-full bg-red-600" style={{width: `${player.threatLevel}%`}}></div>
                        </div>
                     </div>
                 </div>
            </TerminalCard>

            {/* 1.3: UTILITY */}
            <TerminalCard title="CONTROLS" icon={Power} className="col-span-1">
                <div className="flex flex-col justify-center h-full gap-3">
                    <button onClick={onOpenInventory} className="flex-1 border border-zinc-800 hover:border-green-500 hover:bg-green-900/10 bg-black text-zinc-400 hover:text-green-400 transition-all flex items-center justify-center gap-3 uppercase font-bold text-xs tracking-widest">
                        <Package size={16} /> Inventory ({player.inventory.length})
                    </button>
                    <button onClick={onReset} className="h-10 border border-red-900/30 hover:border-red-500 hover:bg-red-950/30 bg-black text-red-800 hover:text-red-500 transition-all flex items-center justify-center gap-3 uppercase font-bold text-[10px] tracking-widest">
                        <Skull size={14} /> Wipe System Data
                    </button>
                </div>
            </TerminalCard>
        </div>

        {/* --- ROW 2: MAIN ACTIONS (Approx 35% Height) --- */}
        <div className="h-[35%] min-h-[200px] grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
             <div className="col-span-1 h-full">
                <ActionButton 
                    title="Acquire Target" 
                    sub="Scan Global Networks" 
                    icon={Crosshair} 
                    color="green" 
                    onClick={() => onChangeView(GameView.SCAM_SELECTION)} 
                />
             </div>
             <div className="col-span-1 h-full">
                <ActionButton 
                    title="Neural Upgrades" 
                    sub="Enhance Capabilities" 
                    icon={BrainCircuit} 
                    color="blue" 
                    onClick={() => onChangeView(GameView.SKILL_TREE)} 
                />
             </div>
             <div className="col-span-1 h-full">
                <ActionButton 
                    title="Black Market" 
                    sub="Illicit Goods" 
                    icon={ShoppingBag} 
                    color="purple" 
                    onClick={() => onChangeView(GameView.SHOP)} 
                />
             </div>
        </div>

        {/* --- ROW 3: DATA LOGS (Remaining Height) --- */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 3.1: ACTIVE AUGMENTS */}
            <TerminalCard title="ACTIVE_SUBROUTINES" icon={Zap} className="col-span-1">
                <div className="absolute inset-0 top-10 p-3 overflow-y-auto custom-scrollbar space-y-2">
                    {activeSkills.length === 0 && (
                        <div className="h-full flex items-center justify-center text-green-900 text-xs text-center uppercase">
                            No Neural Augmentations<br/>Installed
                        </div>
                    )}
                    {activeSkills.map(([id, level]) => {
                        const skillDef = ALL_SKILLS.find(s => s.id === id);
                        return (
                            <div key={id} className="flex justify-between items-center bg-green-900/5 border border-green-900/20 p-2">
                                <span className="text-xs text-green-400 font-bold truncate">{skillDef?.name}</span>
                                <span className="text-[10px] text-black bg-green-600 px-1 font-bold">V{level}</span>
                            </div>
                        )
                    })}
                </div>
            </TerminalCard>

            {/* 3.2: OPERATION LOG */}
            <TerminalCard title="OPERATION_LOG" icon={History} className="col-span-1">
                <div className="absolute inset-0 top-10 p-3 overflow-y-auto custom-scrollbar space-y-2">
                    {player.history.length === 0 && (
                        <div className="h-full flex items-center justify-center text-green-900 text-xs text-center uppercase">
                            Database Empty
                        </div>
                    )}
                    {player.history.map(item => (
                        <div key={item.id} className="flex gap-3 bg-zinc-900/30 p-2 border border-zinc-800 hover:border-green-700 transition-colors group">
                            <div className="w-10 h-10 shrink-0 bg-black border border-zinc-800">
                                {item.victimAvatar ? (
                                    <img src={item.victimAvatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="V" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">?</div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-zinc-300 truncate">{item.victimName}</span>
                                    <span className={`text-[10px] font-bold ${item.outcome === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.outcome === 'success' ? `+$${item.payout}` : 'FAILED'}
                                    </span>
                                </div>
                                <div className="text-[10px] text-zinc-600 truncate uppercase mt-0.5">{item.method}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </TerminalCard>

            {/* 3.3: ACHIEVEMENTS */}
            <TerminalCard title="TROPHY_CASE" icon={Trophy} className="col-span-1">
                <div className="absolute inset-0 top-10 p-3 overflow-y-auto custom-scrollbar space-y-2">
                     {ACHIEVEMENTS.map(ach => {
                        const isUnlocked = player.achievements.includes(ach.id);
                        return (
                            <div key={ach.id} className={`flex items-center gap-3 p-2 border ${isUnlocked ? 'border-yellow-900/30 bg-yellow-900/5' : 'border-zinc-900 bg-black opacity-40'}`}>
                                <Award size={16} className={isUnlocked ? 'text-yellow-500' : 'text-zinc-800'} />
                                <div>
                                    <div className={`text-[10px] font-bold uppercase ${isUnlocked ? 'text-yellow-200' : 'text-zinc-700'}`}>{ach.title}</div>
                                    <div className="text-[9px] text-zinc-600 leading-none">{ach.description}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </TerminalCard>

        </div>
    </div>
  );
};

export default Dashboard;
