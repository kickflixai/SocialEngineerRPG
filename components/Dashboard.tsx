
import React, { useState, useEffect } from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, Package, Power, Zap, Crosshair, MapPin, Activity, Trophy, Award, Lock, User, Terminal, BarChart3, Hash, Clock, Globe } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants';
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

  const renderCornerBrackets = (colorClass: string = "border-zinc-600") => (
      <>
        <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${colorClass} rounded-tl-sm`}></div>
        <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${colorClass} rounded-tr-sm`}></div>
        <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${colorClass} rounded-bl-sm`}></div>
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${colorClass} rounded-br-sm`}></div>
      </>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="h-full w-full bg-black text-green-500 font-mono overflow-hidden flex flex-col relative p-2 md:p-6 gap-4 select-none">
      {/* Global CRT & Scanline Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,20,0,0.1),#000)] z-0 pointer-events-none opacity-60"></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,0,.03)_25%,rgba(0,255,0,.03)_26%,transparent_27%,transparent_74%,rgba(0,255,0,.03)_75%,rgba(0,255,0,.03)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,0,.03)_25%,rgba(0,255,0,.03)_26%,transparent_27%,transparent_74%,rgba(0,255,0,.03)_75%,rgba(0,255,0,.03)_76%,transparent_77%,transparent)] bg-[length:30px_30px]"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col gap-4 z-10 min-h-0"
      >
        {/* --- TOP ROW: HUD (Expanded) --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0 min-h-[140px] md:h-[20%]">
            
            {/* PROFILE MODULE */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-zinc-900/20 border border-zinc-800/60 relative group p-4 flex gap-4 items-center overflow-hidden backdrop-blur-sm">
                {renderCornerBrackets("border-green-500/30 group-hover:border-green-500/60 transition-colors")}
                <div className="relative w-20 h-20 shrink-0">
                    <img src={player.attributes.avatarUrl} alt="User" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 rounded-sm border border-zinc-700" />
                    <div className="absolute -bottom-1 -right-1 bg-black border border-green-500/50 text-[9px] px-1 text-green-500 font-bold">ID Verified</div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">OPERATIVE</span>
                        <span className="text-[10px] text-green-800 font-bold animate-pulse">ONLINE</span>
                    </div>
                    <h2 className="text-xl text-white font-bold truncate tracking-tight mb-1">{player.attributes.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Globe size={12} /> {player.attributes.country}
                    </div>
                    <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 w-[75%]"></div>
                    </div>
                    <div className="flex justify-between text-[8px] text-zinc-600 mt-0.5 font-mono">
                        <span>XP</span>
                        <span>LEVEL {Math.floor(player.scamsCompleted / 2) + 1}</span>
                    </div>
                </div>
            </motion.div>

            {/* HEAT MONITOR */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-zinc-900/20 border border-zinc-800/60 relative group p-4 flex flex-col justify-between backdrop-blur-sm">
                {renderCornerBrackets("border-red-500/30 group-hover:border-red-500/60 transition-colors")}
                <div className="flex justify-between items-start">
                     <div>
                         <div className="text-[10px] text-red-900 font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                             <ShieldAlert size={12} className="text-red-600"/> GLOBAL THREAT
                         </div>
                         <div className="text-3xl text-red-500 font-bold tracking-tighter drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                             {Math.round(player.threatLevel)}%
                         </div>
                     </div>
                     <div className="text-right">
                         <div className="text-[10px] text-zinc-600 font-mono">UPTIME</div>
                         <div className="text-xs text-zinc-400 font-mono">{time.toLocaleTimeString()}</div>
                     </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-red-900/60 font-bold">
                        <span>LOW RISK</span>
                        <span>CRITICAL</span>
                    </div>
                    <div className="h-4 w-full bg-black border border-red-900/20 flex p-0.5 gap-0.5">
                        {Array.from({ length: 20 }).map((_, i) => {
                             const fill = Math.ceil((player.threatLevel / 100) * 20);
                             return (
                                 <div 
                                    key={i} 
                                    className={`flex-1 transition-colors duration-300 ${i < fill ? (i > 15 ? 'bg-red-500 animate-pulse' : i > 10 ? 'bg-red-700' : 'bg-red-900') : 'bg-zinc-900'}`}
                                 />
                             )
                        })}
                    </div>
                </div>
            </motion.div>

            {/* FINANCES & TOOLS */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-zinc-900/20 border border-zinc-800/60 relative group p-4 flex flex-col justify-between backdrop-blur-sm">
                 {renderCornerBrackets("border-blue-500/30 group-hover:border-blue-500/60 transition-colors")}
                 <div className="flex justify-between items-start">
                     <div>
                         <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">AVAILABLE FUNDS</div>
                         <div className="text-3xl text-white font-bold tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                             ${player.money.toLocaleString()}
                         </div>
                     </div>
                     <div className="p-2 bg-zinc-900/50 rounded border border-zinc-700 group-hover:border-white transition-colors">
                         <BarChart3 size={16} className="text-zinc-400 group-hover:text-white"/>
                     </div>
                 </div>
                 <div className="flex gap-3 mt-2">
                     <button 
                        onClick={onOpenInventory}
                        className="flex-1 bg-zinc-900/80 hover:bg-blue-900/20 border border-zinc-700 hover:border-blue-500 text-zinc-400 hover:text-blue-400 py-2 rounded flex items-center justify-center gap-2 transition-all group/btn relative"
                     >
                         <Package size={16} />
                         <span className="text-xs font-bold">INVENTORY</span>
                         {player.inventory.length > 0 && (
                             <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
                         )}
                     </button>
                     <button 
                        onClick={onReset}
                        className="w-12 bg-red-950/20 hover:bg-red-900/40 border border-red-900/50 hover:border-red-500 text-red-700 hover:text-red-500 rounded flex items-center justify-center transition-all"
                        title="System Reboot"
                     >
                         <Power size={16} />
                     </button>
                 </div>
            </motion.div>
        </div>

        {/* --- MIDDLE ROW: OPERATIONS (Main) --- */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* TARGET ACQUISITION */}
            <motion.button
                variants={itemVariants}
                onClick={() => onChangeView(GameView.SCAM_SELECTION)}
                className="relative group bg-black border border-zinc-800 hover:border-green-500 transition-all duration-500 flex flex-col overflow-hidden rounded-sm"
            >
                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')] opacity-5 mix-blend-screen bg-cover pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {renderCornerBrackets("border-green-500/0 group-hover:border-green-500/100 transition-all duration-500")}
                
                <div className="p-6 flex-1 flex flex-col items-center justify-center z-10">
                    <div className="w-20 h-20 border border-zinc-800 group-hover:border-green-500 rounded-full flex items-center justify-center mb-6 bg-zinc-950 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all duration-500 relative">
                        <div className="absolute inset-0 rounded-full border border-dashed border-green-500/30 animate-spin-slow opacity-0 group-hover:opacity-100"></div>
                        <Crosshair size={40} className="text-zinc-600 group-hover:text-green-500 transition-colors" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-green-400 font-mono tracking-tighter transition-colors">ACQUIRE TARGET</h3>
                    <p className="text-zinc-500 text-xs mt-2 max-w-[200px] text-center font-mono group-hover:text-green-800 transition-colors">
                        >> SCAN GLOBAL DIRECTORY<br/>
                        >> SELECT VICTIM<br/>
                        >> INITIATE PROTOCOL
                    </p>
                </div>
                <div className="p-2 bg-zinc-950 border-t border-zinc-800 group-hover:border-green-500/50 flex justify-between items-center text-[10px] font-mono text-zinc-600 group-hover:text-green-500 transition-colors">
                     <span className="flex items-center gap-1"><MapPin size={10}/> DATABASE ONLINE</span>
                     <span className="animate-pulse">READY</span>
                </div>
            </motion.button>

            {/* NEURAL UPGRADES */}
            <motion.button
                variants={itemVariants}
                onClick={() => onChangeView(GameView.SKILL_TREE)}
                className="relative group bg-black border border-zinc-800 hover:border-blue-500 transition-all duration-500 flex flex-col overflow-hidden rounded-sm"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {renderCornerBrackets("border-blue-500/0 group-hover:border-blue-500/100 transition-all duration-500")}
                
                <div className="p-6 flex-1 flex flex-col items-center justify-center z-10">
                    <div className="w-20 h-20 border border-zinc-800 group-hover:border-blue-500 rounded-full flex items-center justify-center mb-6 bg-zinc-950 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-500 relative">
                         <div className="absolute inset-0 rounded-full border border-dashed border-blue-500/30 animate-spin-slow opacity-0 group-hover:opacity-100" style={{animationDirection: 'reverse'}}></div>
                        <BrainCircuit size={40} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-400 font-mono tracking-tighter transition-colors">NEURAL UPGRADES</h3>
                    <p className="text-zinc-500 text-xs mt-2 max-w-[200px] text-center font-mono group-hover:text-blue-800 transition-colors">
                        >> ENHANCE ALGORITHMS<br/>
                        >> SOCIAL ENGINEERING<br/>
                        >> UNLOCK NEW VECTORS
                    </p>
                </div>
                <div className="p-2 bg-zinc-950 border-t border-zinc-800 group-hover:border-blue-500/50 flex justify-between items-center text-[10px] font-mono text-zinc-600 group-hover:text-blue-500 transition-colors">
                     <span className="flex items-center gap-1"><Zap size={10}/> SYNC COMPLETE</span>
                     <span>{player.skills.length} ACTIVE NODES</span>
                </div>
            </motion.button>

            {/* BLACK MARKET */}
            <motion.button
                variants={itemVariants}
                onClick={() => onChangeView(GameView.SHOP)}
                className="relative group bg-black border border-zinc-800 hover:border-purple-500 transition-all duration-500 flex flex-col overflow-hidden rounded-sm"
            >
                 <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {renderCornerBrackets("border-purple-500/0 group-hover:border-purple-500/100 transition-all duration-500")}
                
                <div className="p-6 flex-1 flex flex-col items-center justify-center z-10">
                    <div className="w-20 h-20 border border-zinc-800 group-hover:border-purple-500 rounded-full flex items-center justify-center mb-6 bg-zinc-950 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-500 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-dotted border-purple-500/30 animate-[spin_5s_linear_infinite] opacity-0 group-hover:opacity-100"></div>
                        <ShoppingBag size={40} className="text-zinc-600 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-400 font-mono tracking-tighter transition-colors">BLACK MARKET</h3>
                    <p className="text-zinc-500 text-xs mt-2 max-w-[200px] text-center font-mono group-hover:text-purple-800 transition-colors">
                        >> HARDWARE UPGRADES<br/>
                        >> THREAT MITIGATION<br/>
                        >> ILLICIT SERVICES
                    </p>
                </div>
                <div className="p-2 bg-zinc-950 border-t border-zinc-800 group-hover:border-purple-500/50 flex justify-between items-center text-[10px] font-mono text-zinc-600 group-hover:text-purple-500 transition-colors">
                     <span className="flex items-center gap-1"><Lock size={10}/> ENCRYPTED TUNNEL</span>
                     <span>V3.0</span>
                </div>
            </motion.button>

        </div>

        {/* --- BOTTOM ROW: SYSTEM STATUS (Expanded) --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0 min-h-[140px] md:h-[25%]">
            
            {/* ACTIVE PROTOCOLS */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-zinc-900/20 border border-zinc-800/60 p-4 relative overflow-hidden backdrop-blur-sm flex flex-col">
                {renderCornerBrackets("border-zinc-600/50")}
                <h4 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                    <Activity size={12}/> Active Protocols
                </h4>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                     {player.skills.length === 0 && player.inventory.length === 0 && (
                         <div className="text-zinc-700 text-xs font-mono italic text-center mt-4">No active subroutines.</div>
                     )}
                     {player.skills.map(s => (
                         <div key={s} className="flex items-center justify-between text-xs bg-blue-950/20 p-2 rounded border border-blue-900/30 text-blue-300">
                             <span className="font-mono">{s.replace(/_/g, ' ').toUpperCase()}</span>
                             <span className="text-[9px] bg-blue-900/50 px-1 rounded">PASSIVE</span>
                         </div>
                     ))}
                     {player.inventory.map((s, i) => (
                          <div key={`${s}-${i}`} className="flex items-center justify-between text-xs bg-purple-950/20 p-2 rounded border border-purple-900/30 text-purple-300">
                             <span className="font-mono">{s.replace(/_/g, ' ').toUpperCase()}</span>
                             <span className="text-[9px] bg-purple-900/50 px-1 rounded">ITEM</span>
                         </div>
                     ))}
                </div>
            </motion.div>

            {/* ACHIEVEMENTS */}
            <motion.div variants={itemVariants} className="md:col-span-8 bg-zinc-900/20 border border-zinc-800/60 p-4 relative overflow-hidden backdrop-blur-sm flex flex-col">
                 {renderCornerBrackets("border-yellow-600/50")}
                 <div className="flex justify-between items-center mb-3 border-b border-yellow-900/20 pb-2">
                     <h4 className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Trophy size={12}/> Hall of Fame
                    </h4>
                    <span className="text-[10px] text-yellow-700 font-mono">{player.achievements.length}/{ACHIEVEMENTS.length} UNLOCKED</span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                         {ACHIEVEMENTS.map(ach => {
                             const unlocked = player.achievements.includes(ach.id);
                             return (
                                 <div key={ach.id} className={`p-2 rounded border flex flex-col items-center text-center gap-1 transition-all ${unlocked ? 'bg-yellow-900/10 border-yellow-600/40 opacity-100' : 'bg-zinc-950 border-zinc-800 opacity-30'}`}>
                                     <div className={`w-6 h-6 rounded-full flex items-center justify-center ${unlocked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-900 text-zinc-700'}`}>
                                         <Award size={12} />
                                     </div>
                                     <span className={`text-[9px] font-bold leading-tight ${unlocked ? 'text-yellow-200' : 'text-zinc-600'}`}>{ach.title}</span>
                                 </div>
                             )
                         })}
                     </div>
                 </div>
            </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
