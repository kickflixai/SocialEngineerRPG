
import React from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, MessageSquare, Globe, Activity, Crosshair, Trophy, Award, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
}

const Dashboard: React.FC<Props> = ({ player, onChangeView }) => {
  return (
    <div className="h-full p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar flex flex-col">
      {/* Header Stats - Compact for Laptop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0">
        {/* Profile Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
            <img src={player.attributes.avatarUrl} className="w-16 h-16 rounded-lg border-2 border-zinc-700 object-cover shadow-lg" />
            <div>
              <p className="text-lg md:text-xl font-bold text-white font-mono tracking-tighter truncate">{player.attributes.name}</p>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-1">{player.attributes.archetype}</p>
              <div className="flex items-center gap-3 text-zinc-400 text-xs mt-1">
                  <span className="flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">
                      <Globe size={10} /> {player.attributes.country}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                      <Trophy size={10} /> Hacks: {player.scamsCompleted}
                  </span>
              </div>
            </div>
        </div>

        {/* Money Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden backdrop-blur-sm">
           <div className="flex items-center justify-between mb-1">
               <span className="text-zinc-400 text-[10px] uppercase tracking-widest">Untraceable Funds</span>
               <Activity size={14} className="text-green-500" />
           </div>
           <p className="text-3xl font-bold font-mono text-white tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
               ${player.money.toLocaleString()}
           </p>
        </div>

        {/* Threat Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden backdrop-blur-sm group">
           <div className={`absolute inset-0 transition-opacity duration-500 ${player.threatLevel > 80 ? 'bg-red-500/20 opacity-100' : 'bg-red-500/5 opacity-0 group-hover:opacity-100'}`}></div>
           <div className="flex items-center justify-between mb-1 relative z-10">
               <span className="text-zinc-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <ShieldAlert size={12} className={player.threatLevel > 80 ? 'text-red-500 animate-pulse' : 'text-red-500'} />
                   Heat Level
               </span>
               <span className={`text-[10px] font-bold ${player.threatLevel > 80 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                   {player.threatLevel > 80 ? 'CRITICAL' : player.threatLevel > 50 ? 'HIGH' : 'LOW'}
               </span>
           </div>
           <div className="flex items-end gap-2 relative z-10">
               <p className="text-3xl font-bold font-mono text-white tracking-tighter">{player.threatLevel}%</p>
           </div>
           <div className="w-full bg-zinc-800 h-1 mt-3 rounded-full overflow-hidden relative z-10">
               <div 
                className={`h-full transition-all duration-1000 ease-out ${player.threatLevel > 80 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-red-500'}`} 
                style={{ width: `${player.threatLevel}%` }}
               />
           </div>
        </div>
      </div>

      {/* Main Actions - Reduced Height & Optimized for Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <button 
          onClick={() => onChangeView(GameView.SCAM_SELECTION)}
          className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-green-500/50 transition-all duration-500 text-left flex flex-row md:flex-col items-center md:items-start justify-between overflow-hidden shadow-lg h-24 md:h-48"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex md:flex-col items-center md:items-start gap-4 md:gap-0 w-full">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700 md:mb-4 group-hover:border-green-500 group-hover:text-green-500 transition-colors shrink-0">
                <MessageSquare size={18} />
            </div>
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 font-mono">ACQUIRE TARGET</h3>
                <p className="text-zinc-500 text-xs leading-tight hidden md:block">Access the directory. Select a mark.</p>
            </div>
          </div>
          <div className="relative z-10 md:mt-auto self-center md:self-start">
             <div className="text-green-500 text-xs font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
               INITIATE <span className="animate-pulse">_</span>
             </div>
          </div>
        </button>

        <button 
          onClick={() => onChangeView(GameView.SKILL_TREE)}
          className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-500 text-left flex flex-row md:flex-col items-center md:items-start justify-between overflow-hidden shadow-lg h-24 md:h-48"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex md:flex-col items-center md:items-start gap-4 md:gap-0 w-full">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700 md:mb-4 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors shrink-0">
                <BrainCircuit size={18} />
            </div>
             <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 font-mono">NEURAL UPGRADES</h3>
                <p className="text-zinc-500 text-xs leading-tight hidden md:block">Enhance social engineering capabilities.</p>
             </div>
          </div>
          <div className="relative z-10 md:mt-auto self-center md:self-start">
              <div className="text-blue-500 text-xs font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
               ACCESS <span className="animate-pulse">_</span>
             </div>
          </div>
        </button>

        <button 
           onClick={() => onChangeView(GameView.SHOP)}
           className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-500 text-left flex flex-row md:flex-col items-center md:items-start justify-between overflow-hidden shadow-lg h-24 md:h-48"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex md:flex-col items-center md:items-start gap-4 md:gap-0 w-full">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700 md:mb-4 group-hover:border-purple-500 group-hover:text-purple-500 transition-colors shrink-0">
                <ShoppingBag size={18} />
            </div>
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 font-mono">BLACK MARKET</h3>
                <p className="text-zinc-500 text-xs leading-tight hidden md:block">Purchase hardware and services.</p>
            </div>
          </div>
          <div className="relative z-10 md:mt-auto self-center md:self-start">
              <div className="text-purple-500 text-xs font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
               ENTER <span className="animate-pulse">_</span>
             </div>
          </div>
        </button>
      </div>
      
      {/* Bottom Section: Achievements & Active Effects */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Active Effects (Smaller) */}
          <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 overflow-y-auto custom-scrollbar">
              <h4 className="text-zinc-500 text-[10px] font-bold uppercase mb-3">Active Protocols</h4>
              <div className="flex flex-wrap gap-2">
                  {player.skills.length === 0 && player.inventory.length === 0 && <span className="text-zinc-600 italic text-xs">No active enhancements.</span>}
                  {player.skills.map(s => (
                      <span key={s} className="px-2 py-1 bg-blue-900/30 border border-blue-800 text-blue-400 rounded text-[10px] truncate max-w-full">{s.replace('_', ' ')}</span>
                  ))}
                  {player.inventory.map(i => (
                      <span key={i} className="px-2 py-1 bg-purple-900/30 border border-purple-800 text-purple-400 rounded text-[10px] truncate max-w-full">{i.replace('_', ' ')}</span>
                  ))}
              </div>
          </div>

           {/* Achievements Panel */}
           <div className="md:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col min-h-[150px]">
              <div className="flex items-center justify-between mb-3 shrink-0">
                  <h4 className="text-zinc-500 text-[10px] font-bold uppercase flex items-center gap-2">
                      <Award size={12} /> Career Achievements
                  </h4>
                  <span className="text-[10px] text-zinc-500">
                      {player.achievements.length}/{ACHIEVEMENTS.length} UNLOCKED
                  </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                  {ACHIEVEMENTS.map(ach => {
                      const unlocked = player.achievements.includes(ach.id);
                      return (
                          <div 
                            key={ach.id} 
                            className={`p-2 rounded border flex items-center gap-3 ${
                                unlocked 
                                ? 'bg-yellow-900/10 border-yellow-600/30' 
                                : 'bg-zinc-950/50 border-zinc-800 opacity-60'
                            }`}
                          >
                              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${unlocked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                  {unlocked ? <Trophy size={14} /> : <Lock size={14} />}
                              </div>
                              <div className="min-w-0">
                                  <h5 className={`text-xs font-bold truncate ${unlocked ? 'text-yellow-500' : 'text-zinc-500'}`}>{ach.title}</h5>
                                  <p className="text-[10px] text-zinc-500 truncate">{unlocked ? ach.description : '???'}</p>
                              </div>
                          </div>
                      );
                  })}
              </div>
           </div>
      </div>
    </div>
  );
};

export default Dashboard;
