
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Terminal, Bot, UserCheck } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const LandingScreen: React.FC<Props> = ({ onStart }) => {

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden flex items-center justify-center p-4 font-sans">
      {/* Background Grid and Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 animate-scan pointer-events-none"></div>

      <div className="max-w-5xl w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Title & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-green-500/30 bg-green-900/10 text-green-400 text-xs font-mono mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              SYSTEM_ONLINE // V2.0
            </div>
            <h1 className="text-6xl md:text-7xl font-black font-mono tracking-tighter leading-tight mb-2">
              SOCIAL<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-300">ENGINEER</span>
            </h1>
            <p className="text-xl text-zinc-400 font-mono">The Long Con Simulator</p>
          </div>

          <div className="space-y-6 text-zinc-300 text-sm leading-relaxed border-l-2 border-zinc-800 pl-6">
            <p>
              <strong className="text-white block mb-1">MISSION BRIEFING:</strong>
              You are a digital con artist. Your goal is to extract funds from <span className="text-green-400 font-bold">AI-generated targets</span> using social engineering, charisma, and black-market tools.
            </p>
            <p>
              <strong className="text-white block mb-1">MECHANICS:</strong>
              Unlike standard RPGs, there are no scripted dialogues. You type your own messages. An AI Arbiter judges your creativity, persuasion, and logic in real-time.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
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

        {/* Right Column: Authentication */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700">
                    <Terminal className="text-green-500" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white font-mono">ACCESS CONTROL</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Authentication Required</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                    onClick={onStart}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-[1.02]"
                >
                    <Play size={18} fill="currentColor" /> INITIALIZE SYSTEM
                </button>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default LandingScreen;
