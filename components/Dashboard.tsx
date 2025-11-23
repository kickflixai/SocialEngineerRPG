
import React, { useState, useEffect } from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, Package, Power, Activity, Crosshair, MapPin, Globe, Wifi, Trophy, Terminal, BarChart3, Lock, Award, History, TrendingUp, Skull } from 'lucide-react';
import { ALL_SKILLS, ACHIEVEMENTS } from '../constants';
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

  const activeSkills = Object.entries(player.skills).filter(([_, level]) => level > 0);

  const StatBlock = ({ label, value, icon: Icon, color, subValue }: any) => (
      <div className="bg-zinc-900/40 border border-zinc-800 p-4 flex flex-col relative group overflow-hidden rounded-lg hover:border-zinc-600 transition-colors">
          <div className={`absolute top-2 right-2 p-1.5 rounded bg-zinc-950 border border-zinc-800 ${color}`}>
              <Icon size={16} />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">{label}</span>
          <span className={`text-2xl font-mono font-bold ${color}`}>{value}</span>
          {subValue && <span className="text-[10px] text-zinc-600 font-mono mt-1">{subValue}</span>}
      </div>
  );

  const ActionCard = ({ title, icon: Icon, color, onClick, desc, delay, badge }: any) => (
      <motion.button 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        onClick={onClick}
        className={`relative group h-32 w-full overflow-hidden border border-zinc-800 bg-zinc-900/20 text-left p-6 transition-all duration-300 hover:bg-zinc-900/60 hover:border-${color}-500/50 rounded-xl hover:shadow-lg`}
      >
          <div className={`absolute top-0 right-0 p-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 text-${color}-500 opacity-10 group-hover:opacity-20`}>
              <Icon size={80} strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className={`text-${color}-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 flex items-center gap-2`}>
                    <Icon size={12} /> {badge || 'SYSTEM_READY'}
                </div>
                <h3 className="text-2xl font-bold font-mono text-white tracking-tight group-hover:text-glow-sm transition-all">{title}</h3>
              </div>
              <p className="text-zinc-500 text-xs font-mono group-hover:text-zinc-400 transition-colors max-w-[80%]">{desc}</p>
          </div>
      </motion.button>
  );

  return (
    <div className="h-full w-full bg-black text-zinc-200 font-mono flex flex-col relative overflow-hidden selection:bg-green-500/20">
      
      {/* --- HEADER BAR --- */}
      <div className="shrink-0 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-6 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-2 text-zinc-300"><Globe size={14} className="text-blue-500"/> {player.attributes.country.toUpperCase()} GATEWAY</span>
              <span className="hidden md:flex items-center gap-2"><Activity size={14} className="text-green-500"/> NET_STABLE</span>
          </div>
          <div className="font-mono text-zinc-500 text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {time.toLocaleTimeString()} UTC
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 z-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: PROFILE & STATS (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Profile Card */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="relative w-24 h-24 mb-4 group">
                         <div className="absolute inset-0 border-2 border-dashed border-green-500/30 rounded-full animate-spin-slow"></div>
                         <img src={player.attributes.avatarUrl} alt="User" className="w-full h-full object-cover rounded-full border-2 border-zinc-800 group-hover:border-green-500 transition-colors" />
                         <div className="absolute bottom-0 right-0 bg-zinc-950 border border-zinc-700 p-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         </div>
                    </div>
                    <h2 className="text-xl text-white font-bold font-mono">{player.attributes.name}</h2>
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-4">{player.attributes.archetype}</p>
                    
                    <div className="w-full grid grid-cols-2 gap-2 text-left bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 mb-4">
                        <div>
                            <span className="text-[10px] text-zinc-600 uppercase block">Reputation</span>
                            <span className="text-white font-bold text-sm">Lvl {Math.floor(player.scamsCompleted / 3) + 1}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-zinc-600 uppercase block">Completed</span>
                            <span className="text-white font-bold text-sm">{player.scamsCompleted} Ops</span>
                        </div>
                    </div>

                    {/* Inventory Mini-Button */}
                    <button onClick={onOpenInventory} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                        <Package size={14} /> Inventory ({player.inventory.length})
                    </button>
                </div>

                {/* Vertical Stats */}
                <div className="space-y-3">
                     <StatBlock label="Available Funds" value={`$${player.money.toLocaleString()}`} icon={BarChart3} color="text-green-500" />
                     <StatBlock label="Global Threat" value={`${Math.round(player.threatLevel)}%`} icon={ShieldAlert} color="text-red-500" subValue={player.threatLevel > 80 ? "CRITICAL RISK" : "STABLE"} />
                     <StatBlock label="Active Nodes" value={`${activeSkills.length}`} icon={BrainCircuit} color="text-blue-500" />
                </div>

                {/* Reset */}
                <button onClick={onReset} className="mt-auto py-3 text-red-900/50 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-colors">
                    <Power size={12} /> System Wipe
                </button>
            </div>

            {/* CENTER COLUMN: MAIN OPERATIONS (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
                
                <div className="flex items-center gap-2 mb-2">
                    <Terminal size={16} className="text-green-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Command Center</h3>
                </div>

                {/* Primary Action */}
                <div className="grid grid-cols-1 gap-4">
                     <ActionCard 
                        title="ACQUIRE TARGET" 
                        desc="Scan global networks for vulnerable subjects. High yield potential." 
                        icon={Crosshair} 
                        color="green" 
                        onClick={() => onChangeView(GameView.SCAM_SELECTION)}
                        delay={0.1}
                        badge="INITIATE_OP"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <ActionCard 
                        title="NEURAL UPGRADES" 
                        desc="Enhance social engineering & hacking capabilities." 
                        icon={BrainCircuit} 
                        color="blue" 
                        onClick={() => onChangeView(GameView.SKILL_TREE)}
                        delay={0.2}
                        badge="SKILL_TREE"
                    />
                     <ActionCard 
                        title="BLACK MARKET" 
                        desc="Purchase illicit hardware, software, and services." 
                        icon={ShoppingBag} 
                        color="purple" 
                        onClick={() => onChangeView(GameView.SHOP)}
                        delay={0.3}
                        badge="DARK_WEB"
                    />
                </div>

                {/* Active Skills Monitor */}
                <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-6 flex-1 min-h-[200px]">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14}/> Active Subroutines</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {activeSkills.length === 0 && <span className="text-zinc-700 text-xs italic col-span-3 text-center py-8">No neural modifications installed...</span>}
                         {activeSkills.map(([id, level]) => {
                             const skillDef = ALL_SKILLS.find(s => s.id === id);
                             return (
                                 <div key={id} className="bg-zinc-950 border border-zinc-800 p-2 rounded flex flex-col gap-1">
                                     <span className="text-[10px] text-zinc-400 font-bold truncate">{skillDef?.name.toUpperCase()}</span>
                                     <div className="flex justify-between items-end">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1 h-2 rounded-sm ${i < level ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
                                            ))}
                                        </div>
                                        <span className="text-[9px] text-blue-500">V{level}.0</span>
                                     </div>
                                 </div>
                             )
                         })}
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: HISTORY & ACHIEVEMENTS (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                
                {/* Recent History */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 flex flex-col h-[40%]">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={14}/> Recent Ops</h4>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {player.history.length === 0 && <div className="text-zinc-700 text-xs italic text-center mt-4">No operations logged.</div>}
                        {player.history.map(item => (
                            <div key={item.id} className="flex gap-3 items-center p-2 rounded hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800">
                                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 font-bold text-xs ${item.outcome === 'success' ? 'bg-green-900/20 text-green-500 border border-green-900/50' : 'bg-red-900/20 text-red-500 border border-red-900/50'}`}>
                                    {item.outcome === 'success' ? '$' : '!'}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-zinc-300 truncate">{item.victimName}</div>
                                    <div className="text-[10px] text-zinc-600 truncate">{item.outcome === 'success' ? `Payout: $${item.payout}` : item.failReason || 'Failed'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements - Bottom Right */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 flex flex-col h-[60%]">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Trophy size={14} className="text-yellow-600"/> Achievements</h4>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {ACHIEVEMENTS.map(ach => {
                            const isUnlocked = player.achievements.includes(ach.id);
                            return (
                                <div key={ach.id} className={`flex gap-3 items-start p-2 rounded border transition-all ${isUnlocked ? 'bg-zinc-900 border-zinc-700 opacity-100' : 'bg-transparent border-zinc-800/50 opacity-40 grayscale'}`}>
                                    <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 ${isUnlocked ? 'text-yellow-500 bg-yellow-900/20' : 'text-zinc-600 bg-zinc-900'}`}>
                                        <Award size={14} />
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold ${isUnlocked ? 'text-zinc-200' : 'text-zinc-600'}`}>{ach.title}</div>
                                        <div className="text-[10px] text-zinc-500 leading-tight">{ach.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
