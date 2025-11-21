
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Terminal, Bot, UserCheck, Volume2, VolumeX, Disc, RefreshCw } from 'lucide-react';

interface Props {
  onNewGame: () => void;
  onResume: () => void;
  saveSummary: { name: string; money: number; threat: number } | null;
  isMuted: boolean;
  toggleAudio: () => void;
}

const LandingScreen: React.FC<Props> = ({ onNewGame, onResume, saveSummary, isMuted, toggleAudio }) => {
  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden flex items-center justify-center p-4 md:p-8 font-sans">
      {/* Background Grid and Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 animate-scan pointer-events-none"></div>
      
      {/* Mute Button */}
      <button onClick={toggleAudio} className="absolute top-4 right-4 z-50 p-2 rounded bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
            {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
      </button>

      <div className="max-w-5xl w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
        
        {/* Left Column: Title & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 md:space-y-8 text-center lg:text-left"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-green-500/30 bg-green-900/10 text-green-400 text-xs font-mono mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              SYSTEM_ONLINE // V2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-mono tracking-tighter leading-tight mb-2">
              SCAM<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-300">SIMULATOR</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 font-mono">The Social Engineering RPG</p>
          </div>

          <div className="space-y-6 text-zinc-300 text-sm leading-relaxed border-l-0 lg:border-l-2 border-zinc-800 pl-0 lg:pl-6 text-left">
            <p>
              <strong className="text-white block mb-1">MISSION BRIEFING:</strong>
              You are a digital con artist. Your goal is to extract funds from <span className="text-green-400 font-bold">AI-generated targets</span> using social engineering, charisma, and black-market tools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
               <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 flex gap-3 items-center">
                  <Bot className="text-purple-500" size={20} />
                  <div>
                      <div className="font-bold text-white text-xs uppercase">Generative Victims</div>
                      <div className="text-[10px] text-zinc-500">Unique personalities every run</div>
                  </div>
               </div>
               <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 flex gap-3 items-center">
                  <UserCheck className="text-blue-500" size={20} />
                  <div>
                      <div className="font-bold text-white text-xs uppercase">AI Judgment</div>
                      <div className="text-[10px] text-zinc-500">Real-time success analysis</div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Authentication / Load Save */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 lg:mt-0"
        >
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700">
                    <Terminal className="text-green-500" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white font-mono">ACCESS CONTROL</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Identity Verification</p>
                </div>
              </div>

              {saveSummary ? (
                <div className="space-y-4">
                    <div className="p-4 bg-green-900/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-2">SUSPENDED SESSION FOUND</p>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-bold font-mono">{saveSummary.name}</span>
                            <span className="text-green-400 font-mono">${saveSummary.money.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-red-500 h-full" style={{width: `${saveSummary.threat}%`}}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                            <span>HEAT LEVEL</span>
                            <span>{Math.round(saveSummary.threat)}%</span>
                        </div>
                    </div>

                    <button 
                        onClick={onResume}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-[1.02]"
                    >
                        <Disc size={18} fill="currentColor" /> RESUME SESSION
                    </button>

                    <button 
                        onClick={onNewGame}
                        className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-xs"
                    >
                        <RefreshCw size={14} /> WIPE DATA & RESTART
                    </button>
                </div>
              ) : (
                <div className="space-y-4">
                    <p className="text-zinc-400 text-sm mb-4">
                    Establish secure uplink to the Dark Web mainframe. 
                    </p>

                    <button 
                        onClick={onNewGame}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-[1.02]"
                    >
                        <Play size={18} fill="currentColor" /> INITIALIZE SYSTEM
                    </button>
                </div>
              )}

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default LandingScreen;
