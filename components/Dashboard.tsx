
import React from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, MessageSquare, Globe, Activity, Trophy, Award, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
}

const Dashboard: React.FC<Props> = ({ player, onChangeView }) => {
  return (
    <div className="h-full p-4 md:p-6 space-y-4 overflow-hidden flex flex-col">
      {/* Header Stats - Taller & More Prominent for Laptop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0 min-h-[180px]">
        {/* Profile Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent"></div>
            <div className="flex items-start gap-4 relative z-10">
                <img src={player.attributes.avatarUrl} className="w-20 h-20 rounded-xl border-2 border-zinc-700 object-cover shadow-lg" />
                <div className="min-w-0 flex-1">
                    <p className="text-xl md:text-2xl font-bold text-white font-mono tracking-tighter truncate">{player.attributes.name}</p>
                    <p className="text-xs text-green-500 font-bold uppercase tracking-widest mb-2">{player.attributes.archetype}</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-700/50 text-[10px] text-zinc-400">
                            <Globe size={10} /> {player.attributes.country}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-4 relative z-10 bg-zinc-950/30 p-2 rounded-lg border border-zinc-800/50">
                 <Trophy size={14} className="text-yellow-500" />
                 <span className="text-xs text-zinc-400 uppercase font-bold">Successful Hacks:</span>
                 <span className="text-yellow-400 font-mono font-bold">{player.scamsCompleted}</span>
            </div>
        </div>

        {/* Money Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden backdrop-blur-sm shadow-lg">
           <div className="flex items-center justify-between mb-2">
               <span className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Untraceable Funds</span>
               <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                   <Activity size={18} className="text-green-500" />
               </div>
           </div>
           <p className="text-4xl md:text-5xl font-bold font-mono text-white tracking-tighter drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] mt-2">
               ${player.money.toLocaleString()}
           </p>
        </div>

        {/* Threat Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm group shadow-lg">
           <div className={`absolute inset-0 transition-opacity duration-1000 ${player.threatLevel > 80 ? 'bg-red-500/10 opacity-100' : 'bg-red-500/5 opacity-0 group-hover:opacity-100'}`}></div>
           
           <div className="flex items-center justify-between relative z-10">
               <span className="text-zinc-400 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                   <ShieldAlert size={14} className={player.threatLevel > 80 ? 'text-red-500 animate-pulse' : 'text-red-500'} />
                   Global Heat
               </span>
               <span className={`text-xs font-bold px-2 py-1 rounded border ${player.threatLevel > 80 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                   {player.threatLevel > 80 ? 'CRITICAL' : player.threatLevel > 50 ? 'HIGH' : 'LOW'}
               </span>
           </div>
           
           <div className="relative z-10 mt-4">
               <div className="flex items-baseline gap-1 mb-2">
                    <p className="text-4xl md:text-5xl font-bold font-mono text-white tracking-tighter">{player.threatLevel}</p>
                    <span className="text-sm text-zinc-500 font-mono">%</span>
               </div>
               <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ease-out ${player.threatLevel > 80 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-red-500'}`} 
                    style={{ width: `${player.threatLevel}%` }}
                   />
               </div>
           </div>
        </div>
      </div>

      {/* Main Actions - Compact Height (h-32) to save space */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <button 
          onClick={() => onChangeView(GameView.SCAM_SELECTION)}
          className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-green-500/50 transition-all duration-300 text-left flex flex-row items-center justify-between overflow-hidden shadow-lg h-24 md:h-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-row items-center gap-4 w-full">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700 group-hover:border-green-500 group-hover:text-green-500 transition-colors shrink-0 shadow-lg">
                <MessageSquare size={20} />
            </div>
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white font-mono leading-none mb-1">ACQUIRE TARGET</h3>
                <p className="text-zinc-500 text-xs">Access directory. Select mark.</p>
            </div>
          </div>
          <div className="relative z-10 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
               <MessageSquare size={16} />
          </div>
        </button>

        <button 
          onClick={() => onChangeView(GameView.SKILL_TREE)}
          className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 text-left flex flex-row items-center justify-between overflow-hidden shadow-lg h-24 md:h-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-row items-center gap-4 w-full">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors shrink-0 shadow-lg">
                <BrainCircuit size={20} />
            </div>
             <div>
                <h3 className="text-lg md:text-xl font-bold text-white font-mono leading-none mb-1">NEURAL UPGRADES</h3>
                <p className="text-zinc-500 text-xs">Enhance capabilities.</p>
             </div>
          </div>
          <div className="relative z-10 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
               <BrainCircuit size={16} />
          </div>
        </button>

        <button 
           onClick={() => onChangeView(GameView.SHOP)}
           className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 text-left flex flex-row items-center justify-between overflow-hidden shadow-lg h-24 md:h-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-row items-center gap-4 w-full">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700 group-hover:border-purple-500 group-hover:text-purple-500 transition-colors shrink-0 shadow-lg">
                <ShoppingBag size={20} />
            </div>
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white font-mono leading-none mb-1">BLACK MARKET</h3>
                <p className="text-zinc-500 text-xs">Hardware and services.</p>
            </div>
          </div>
          <div className="relative z-10 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
               <ShoppingBag size={16} />
          </div>
        </button>
      </div>
      
      {/* Bottom Section: Achievements & Active Effects - Flex fill */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Active Effects */}
          <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 overflow-y-auto custom-scrollbar relative">
              <h4 className="text-zinc-500 text-[10px] font-bold uppercase mb-3 sticky top-0 bg-zinc-900/95 backdrop-blur py-1 z-10 border-b border-zinc-800/50 w-full">Active Protocols</h4>
              <div className="flex flex-wrap gap-2">
                  {player.skills.length === 0 && player.inventory.length === 0 && <span className="text-zinc-600 italic text-xs">No active enhancements.</span>}
                  {player.skills.map(s => (
                      <span key={s} className="px-2 py-1 bg-blue-900/30 border border-blue-800 text-blue-400 rounded text-[10px] font-mono">{s.replace('_', ' ')}</span>
                  ))}
                  {player.inventory.map(i => (
                      <span key={i} className="px-2 py-1 bg-purple-900/30 border border-purple-800 text-purple-400 rounded text-[10px] font-mono">{i.replace('_', ' ')}</span>
                  ))}
              </div>
          </div>

           {/* Achievements Panel */}
           <div className="md:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0 sticky top-0 z-10">
                  <h4 className="text-zinc-500 text-[10px] font-bold uppercase flex items-center gap-2">
                      <Award size={12} /> Career Achievements
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                      {player.achievements.length}/{ACHIEVEMENTS.length}
                  </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {ACHIEVEMENTS.map(ach => {
                      const unlocked = player.achievements.includes(ach.id);
                      return (
                          <div 
                            key={ach.id} 
                            className={`p-2 rounded border flex items-center gap-3 transition-colors ${
                                unlocked 
                                ? 'bg-yellow-900/10 border-yellow-600/30' 
                                : 'bg-zinc-950/50 border-zinc-800/50 opacity-50'
                            }`}
                          >
                              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${unlocked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                  {unlocked ? <Trophy size={14} /> : <Lock size={14} />}
                              </div>
                              <div className="min-w-0 overflow-hidden">
                                  <h5 className={`text-[10px] font-bold truncate ${unlocked ? 'text-yellow-500' : 'text-zinc-500'}`}>{ach.title}</h5>
                                  {unlocked && <p className="text-[9px] text-zinc-400 truncate">{ach.description}</p>}
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
