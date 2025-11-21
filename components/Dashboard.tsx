
import React from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, MessageSquare, Globe, Activity, Trophy, Award, Lock, Package, Power, Zap, Crosshair, MapPin, TrendingUp, User } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
  onOpenInventory: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<Props> = ({ player, onChangeView, onOpenInventory, onReset }) => {
  
  // Helper for rendering heat bar segments
  const renderHeatSegments = () => {
    const segments = 20;
    const fillCount = Math.ceil((player.threatLevel / 100) * segments);
    return Array.from({ length: segments }).map((_, i) => (
      <div 
        key={i} 
        className={`h-full w-1 rounded-sm transition-all duration-500 ${
          i < fillCount 
            ? i > 15 ? 'bg-red-500 shadow-[0_0_5px_red]' : i > 10 ? 'bg-orange-500' : 'bg-red-900' 
            : 'bg-zinc-900'
        }`}
      />
    ));
  };

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden font-sans selection:bg-green-500/30">
      
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

      {/* --- TOP HUD: STATS & PROFILE --- */}
      <header className="shrink-0 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative z-20 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        
        {/* Profile Section */}
        <div className="md:col-span-4 flex items-center gap-4 group cursor-default">
            <div className="relative w-16 h-16 shrink-0">
                <div className="absolute inset-0 rounded-xl border border-zinc-700 group-hover:border-green-500/50 transition-colors"></div>
                <img src={player.attributes.avatarUrl} alt="Profile" className="w-full h-full rounded-xl object-cover p-1 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-700 text-[10px] font-mono px-1.5 rounded text-zinc-400">LVL {Math.floor(player.scamsCompleted / 2) + 1}</div>
            </div>
            <div className="min-w-0">
                <h2 className="text-xl font-bold text-white font-mono tracking-tighter truncate">{player.attributes.name}</h2>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                    <span className="text-green-500">{player.attributes.archetype}</span>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                    <span className="flex items-center gap-1"><Globe size={10}/> {player.attributes.country}</span>
                </div>
            </div>
        </div>

        {/* Central Status / Heat */}
        <div className="md:col-span-4 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert size={12} className={player.threatLevel > 80 ? 'animate-pulse' : ''}/> Global Heat
                </span>
                <span className="text-xs font-mono text-white">{Math.round(player.threatLevel)}%</span>
            </div>
            <div className="h-3 flex gap-0.5 w-full bg-zinc-950/50 p-0.5 rounded border border-zinc-800">
                {renderHeatSegments()}
            </div>
        </div>

        {/* Money & Actions */}
        <div className="md:col-span-4 flex justify-between md:justify-end items-center gap-6">
             <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Untraceable Funds</span>
                <div className="text-2xl md:text-3xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                    ${player.money.toLocaleString()}
                </div>
             </div>
             <div className="flex gap-2">
                <button onClick={onOpenInventory} className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-white hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white group relative">
                    <Package size={20} />
                    {player.inventory.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full">{player.inventory.length}</span>}
                </button>
                <button onClick={onReset} className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 hover:border-red-500 hover:bg-red-900/50 transition-all text-red-500 group" title="Reset System">
                    <Power size={20} />
                </button>
             </div>
        </div>
      </header>

      {/* --- HERO SECTION: MAIN ACTIONS (Tallest) --- */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 min-h-0 overflow-y-auto custom-scrollbar z-10">
        
        {/* CARD 1: ACQUIRE TARGET */}
        <button 
            onClick={() => onChangeView(GameView.SCAM_SELECTION)}
            className="group relative flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-green-500/50 rounded-2xl p-6 md:p-8 transition-all duration-500 overflow-hidden text-left shadow-2xl"
        >
            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="w-14 h-14 bg-zinc-950 border border-zinc-700 group-hover:border-green-500 text-zinc-500 group-hover:text-green-500 rounded-xl flex items-center justify-center mb-6 transition-colors shadow-lg">
                    <Crosshair size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter mb-2 group-hover:text-green-400 transition-colors">ACQUIRE<br/>TARGET</h3>
                <p className="text-zinc-500 text-sm font-mono border-l-2 border-zinc-800 pl-3 group-hover:border-green-500/50 transition-colors">
                    Access directory.<br/>Select mark.<br/>Initiate Protocol.
                </p>
            </div>
            
            <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-bold font-mono text-zinc-600 group-hover:text-green-500 transition-colors uppercase tracking-widest">
                <MapPin size={14} /> 
                <span>Global Database Online</span>
            </div>
            
            {/* Decorative Lines */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
        </button>

        {/* CARD 2: NEURAL UPGRADES */}
        <button 
            onClick={() => onChangeView(GameView.SKILL_TREE)}
            className="group relative flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-6 md:p-8 transition-all duration-500 overflow-hidden text-left shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="w-14 h-14 bg-zinc-950 border border-zinc-700 group-hover:border-blue-500 text-zinc-500 group-hover:text-blue-500 rounded-xl flex items-center justify-center mb-6 transition-colors shadow-lg">
                    <BrainCircuit size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter mb-2 group-hover:text-blue-400 transition-colors">NEURAL<br/>UPGRADES</h3>
                <p className="text-zinc-500 text-sm font-mono border-l-2 border-zinc-800 pl-3 group-hover:border-blue-500/50 transition-colors">
                    Enhance cognitive<br/>functions & social<br/>engineering algorithms.
                </p>
            </div>

            <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-bold font-mono text-zinc-600 group-hover:text-blue-500 transition-colors uppercase tracking-widest">
                <Zap size={14} /> 
                <span>{player.skills.length} Enhancements Active</span>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
        </button>

        {/* CARD 3: BLACK MARKET */}
        <button 
            onClick={() => onChangeView(GameView.SHOP)}
            className="group relative flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-6 md:p-8 transition-all duration-500 overflow-hidden text-left shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="w-14 h-14 bg-zinc-950 border border-zinc-700 group-hover:border-purple-500 text-zinc-500 group-hover:text-purple-500 rounded-xl flex items-center justify-center mb-6 transition-colors shadow-lg">
                    <ShoppingBag size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter mb-2 group-hover:text-purple-400 transition-colors">BLACK<br/>MARKET</h3>
                <p className="text-zinc-500 text-sm font-mono border-l-2 border-zinc-800 pl-3 group-hover:border-purple-500/50 transition-colors">
                    Acquire illicit<br/>hardware & threat<br/>mitigation services.
                </p>
            </div>

            <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-bold font-mono text-zinc-600 group-hover:text-purple-500 transition-colors uppercase tracking-widest">
                <Lock size={14} /> 
                <span>Encrypted Connection</span>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
        </button>
      </main>

      {/* --- FOOTER: STATUS & ACHIEVEMENTS (Compact) --- */}
      <footer className="shrink-0 border-t border-zinc-800 bg-zinc-950/90 p-3 flex flex-col md:flex-row gap-4 overflow-hidden z-20 relative">
        
        {/* Left: Active Buffs */}
        <div className="w-full md:w-1/3 border-r border-zinc-800/50 pr-4 flex items-center gap-3 overflow-x-auto custom-scrollbar">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0 flex items-center gap-1">
                <Activity size={12}/> Active Protocols
            </div>
            <div className="flex gap-2">
                {player.skills.length === 0 && player.inventory.length === 0 && <span className="text-zinc-700 text-[10px] font-mono italic">None</span>}
                {player.skills.slice(0, 3).map(s => (
                     <span key={s} className="px-1.5 py-0.5 bg-blue-900/20 border border-blue-800/30 text-blue-400 rounded text-[9px] font-mono whitespace-nowrap">{s.replace('_', ' ')}</span>
                ))}
                {(player.skills.length > 3) && <span className="text-[9px] text-zinc-500">+{player.skills.length - 3}</span>}
            </div>
        </div>

        {/* Right: Achievements Ticker */}
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
             <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Trophy size={12}/> Achievements
                 </span>
                 <span className="text-[9px] text-zinc-600 font-mono">{player.achievements.length}/{ACHIEVEMENTS.length} Unlocked</span>
             </div>
             
             {/* Compact Horizontal Scroll */}
             <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                 {ACHIEVEMENTS.map(ach => {
                     const unlocked = player.achievements.includes(ach.id);
                     if (!unlocked) return null; // Only show unlocked to save space or keep "locked" ones dim
                     return (
                        <div key={ach.id} className="flex items-center gap-2 px-2 py-1 bg-zinc-900 border border-yellow-900/30 rounded shrink-0">
                            <Award size={10} className="text-yellow-500"/>
                            <span className="text-[10px] font-bold text-yellow-500/80 whitespace-nowrap">{ach.title}</span>
                        </div>
                     );
                 })}
                 {player.achievements.length === 0 && <span className="text-[10px] text-zinc-700 italic">No achievements unlocked yet.</span>}
                 
                 {/* Show locked as dim icons */}
                 {ACHIEVEMENTS.filter(a => !player.achievements.includes(a.id)).slice(0, 5).map(ach => (
                     <div key={ach.id} className="w-6 h-6 flex items-center justify-center border border-zinc-800 rounded bg-zinc-900/50 opacity-30 shrink-0">
                         <Lock size={10} className="text-zinc-600"/>
                     </div>
                 ))}
             </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
