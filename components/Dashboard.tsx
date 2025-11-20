
import React from 'react';
import { PlayerState, GameView } from '../types';
import { ShieldAlert, ShoppingBag, BrainCircuit, MessageSquare, User, Activity, Crosshair, Globe } from 'lucide-react';

interface Props {
  player: PlayerState;
  onChangeView: (view: GameView) => void;
}

const Dashboard: React.FC<Props> = ({ player, onChangeView }) => {
  return (
    <div className="h-full p-8 space-y-8 overflow-y-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
            <img src={player.attributes.avatarUrl} className="w-20 h-20 rounded-xl border-2 border-zinc-700 object-cover shadow-lg" />
            <div>
              <p className="text-2xl font-bold text-white font-mono tracking-tighter">{player.attributes.name}</p>
              <p className="text-xs text-green-500 font-bold uppercase tracking-widest mb-1">{player.attributes.archetype}</p>
              <div className="flex items-center gap-4 text-zinc-400 text-xs mt-2">
                  <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                      <Globe size={10} /> {player.attributes.country}
                  </span>
                  <span className="flex items-center gap-1">
                      <User size={10} /> Level {Math.floor(player.scamsCompleted / 3) + 1}
                  </span>
              </div>
            </div>
        </div>

        {/* Money Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden backdrop-blur-sm">
           <div className="flex items-center justify-between mb-2">
               <span className="text-zinc-400 text-xs uppercase tracking-widest">Untraceable Funds</span>
               <Activity size={16} className="text-green-500" />
           </div>
           <p className="text-4xl font-bold font-mono text-white tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
               ${player.money.toLocaleString()}
           </p>
        </div>

        {/* Threat Card */}
        <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden backdrop-blur-sm group">
           <div className={`absolute inset-0 transition-opacity duration-500 ${player.threatLevel > 80 ? 'bg-red-500/20 opacity-100' : 'bg-red-500/5 opacity-0 group-hover:opacity-100'}`}></div>
           <div className="flex items-center justify-between mb-2 relative z-10">
               <span className="text-zinc-400 text-xs uppercase tracking-widest flex items-center gap-2">
                   <ShieldAlert size={14} className={player.threatLevel > 80 ? 'text-red-500 animate-pulse' : 'text-red-500'} />
                   Heat Level
               </span>
               <span className={`text-xs font-bold ${player.threatLevel > 80 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                   {player.threatLevel > 80 ? 'CRITICAL' : player.threatLevel > 50 ? 'HIGH' : 'LOW'}
               </span>
           </div>
           <div className="flex items-end gap-2 relative z-10">
               <p className="text-4xl font-bold font-mono text-white tracking-tighter">{player.threatLevel}%</p>
           </div>
           <div className="w-full bg-zinc-800 h-1.5 mt-4 rounded-full overflow-hidden relative z-10">
               <div 
                className={`h-full transition-all duration-1000 ease-out ${player.threatLevel > 80 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-red-500'}`} 
                style={{ width: `${player.threatLevel}%` }}
               />
           </div>
        </div>
      </div>

      {/* Main Actions - Holographic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
        <button 
          onClick={() => onChangeView(GameView.SCAM_SELECTION)}
          className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-500 text-left flex flex-col justify-between overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-50 transition-opacity duration-500">
              <Crosshair size={100} className="text-green-500" />
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700 mb-6 group-hover:border-green-500 group-hover:text-green-500 transition-colors">
                <MessageSquare size={24} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2 font-mono">ACQUIRE TARGET</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Access the directory. Select a mark based on risk profile and potential payout.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-green-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              INITIATE SCAN <span className="animate-pulse">_</span>
          </div>
        </button>

        <button 
          onClick={() => onChangeView(GameView.SKILL_TREE)}
          className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-500 text-left flex flex-col justify-between overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-50 transition-opacity duration-500">
              <BrainCircuit size={100} className="text-blue-500" />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700 mb-6 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                <BrainCircuit size={24} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2 font-mono">NEURAL UPGRADES</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Enhance social engineering capabilities. Unlock new dialog options and intel tools.</p>
          </div>
           <div className="relative z-10 flex items-center gap-2 text-blue-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              ACCESS MAINYFRAME <span className="animate-pulse">_</span>
          </div>
        </button>

        <button 
           onClick={() => onChangeView(GameView.SHOP)}
           className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 text-left flex flex-col justify-between overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-50 transition-opacity duration-500">
              <ShoppingBag size={100} className="text-purple-500" />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700 mb-6 group-hover:border-purple-500 group-hover:text-purple-500 transition-colors">
                <ShoppingBag size={24} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2 font-mono">BLACK MARKET</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Purchase illegal hardware, bribes, and data leaks to bypass security measures.</p>
          </div>
           <div className="relative z-10 flex items-center gap-2 text-purple-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              OPEN TOR BROWSER <span className="animate-pulse">_</span>
          </div>
        </button>
      </div>
      
      {/* Recent Activity / Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h4 className="text-zinc-500 text-xs font-bold uppercase mb-4">Active Effects</h4>
              <div className="flex flex-wrap gap-2">
                  {player.skills.length === 0 && player.inventory.length === 0 && <span className="text-zinc-600 italic text-sm">No active enhancements.</span>}
                  {player.skills.map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-900/30 border border-blue-800 text-blue-400 rounded text-xs">{s.replace('_', ' ')}</span>
                  ))}
                  {player.inventory.map(i => (
                      <span key={i} className="px-3 py-1 bg-purple-900/30 border border-purple-800 text-purple-400 rounded text-xs">{i.replace('_', ' ')}</span>
                  ))}
              </div>
          </div>
           <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex justify-between items-center">
              <div>
                <h4 className="text-zinc-500 text-xs font-bold uppercase mb-1">Successful Cons</h4>
                <p className="text-2xl font-mono text-white">{player.scamsCompleted}</p>
              </div>
               <div>
                <h4 className="text-zinc-500 text-xs font-bold uppercase mb-1">Market Status</h4>
                <p className="text-2xl font-mono text-green-500 flex items-center gap-2">ONLINE <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span></p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
