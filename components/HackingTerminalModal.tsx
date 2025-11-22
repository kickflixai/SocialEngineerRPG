
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Code, Mail, Bell, Speaker, WifiOff, Shuffle, FileCheck, BadgeCheck, Search, Key, Printer, Lightbulb, MonitorX, AppWindow, Music, Disc, Thermometer, Ghost, MousePointer2, Video, Lock, Clock } from 'lucide-react';
import { HackAbility } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  abilities: HackAbility[];
  socialCharge: number;
  onExecute: (hack: HackAbility) => void;
  cooldowns: string | null;
  processing: boolean;
}

const HackingTerminalModal: React.FC<Props> = ({ isOpen, onClose, abilities, socialCharge, onExecute, cooldowns, processing }) => {
  if (!isOpen) return null;

  // Icon Helper (Duplicated to ensure self-containment)
  const HackIcon = ({ icon }: { icon: string }) => {
    switch(icon) {
        case 'Mail': return <Mail size={20}/>;
        case 'Bell': return <Bell size={20}/>;
        case 'Speaker': return <Speaker size={20}/>;
        case 'WifiOff': return <WifiOff size={20}/>;
        case 'Shuffle': return <Shuffle size={20}/>;
        case 'FileCheck': return <FileCheck size={20}/>;
        case 'Mic': return <Code size={20}/>; // Fallback
        case 'BadgeCheck': return <BadgeCheck size={20}/>;
        case 'Search': return <Search size={20}/>;
        case 'Key': return <Key size={20}/>;
        case 'Printer': return <Printer size={20}/>;
        case 'Lightbulb': return <Lightbulb size={20}/>;
        case 'MonitorX': return <MonitorX size={20}/>;
        case 'AppWindow': return <AppWindow size={20}/>;
        case 'Music': return <Music size={20}/>;
        case 'Disc': return <Disc size={20}/>;
        case 'Thermometer': return <Thermometer size={20}/>;
        case 'Ghost': return <Ghost size={20}/>;
        case 'MousePointer2': return <MousePointer2 size={20}/>;
        case 'Video': return <Video size={20}/>;
        case 'Clock': return <Clock size={20}/>;
        default: return <Code size={20}/>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
      >
        <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-5xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Code size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                            HACKING_CONSOLE <span className="text-blue-500 animate-pulse hidden md:inline">_ACTIVE</span>
                        </h2>
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest hidden md:block">Select payload to deploy</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Available Power</div>
                        <div className="text-2xl font-mono text-blue-400 font-bold flex items-center justify-end gap-2">
                             <Zap size={18} fill="currentColor" /> {socialCharge}%
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[linear-gradient(rgba(0,0,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {abilities.map(hack => {
                         const canAfford = socialCharge >= hack.cost;
                         const isOnCooldown = cooldowns === hack.id;
                         const isLocked = !canAfford;

                         return (
                            <button
                                key={hack.id}
                                onClick={() => {
                                    if (canAfford && !isOnCooldown && !processing) {
                                        onExecute(hack);
                                        onClose();
                                    }
                                }}
                                disabled={!canAfford || processing || isOnCooldown}
                                className={`relative group p-4 rounded-xl border flex flex-col gap-3 text-left transition-all overflow-hidden ${
                                    isOnCooldown 
                                    ? 'bg-zinc-900/50 border-green-500/50 cursor-not-allowed'
                                    : canAfford 
                                        ? 'bg-zinc-900/80 border-zinc-700 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                                        : 'bg-zinc-950 border-zinc-800 opacity-60 grayscale cursor-not-allowed'
                                }`}
                            >
                                {isOnCooldown && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                                        <span className="text-green-500 font-mono font-bold animate-pulse">EXECUTING...</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-lg border ${canAfford ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                        <HackIcon icon={hack.icon} />
                                    </div>
                                    <span className={`font-mono font-bold text-xs px-2 py-1 rounded border ${canAfford ? 'bg-zinc-950 text-blue-400 border-blue-900/50' : 'bg-zinc-950 text-red-700 border-red-900/30'}`}>
                                        {hack.cost} PWR
                                    </span>
                                </div>

                                <div>
                                    <h3 className={`font-bold font-mono text-lg mb-1 ${canAfford ? 'text-white group-hover:text-blue-300' : 'text-zinc-500'}`}>{hack.name}</h3>
                                    <p className="text-xs text-zinc-400 leading-relaxed h-10 overflow-hidden">{hack.description}</p>
                                </div>
                                
                                <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                                    <span>System Hack</span>
                                    {isLocked && <span className="flex items-center gap-1 text-red-800"><Lock size={10}/> INSUFFICIENT PWR</span>}
                                    {canAfford && !isOnCooldown && <span className="text-blue-500 group-hover:underline">{`>>`} DEPLOY</span>}
                                </div>
                            </button>
                         );
                    })}
                </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                 <p className="text-[10px] text-zinc-600 font-mono">WARNING: SOME HACKS MAY INCREASE SUSPICION LEVELS. USE WITH DISCRETION.</p>
            </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HackingTerminalModal;