import React, { useState, useEffect } from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, Package, Power, Activity, Crosshair, Globe, History, Trophy, Award, Lock, User, Wallet, Skull, ChevronRight } from 'lucide-react';
import { ALL_SKILLS, ACHIEVEMENTS } from '../constants';
import { motion } from 'framer-motion';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
  onOpenInventory: () => void;
  onReset: () => void;
}

const StatBlock = ({ label, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-zinc-950/50 border border-zinc-800/60 p-3 flex flex-col relative group overflow-hidden rounded-lg hover:border-zinc-700 transition-colors">
        <div className={`absolute top-2 right-2 p-1.5 rounded bg-zinc-900 border border-zinc-800 ${color}`}>
            <Icon size={14} />
        </div>
        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">{label}</span>
        <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
        {subValue && <span className="text-[9px] text-zinc-600 font-mono mt-0.5">{subValue}</span>}
    </div>
);

const ActionCard = ({ title, icon: Icon, color, onClick, desc, delay, badge, big = false }: any) => {
    const colors: Record<string, string> = {
        green: 'text-green-500 border-green-500/20 hover:border-green-500 shadow-green-900/10',
        blue: 'text-blue-500 border-blue-500/20 hover:border-blue-500 shadow-blue-900/10',
        purple: 'text-purple-500 border-purple-500/20 hover:border-purple-500 shadow-purple-900/10',
    };
    const c = colors[color] || colors.green;
    const textColor = c.split(' ')[0];

    return (
        <motion.button 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            onClick={onClick}
            className={`relative group overflow-hidden border bg-zinc-900/40 text-left p-6 transition-all duration-300 hover:bg-zinc-900/80 ${c} rounded-2xl hover:shadow-2xl flex flex-col justify-between ${big ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
        >
            <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-transform group-hover:scale-110 duration-500 ${textColor}`}>
                <Icon size={big ? 200 : 120} strokeWidth={0.5} />
            </div>

            <div className="relative z-10 w-full">
                <div className={`${textColor} text-[10px] font-mono font-bold uppercase tracking-widest mb-2 flex items-center gap-2`}>
                    <Icon size={12} /> {badge || 'SYSTEM_READY'}
                </div>
                <h3 className={`${big ? 'text-4xl' : 'text-2xl'} font-bold font-mono text-white tracking-tight group-hover:text-glow-sm transition-all mb-2`}>{title}</h3>
                <p className={`text-zinc-500 ${big ? 'text-sm' : 'text-xs'} font-mono group-hover:text-zinc-400 transition-colors max-w-[90%]`}>{desc}</p>
            </div>
            
            <div className={`mt-4 pt-4 border-t border-dashed border-zinc-800/50 w-full flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity`}>
                 <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">System Status</span>
                 <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${textColor}`}>
                    ACCESS <ChevronRight size={12}/>
                 </div>
            </div>
        </motion.button>
    );
};

const Dashboard: React.FC<Props> = ({ player, onChangeView, onOpenInventory, onReset }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSkills = Object.entries(player.skills).filter(([_, level]) => level > 0);

  return (
    <div className="h-screen w-full bg-black text-zinc-200 font-mono flex flex-col overflow-hidden relative selection:bg-green-500/20">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        {/* --- HEADER BAR (Compact) --- */}
        <div className="shrink-0 h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-6 text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-2 text-zinc-300"><Globe size={14} className="text-blue-500"/> {player.attributes.country.toUpperCase()} GATEWAY</span>
                <span className="hidden md:flex items-center gap-2"><Activity size={14} className="text-green-500"/> NET_STABLE</span>
            </div>
            <div className="font-mono text-zinc-500 text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {time.toLocaleTimeString()} UTC
            </div>
        </div>

        {/* --- MAIN CONTENT (Grid Layout) --- */}
        <div className="flex-1 p-4 md:p-6 min-h-0 overflow-hidden z-10">
            <div className="h-full max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                
                {/* COL 1: PLAYER STATUS (3 Cols) */}
                <div className="md:col-span-3 flex flex-col gap-4 h-full min-h-0">
                    {/* ID Card */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shrink-0">
                        <div className="relative w-16 h-16 shrink-0">
                            <img src={player.attributes.avatarUrl} alt="User" className="w-full h-full object-cover rounded-xl border border-zinc-700" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-white font-bold truncate">{player.attributes.name}</h2>
                            <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">{player.attributes.archetype}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">Lvl {Math.floor(player.scamsCompleted / 3) + 1}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                         <StatBlock label="Funds" value={`$${player.money.toLocaleString()}`} icon={Wallet} color="text-green-400" />
                         <StatBlock label="Threat" value={`${Math.round(player.threatLevel)}%`} icon={ShieldAlert} color="text-red-500" subValue={player.threatLevel > 80 ? "CRITICAL" : "SAFE"} />
                    </div>

                    {/* Active Skills List (Scrollable) */}
                    <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 flex flex-col min-h-0 relative overflow-hidden">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2 shrink-0">
                            <BrainCircuit size={12}/> Active Subroutines
                        </h4>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                             {activeSkills.length === 0 && <div className="text-zinc-700 text-xs italic text-center py-10">No upgrades installed.</div>}
                             {activeSkills.map(([id, level]) => {
                                 const skillDef = ALL_SKILLS.find(s => s.id === id);
                                 return (
                                     <div key={id} className="bg-zinc-950/50 border border-zinc-800/50 p-2.5 rounded-lg flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                         <span className="text-xs text-zinc-300 font-bold truncate max-w-[70%]">{skillDef?.name}</span>
                                         <span className="text-[10px] text-blue-500 font-mono bg-blue-900/10 px-1.5 py-0.5 rounded border border-blue-900/20">V{level}.0</span>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>

                     {/* Utility Buttons */}
                     <div className="grid grid-cols-2 gap-3 shrink-0">
                        <button onClick={onOpenInventory} className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-zinc-400 hover:text-white">
                            <Package size={14} /> Inventory
                        </button>
                        <button onClick={onReset} className="py-3 bg-red-950/10 hover:bg-red-900/20 border border-red-900/20 hover:border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-red-800 hover:text-red-500">
                            <Power size={14} /> Wipe Data
                        </button>
                     </div>
                </div>

                {/* COL 2: MAIN COMMAND CENTER (6 Cols) */}
                <div className="md:col-span-6 flex flex-col h-full gap-4 min-h-0">
                     <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full">
                        {/* BIG ACQUIRE TARGET BUTTON */}
                        <ActionCard 
                            title="ACQUIRE TARGET" 
                            desc="Scan global networks. Identify vulnerable subjects. Initiate contact." 
                            icon={Crosshair} 
                            color="green" 
                            onClick={() => onChangeView(GameView.SCAM_SELECTION)}
                            delay={0.1}
                            badge="PRIORITY_OP"
                            big={true}
                        />
                        
                        {/* SKILLS */}
                        <ActionCard 
                            title="NEURAL UPGRADES" 
                            desc="Enhance social engineering & hacking capabilities." 
                            icon={BrainCircuit} 
                            color="blue" 
                            onClick={() => onChangeView(GameView.SKILL_TREE)}
                            delay={0.2}
                            badge="SKILL_TREE"
                        />
                        
                        {/* SHOP */}
                         <ActionCard 
                            title="BLACK MARKET" 
                            desc="Illicit hardware & services." 
                            icon={ShoppingBag} 
                            color="purple" 
                            onClick={() => onChangeView(GameView.SHOP)}
                            delay={0.3}
                            badge="DARK_WEB"
                        />
                     </div>
                </div>

                {/* COL 3: LOGS & INTEL (3 Cols) */}
                <div className="md:col-span-3 flex flex-col gap-4 h-full min-h-0">
                    
                    {/* Recent Ops Log */}
                    <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 flex flex-col min-h-0 relative overflow-hidden">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2 shrink-0">
                            <History size={12}/> Operation Log
                        </h4>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            {player.history.length === 0 && <div className="text-zinc-700 text-xs italic text-center mt-10">No operations recorded.</div>}
                            {player.history.map(item => (
                                <div key={item.id} className="group flex gap-3 items-start p-2 rounded-lg hover:bg-zinc-800/40 transition-colors border border-transparent hover:border-zinc-800">
                                    <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 font-bold text-[10px] ${item.outcome === 'success' ? 'bg-green-900/20 text-green-500 border border-green-900/30' : 'bg-red-900/20 text-red-500 border border-red-900/30'}`}>
                                        {item.outcome === 'success' ? '$' : 'X'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-zinc-300 truncate group-hover:text-white">{item.victimName}</div>
                                        <div className="text-[10px] text-zinc-600 truncate">{item.outcome === 'success' ? `Payout: $${item.payout}` : item.failReason || 'Failed'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements Compact */}
                    <div className="h-[35%] bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 flex flex-col min-h-0 relative overflow-hidden">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2 shrink-0">
                            <Trophy size={12} className="text-yellow-600"/> Trophies
                        </h4>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            {ACHIEVEMENTS.map(ach => {
                                const isUnlocked = player.achievements.includes(ach.id);
                                if (!isUnlocked) return null; // Only show unlocked to save space, or show all if preferred
                                return (
                                    <div key={ach.id} className="flex gap-2 items-center p-2 rounded bg-zinc-950 border border-zinc-800">
                                        <Award size={12} className="text-yellow-500 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-zinc-300 truncate">{ach.title}</div>
                                        </div>
                                    </div>
                                );
                            })}
                             {player.achievements.length === 0 && <div className="text-zinc-700 text-xs italic text-center mt-4">No trophies earned yet.</div>}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    </div>
  );
};

export default Dashboard;
