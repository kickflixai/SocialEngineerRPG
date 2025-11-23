
import React, { useState, useEffect } from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, Package, Power, Activity, Crosshair, MapPin, Globe, Wifi, Trophy, Terminal, BarChart3, Lock } from 'lucide-react';
import { ALL_SKILLS } from '../constants';
import { motion } from 'framer-motion';
import HackerRoom from './HackerRoom';

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

  const activeSkills = Object.entries(player.skills).filter(([_, level]) => level > 0);

  const StatBlock = ({ label, value, icon: Icon, color }: any) => (
      <div className="bg-black/40 border border-zinc-800 p-3 flex flex-col relative group overflow-hidden">
          <div className={`absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity ${color}`}>
              <Icon size={24} />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest z-10">{label}</span>
          <span className={`text-xl md:text-2xl font-mono font-bold z-10 ${color}`}>{value}</span>
      </div>
  );

  const ActionCard = ({ title, icon: Icon, color, onClick, desc, delay }: any) => (
      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        onClick={onClick}
        className={`relative group h-32 md:h-40 w-full overflow-hidden border border-zinc-800 bg-zinc-950 text-left p-6 transition-all duration-300 hover:border-${color}-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
      >
          {/* Scanline overlay specific to card */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_2px,transparent_2px)] bg-[size:100%_4px] pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity"></div>
          
          <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 text-${color}-500 opacity-20 group-hover:opacity-100`}>
              <Icon size={64} strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className={`text-${color}-500 text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2`}>
                    <span className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`}></span> 
                    SYSTEM_READY
                </div>
                <h3 className="text-2xl md:text-3xl font-black font-mono text-white tracking-tighter group-hover:text-glow transition-all">{title}</h3>
              </div>
              <p className="text-zinc-500 text-xs font-mono max-w-[80%] group-hover:text-zinc-300 transition-colors">{desc}</p>
          </div>
          
          {/* Corner accents */}
          <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
          <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      </motion.button>
  );

  return (
    <div className="h-full w-full bg-black text-green-500 font-mono flex flex-col relative overflow-hidden selection:bg-green-500/20">
      
      {/* --- HEADER BAR --- */}
      <div className="shrink-0 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-2"><Globe size={14}/> {player.attributes.country.toUpperCase()} SERVER</span>
              <span className="hidden md:flex items-center gap-2"><Wifi size={14} className="text-green-500"/> CONNECTED</span>
          </div>
          <div className="font-mono text-zinc-500 text-xs">
              {time.toLocaleTimeString()}
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 z-10">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: STATS & INFO (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Profile Widget */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 relative group">
                    <div className="flex gap-4 items-center">
                        <div className="relative w-20 h-20 shrink-0">
                             <div className="absolute inset-0 border border-dashed border-green-500/30 rounded-none animate-spin-slow"></div>
                             <img src={player.attributes.avatarUrl} alt="User" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border border-zinc-700" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl text-white font-bold font-mono truncate">{player.attributes.name}</h2>
                            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">{player.attributes.archetype}</p>
                            <div className="w-full bg-zinc-900 h-1.5 mt-2 overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{width: `${Math.min(100, (player.scamsCompleted / 20) * 100)}%`}}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                                <span>REP LEVEL</span>
                                <span>{player.scamsCompleted}/20</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatBlock label="LIQUID_FUNDS" value={`$${player.money.toLocaleString()}`} icon={BarChart3} color="text-green-500" />
                    <StatBlock label="GLOBAL_HEAT" value={`${Math.round(player.threatLevel)}%`} icon={ShieldAlert} color="text-red-500" />
                    <StatBlock label="OPS_COMPLETE" value={player.scamsCompleted} icon={Trophy} color="text-yellow-500" />
                    <StatBlock label="SYS_LOAD" value={`${activeSkills.length} ACTV`} icon={Activity} color="text-blue-500" />
                </div>

                {/* Inventory / System Controls */}
                <div className="bg-zinc-950 border border-zinc-800 p-1 flex">
                     <button onClick={onOpenInventory} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex flex-col items-center gap-1 border-r border-zinc-800">
                        <Package size={18} />
                        <span className="text-[10px] font-bold uppercase">Inventory ({player.inventory.length})</span>
                     </button>
                     <button onClick={onReset} className="w-16 py-3 bg-red-950/20 hover:bg-red-900/40 text-red-500 hover:text-red-400 transition-colors flex flex-col items-center gap-1">
                        <Power size={18} />
                        <span className="text-[10px] font-bold uppercase">Wipe</span>
                     </button>
                </div>

                {/* Active Skills List (Compact) */}
                <div className="flex-1 bg-zinc-950/50 border border-zinc-800 p-4 min-h-[150px]">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Terminal size={14}/> RUNNING_PROCESSES</h4>
                    <div className="space-y-1">
                         {activeSkills.length === 0 && <span className="text-zinc-700 text-xs italic">No active neural links...</span>}
                         {activeSkills.slice(0, 6).map(([id, level]) => {
                             const skillDef = ALL_SKILLS.find(s => s.id === id);
                             return (
                                 <div key={id} className="flex justify-between items-center text-[10px] font-mono text-zinc-400 bg-zinc-900/50 px-2 py-1 border-l-2 border-blue-500/50">
                                     <span className="truncate max-w-[150px]">{skillDef?.name.toUpperCase()}</span>
                                     <span className="text-blue-500">V{level}.0</span>
                                 </div>
                             )
                         })}
                         {activeSkills.length > 6 && <div className="text-[10px] text-zinc-600 pt-1">...and {activeSkills.length - 6} more</div>}
                    </div>
                </div>
            </div>

            {/* CENTER/RIGHT COLUMN: VISUALS & ACTIONS (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* HACKER ROOM VISUALIZER */}
                <div className="w-full aspect-video md:aspect-[21/9] bg-zinc-900 border-2 border-zinc-800 relative overflow-hidden shadow-2xl group">
                    {/* CRT Screen Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-30"></div>
                    <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay pointer-events-none z-20"></div>
                    
                    {/* Render the Room */}
                    <HackerRoom achievements={player.achievements} scamsCompleted={player.scamsCompleted} />

                    {/* Overlay Info */}
                    <div className="absolute top-4 left-4 z-30 bg-black/80 backdrop-blur px-3 py-1 border border-zinc-700">
                        <span className="text-[10px] font-mono text-green-500 animate-pulse">● LIVE FEED</span>
                    </div>
                </div>

                {/* MAIN ACTION BUTTONS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <ActionCard 
                        title="ACQUIRE_TARGET" 
                        desc="Scan global networks for vulnerable subjects." 
                        icon={Crosshair} 
                        color="green" 
                        onClick={() => onChangeView(GameView.SCAM_SELECTION)}
                        delay={0.1}
                    />
                     <ActionCard 
                        title="NEURAL_UPGRADE" 
                        desc="Enhance social engineering capabilities." 
                        icon={BrainCircuit} 
                        color="blue" 
                        onClick={() => onChangeView(GameView.SKILL_TREE)}
                        delay={0.2}
                    />
                     <ActionCard 
                        title="BLACK_MARKET" 
                        desc="Purchase illegal hardware and software." 
                        icon={ShoppingBag} 
                        color="purple" 
                        onClick={() => onChangeView(GameView.SHOP)}
                        delay={0.3}
                    />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
