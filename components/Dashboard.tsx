
import React, { useState, useEffect } from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, Package, Power, Activity, Crosshair, MapPin, Award, UserX, BarChart3, User, Globe, Wifi } from 'lucide-react';
import { ACHIEVEMENTS, ALL_SKILLS } from '../constants';
import { motion } from 'framer-motion';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
  onOpenInventory: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<Props> = ({ player, onChangeView, onOpenInventory, onReset }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tech-Decor Element
  const CornerBracket = ({ className }: { className?: string }) => (
    <svg className={`absolute w-6 h-6 text-zinc-600 opacity-50 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 1h22v22" strokeDasharray="4 4" className="hidden" />
      <path d="M1 8V1h7" />
    </svg>
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const activeSkills = Object.entries(player.skills).filter(([_, level]) => level > 0);

  return (
    <div className="h-full w-full bg-black text-green-500 font-mono flex flex-col relative overflow-hidden selection:bg-green-500/20">
      {/* Global Dashboard Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0.5)_2px,transparent_2px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,40,0,0.1),rgba(0,0,0,0.8))] pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 z-10">
        <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6"
        >
            
            {/* --- TOP ROW: PROFILE & STATS --- */}
            
            {/* Profile Card */}
            <motion.div variants={itemVariants} className="md:col-span-5 lg:col-span-4 bg-zinc-950/80 border border-zinc-800 p-6 relative group overflow-hidden">
                <CornerBracket className="top-0 left-0" />
                <CornerBracket className="top-0 right-0 rotate-90" />
                <CornerBracket className="bottom-0 right-0 rotate-180" />
                <CornerBracket className="bottom-0 left-0 -rotate-90" />
                
                <div className="flex gap-6 items-start">
                    <div className="relative w-24 h-24 shrink-0">
                         <div className="absolute inset-0 border-2 border-dashed border-green-500/30 rounded-full animate-spin-slow"></div>
                         <img src={player.attributes.avatarUrl} alt="User" className="w-full h-full object-cover rounded-full border-2 border-zinc-700 grayscale group-hover:grayscale-0 transition-all duration-500" />
                         <div className="absolute -bottom-2 -right-2 bg-black border border-green-500 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> ONLINE
                         </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl text-white font-bold font-mono tracking-tighter truncate">{player.attributes.name}</h2>
                        </div>
                        <p className="text-green-500/80 text-xs font-mono uppercase tracking-widest mb-4">{player.attributes.archetype}</p>
                        
                        <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2"><MapPin size={10} className="text-blue-500"/> {player.attributes.country}</div>
                            <div className="flex items-center gap-2"><Activity size={10} className="text-orange-500"/> {player.scamsCompleted} Ops Complete</div>
                            <div className="flex items-center gap-2 col-span-2 text-zinc-600">ID: {player.attributes.name.split(' ')[0].substring(0, 8).toUpperCase()}_8X</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Funds & Threat */}
            <motion.div variants={itemVariants} className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {/* Funds */}
                 <div className="bg-zinc-950/80 border border-zinc-800 p-6 relative flex flex-col justify-between group hover:border-green-500/30 transition-colors">
                     <div className="absolute top-2 right-2 text-zinc-700"><BarChart3 size={20} /></div>
                     <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2">Untraceable Funds</div>
                     <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter group-hover:text-green-400 transition-colors">
                        ${player.money.toLocaleString()}
                     </div>
                     <div className="mt-4 flex gap-2">
                        <button onClick={onOpenInventory} className="flex-1 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white py-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all group/btn">
                             <Package size={14} /> INVENTORY
                             {player.inventory.length > 0 && <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">{player.inventory.length}</span>}
                        </button>
                        <button onClick={onReset} className="px-3 bg-red-950/20 border border-red-900/30 hover:border-red-500 text-red-500 hover:text-red-400 transition-all flex items-center justify-center">
                            <Power size={14} />
                        </button>
                     </div>
                 </div>

                 {/* Threat */}
                 <div className="bg-zinc-950/80 border border-zinc-800 p-6 relative flex flex-col justify-between group hover:border-red-500/30 transition-colors">
                     <div className="absolute top-2 right-2 flex flex-col items-end">
                         <div className="text-[10px] text-zinc-600 font-mono">{time.toLocaleTimeString()}</div>
                         <Wifi size={16} className="text-zinc-700" />
                     </div>
                     <div className="text-[10px] text-red-800 font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                         <ShieldAlert size={14}/> Threat Assessment
                     </div>
                     <div className="text-4xl md:text-5xl font-mono font-bold text-red-500 tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                        {Math.round(player.threatLevel)}%
                     </div>
                     <div className="mt-4 w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                         <div 
                            className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all duration-700"
                            style={{ width: `${player.threatLevel}%` }}
                         ></div>
                     </div>
                 </div>
            </motion.div>

            {/* --- ACTION ROW --- */}
            
            <motion.div variants={itemVariants} className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 h-[250px] md:h-[300px]">
                {/* Target */}
                <button 
                    onClick={() => onChangeView(GameView.SCAM_SELECTION)} 
                    className="relative group bg-black border border-zinc-800 hover:border-green-500/50 transition-all overflow-hidden flex flex-col items-center justify-center"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                        <div className="p-4 bg-zinc-900 rounded-full border border-zinc-700 group-hover:border-green-500 group-hover:text-green-500 text-zinc-500 transition-colors">
                            <Crosshair size={32} />
                        </div>
                        <h3 className="text-2xl font-bold font-mono text-white tracking-tighter">ACQUIRE_TARGET</h3>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </button>

                {/* Skills */}
                <button 
                    onClick={() => onChangeView(GameView.SKILL_TREE)} 
                    className="relative group bg-black border border-zinc-800 hover:border-blue-500/50 transition-all overflow-hidden flex flex-col items-center justify-center"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                        <div className="p-4 bg-zinc-900 rounded-full border border-zinc-700 group-hover:border-blue-500 group-hover:text-blue-500 text-zinc-500 transition-colors">
                            <BrainCircuit size={32} />
                        </div>
                        <h3 className="text-2xl font-bold font-mono text-white tracking-tighter">NEURAL_UPGRADES</h3>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </button>

                {/* Shop */}
                <button 
                    onClick={() => onChangeView(GameView.SHOP)} 
                    className="relative group bg-black border border-zinc-800 hover:border-purple-500/50 transition-all overflow-hidden flex flex-col items-center justify-center"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                        <div className="p-4 bg-zinc-900 rounded-full border border-zinc-700 group-hover:border-purple-500 group-hover:text-purple-500 text-zinc-500 transition-colors">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-2xl font-bold font-mono text-white tracking-tighter">BLACK_MARKET</h3>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </button>
            </motion.div>

            {/* --- BOTTOM ROW: DATA --- */}
            
            <motion.div variants={itemVariants} className="md:col-span-4 bg-zinc-950/50 border border-zinc-800 p-4 h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                    <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2"><Globe size={14}/> Active Subroutines</h4>
                    <span className="text-[10px] text-zinc-600 font-mono">SYS_OK</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                     {activeSkills.length === 0 && player.inventory.length === 0 && <div className="h-full flex items-center justify-center text-zinc-700 font-mono text-xs italic">No active routines.</div>}
                     {activeSkills.map(([id, level]) => {
                         const skillDef = ALL_SKILLS.find(s => s.id === id);
                         return (
                             <div key={id} className="flex items-center justify-between text-xs bg-blue-900/10 p-2 rounded border-l-2 border-blue-500/50 text-blue-200 font-mono">
                                 <span>{skillDef?.name.toUpperCase() || id}</span>
                                 <span className="text-[9px] bg-blue-900/40 px-1.5 py-0.5 rounded">V{level}.0</span>
                             </div>
                         )
                     })}
                     {player.inventory.map((s, i) => (<div key={`${s}-${i}`} className="flex items-center justify-between text-xs bg-purple-900/10 p-2 rounded border-l-2 border-purple-500/50 text-purple-200 font-mono"><span>{s.replace(/_/g, ' ').toUpperCase()}</span><span className="text-[9px] bg-purple-900/40 px-1.5 py-0.5 rounded">ITEM</span></div>))}
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-8 bg-zinc-950/50 border border-zinc-800 p-4 h-[300px] flex flex-col">
                 <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                    <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2"><User size={14}/> Victim Database</h4>
                    <span className="text-[10px] text-zinc-600 font-mono">{player.history.length} RECORDS</span>
                </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {player.history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-mono text-xs">
                            <UserX size={48} className="mb-2 opacity-20"/>
                            <p>DATABASE EMPTY</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {player.history.map(item => (
                                <div key={item.id} className="bg-zinc-900/40 border border-zinc-800/50 p-3 flex gap-3 items-center hover:bg-zinc-800/40 transition-colors group">
                                     <div className={`w-10 h-10 border flex items-center justify-center shrink-0 overflow-hidden bg-black ${item.outcome === 'success' ? 'border-green-900/50' : 'border-red-900/50'}`}>
                                         {item.victimAvatar ? <img src={item.victimAvatar} alt="" className="w-full h-full object-cover grayscale opacity-70 group-hover:opacity-100 transition-opacity" /> : <User size={16} className="text-zinc-700"/>}
                                     </div>
                                     <div className="flex-1 min-w-0 font-mono">
                                         <div className="flex justify-between items-baseline mb-1">
                                             <h5 className="text-zinc-300 text-xs font-bold truncate">{item.victimName}</h5>
                                             <span className={`text-[10px] ${item.outcome === 'success' ? 'text-green-500' : 'text-red-500'}`}>{item.outcome === 'success' ? `+$${item.payout}` : 'FAIL'}</span>
                                         </div>
                                         <div className="text-[9px] text-zinc-600 uppercase truncate">{item.method}</div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
