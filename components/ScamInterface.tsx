
import React, { useState, useEffect, useRef } from 'react';
import { ScamState, PlayerState, ChatMessage, ShopItem } from '../types';
import { getVictimResponse, arbitrateChat, generateScamHint } from '../services/geminiService';
import { audioManager } from '../services/audioService';
import { Send, Terminal, Wifi, Radio, Loader2, Power, ShieldAlert, CheckCircle2, AlertTriangle, Lock, Circle, Package, ChevronDown, ChevronUp, Target, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryModal from './InventoryModal';

interface Props {
  scam: ScamState;
  player: PlayerState;
  onUpdateScam: (scam: ScamState) => void;
  onScamEnd: (result: 'success' | 'failed' | 'police') => void;
  onAbort: () => void;
  onOpenInventory: () => void;
  onConsumeItem: (item: ShopItem) => ShopItem;
}

const ScamInterface: React.FC<Props> = ({ scam, player, onUpdateScam, onScamEnd, onAbort, onOpenInventory, onConsumeItem }) => {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastThought, setLastThought] = useState<string | null>(null);
  
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [intelExpanded, setIntelExpanded] = useState(true);
  const [mobileStatsExpanded, setMobileStatsExpanded] = useState(false); 
  
  // Hint System
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);

  // Inventory Modal Local State
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [scam.history, processing, hints]);

  // Start Hacking Ambient Music
  useEffect(() => {
      audioManager.startHackingTheme();
      return () => {
          audioManager.stopHackingTheme();
      };
  }, []);

  const activeObjective = scam.objectives.find(o => !o.isCompleted) || scam.objectives[scam.objectives.length - 1];
  const allCompleted = scam.objectives.every(o => o.isCompleted);

  // Handle initial Victim Message
  useEffect(() => {
     if (!initRef.current && scam.history.length === 1 && scam.history[0].sender === 'player') {
         initRef.current = true;
         const fetchFirstReply = async () => {
             setProcessing(true);
             try {
                 const replyData = await getVictimResponse(scam.history, scam.victim, scam.category, activeObjective);
                 audioManager.playMessageReceived();
                 const newHistory = [...scam.history, { sender: 'victim', text: replyData.text, timestamp: Date.now() } as ChatMessage];
                 onUpdateScam({
                     ...scam,
                     history: newHistory
                 });
             } catch(e) { console.error(e); }
             setProcessing(false);
         };
         fetchFirstReply();
     }
  }, [scam, onUpdateScam, activeObjective]);

  // Intercept consumption to handle local state
  const handleUseItem = (item: ShopItem) => {
     onConsumeItem(item); // Remove from inventory globally

     if (item.effect === 'reduce_suspicion') {
         onUpdateScam({ ...scam, suspicion: Math.max(0, scam.suspicion - 30) });
         alert("Voice modulator active. Suspicion reduced.");
     } else if (item.effect === 'boost_trust') {
         onUpdateScam({ ...scam, trust: Math.min(100, scam.trust + 25) });
         alert("Fake ID verified. Trust boosted.");
     } else if (item.effect === 'reset_suspicion') {
         onUpdateScam({ ...scam, suspicion: 0 });
         alert("DDoS attack successful. Police comms blocked.");
     } else if (item.effect === 'force_objective') {
         // Complete current objective but raise suspicion/threat?
         const updatedObjectives = [...scam.objectives];
         const objIndex = updatedObjectives.findIndex(o => o.id === activeObjective.id);
         if (objIndex !== -1) {
             updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
         }
         onUpdateScam({ 
             ...scam, 
             objectives: updatedObjectives,
             trust: Math.max(0, scam.trust - 20) // Cost of using ransomware
         });
         alert("Ransomware deployed. Objective forced. Trust damaged.");
     }
  };

  const handleSend = async (textOverride?: string) => {
    const msgToSend = textOverride || input;
    if (!msgToSend.trim() || processing) return;

    audioManager.playMessageSent();
    setHints([]);
    const playerMsg: ChatMessage = { sender: 'player', text: msgToSend, timestamp: Date.now() };
    const newHistory = [...scam.history, playerMsg];
    
    onUpdateScam({ ...scam, history: newHistory });
    setInput('');
    setProcessing(true);
    setLastThought("ANALYZING RESPONSE VECTORS...");

    try {
        const analysis = await arbitrateChat(
            msgToSend, 
            scam.victim, 
            scam.trust, 
            scam.suspicion, 
            scam.category, 
            activeObjective, 
            allCompleted
        );
        
        setLastThought(analysis.internalThought);

        let newTrust = Math.round(Math.max(0, Math.min(100, scam.trust + analysis.trustDelta)));
        let newSuspicion = Math.round(Math.max(0, Math.min(100, scam.suspicion + analysis.suspicionDelta)));
        
        if (player.skills.includes('silver_tongue') && analysis.suspicionDelta > 0) {
             newSuspicion = Math.round(newSuspicion - (analysis.suspicionDelta * 0.2));
        }
        if (player.skills.includes('empathy_mirror') && analysis.trustDelta > 0) {
             newTrust = Math.round(newTrust + (analysis.trustDelta * 0.25));
        }

        let updatedObjectives = [...scam.objectives];
        let isObjectiveComplete = analysis.objectiveComplete;

        // Check if Arbiter triggered completion
        if (isObjectiveComplete) {
            audioManager.playSuccess(); 
            const objIndex = updatedObjectives.findIndex(o => o.id === activeObjective.id);
            if (objIndex !== -1) {
                updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
            }
        }

        let updatedScam = {
            ...scam,
            history: newHistory,
            trust: newTrust,
            suspicion: newSuspicion,
            objectives: updatedObjectives
        };
        onUpdateScam(updatedScam);

        if (analysis.scamStatus === 'police_called' || newSuspicion >= 100) {
            onScamEnd('police');
            return;
        }
        if (analysis.scamStatus === 'success') {
            onScamEnd('success');
            return;
        }

        // Get Victim Response
        // Pass the updated objective list to determine the "Active" one for the victim prompt
        const nextActiveObjective = updatedObjectives.find(o => !o.isCompleted) || updatedObjectives[updatedObjectives.length - 1];
        const replyData = await getVictimResponse(newHistory, scam.victim, scam.category, nextActiveObjective);
        
        audioManager.playMessageReceived();

        // Check if Victim triggered completion (Self-report)
        if (replyData.objectiveComplete && !isObjectiveComplete) {
             audioManager.playSuccess();
             const objIndex = updatedObjectives.findIndex(o => o.id === nextActiveObjective.id);
             if (objIndex !== -1) {
                updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
                // Update scam state with new objective completion
                updatedScam = {
                    ...updatedScam,
                    objectives: updatedObjectives
                };
             }
        }

        onUpdateScam({
            ...updatedScam,
            history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }]
        });

    } catch (error) {
        console.error(error);
    } finally {
        setProcessing(false);
    }
  };

  const requestHints = async () => {
      if (scam.trust < 20) return;
      audioManager.playClick();
      onUpdateScam({ ...scam, trust: Math.max(0, scam.trust - 20) });
      setLoadingHints(true);
      try {
          const suggestions = await generateScamHint(scam.history, activeObjective.description, scam.victim);
          setHints(suggestions);
      } catch (e) { console.error(e); } finally { setLoadingHints(false); }
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 h-full gap-4 md:gap-6 p-2 md:p-6 bg-black overflow-hidden relative">
       {/* Mobile Header - Collapsible Stats (Visible only on Mobile) */}
       <div className="md:hidden z-20 bg-zinc-950 border border-zinc-800 rounded-xl p-3 shrink-0 relative">
          <div className="flex items-center justify-between" onClick={() => setMobileStatsExpanded(!mobileStatsExpanded)}>
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-green-500/50">
                       <img src={scam.victim.avatarUrl} alt="Target" className="w-full h-full object-cover" />
                  </div>
                  <div>
                      <h2 className="text-sm font-bold text-white font-mono">{scam.victim.name}</h2>
                      <div className="flex gap-2">
                          <div className="w-16 h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
                              <div className="h-full bg-green-500" style={{width: `${Math.round(scam.trust)}%`}}></div>
                          </div>
                          <div className="w-16 h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
                              <div className="h-full bg-red-500" style={{width: `${Math.round(scam.suspicion)}%`}}></div>
                          </div>
                      </div>
                  </div>
              </div>
              {mobileStatsExpanded ? <ChevronUp size={16} className="text-zinc-500"/> : <ChevronDown size={16} className="text-zinc-500"/>}
          </div>
          <AnimatePresence>
            {mobileStatsExpanded && (
                 <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pt-3 border-t border-zinc-800 mt-2 space-y-2"
                >
                     <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400">
                        <div><span className="block text-[10px] uppercase text-zinc-600">Trust</span><span className="text-green-400">{Math.round(scam.trust)}%</span></div>
                        <div><span className="block text-[10px] uppercase text-zinc-600">Suspicion</span><span className="text-red-400">{Math.round(scam.suspicion)}%</span></div>
                        <div><span className="block text-[10px] uppercase text-zinc-600">Active Obj</span><span className="text-blue-400">{activeObjective.description}</span></div>
                    </div>
                 </motion.div>
            )}
          </AnimatePresence>
      </div>

       {/* ... LEFT COL ... */}
       <div className="hidden md:flex flex-col gap-4 h-full relative z-10 col-span-1">
           {/* Profile Card & Meters same as before */}
           <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-6 flex flex-col items-center text-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0">
             <div className="relative w-32 h-32 mb-4 mt-2 group">
                <div className="absolute inset-0 rounded-full border border-dashed border-green-500/40 animate-spin-slow"></div>
                <img src={scam.victim.avatarUrl} alt="Target" className="w-full h-full rounded-full object-cover border-4 border-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-2 -right-1 bg-black text-green-500 text-[10px] font-bold px-2 py-1 rounded border border-green-900 flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <Wifi size={8} className="animate-pulse" /> LIVE FEED
                </div>
             </div>
             <h2 className="text-xl font-bold text-white font-mono truncate w-full tracking-tight mb-1">{scam.victim.name}</h2>
             <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-4">{scam.victim.age} Y/O // {scam.victim.occupation}</p>
             <div>
                 <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${scam.victim.difficulty === 'easy' ? 'bg-green-900/30 text-green-400 border border-green-900' : scam.victim.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
                     {scam.victim.difficulty} TARGET
                 </span>
             </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-6 shadow-xl flex-1 space-y-6 backdrop-blur-sm relative overflow-hidden flex flex-col">
            <div className="space-y-2 relative">
                <div className="flex justify-between text-xs font-mono">
                    <span className="text-green-500 font-bold tracking-widest flex items-center gap-2"><Lock size={12}/> TRUST_LEVEL</span>
                    <span className="text-white font-bold">{Math.round(scam.trust)}%</span>
                </div>
                <div className="h-3 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex gap-0.5">
                    {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className={`flex-1 transition-all duration-300 ${i < (scam.trust / 5) ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-zinc-900'}`}></div>
                    ))}
                </div>
            </div>

            <div className="space-y-2 relative">
                <div className="flex justify-between text-xs font-mono">
                    <span className="text-red-500 font-bold tracking-widest flex items-center gap-2"><AlertTriangle size={12}/> SUSPICION</span>
                    <span className="text-white font-bold">{Math.round(scam.suspicion)}%</span>
                </div>
                <div className="h-3 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex gap-0.5">
                     {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className={`flex-1 transition-all duration-300 ${i < (scam.suspicion / 5) ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-zinc-900'}`}></div>
                    ))}
                </div>
            </div>
            
             <div className="mt-4 pt-4 border-t border-zinc-800 flex-1 flex flex-col min-h-0">
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Target size={12} className="text-blue-500" /> Execution Steps
                </h4>
                <div className="space-y-3 overflow-y-auto custom-scrollbar">
                    {scam.objectives.map((obj, idx) => {
                        const isActive = !obj.isCompleted && (idx === 0 || scam.objectives[idx - 1].isCompleted);
                        const isLocked = !obj.isCompleted && !isActive;
                        return (
                            <div key={obj.id} className={`p-2 rounded border flex items-start gap-3 text-xs font-mono transition-all ${obj.isCompleted ? 'bg-green-900/20 border-green-500/30 text-green-400' : isActive ? 'bg-blue-900/20 border-blue-500/50 text-white shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                                <div className="mt-0.5 shrink-0">{obj.isCompleted ? <CheckCircle2 size={14}/> : isLocked ? <Lock size={14}/> : <Circle size={14} className="animate-pulse text-blue-400"/>}</div>
                                <div className="flex-1">
                                    <p className={`font-bold mb-0.5 ${isActive ? 'text-blue-400' : ''}`}>STEP 0{obj.order}: {obj.isFinal ? 'PAYLOAD' : 'INTEL'}</p>
                                    <p className={isLocked ? 'opacity-50' : ''}>{obj.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
       </div>

       {/* ... MIDDLE COL (CHAT) ... */}
       <div className="flex-1 md:col-span-1 flex flex-col bg-zinc-950 border border-zinc-800/60 rounded-xl overflow-hidden relative shadow-2xl h-full z-10">
         <div className="h-auto min-h-14 bg-black/60 backdrop-blur border-b border-zinc-800 flex flex-col px-3 md:px-6 py-2 md:py-3 shrink-0 justify-center">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
                    <div className="text-xs md:text-sm font-mono font-bold text-white tracking-widest">SECURE_CHANNEL_V2</div>
                </div>
                 <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => setShowAbortConfirm(true)} className="text-[10px] font-bold font-mono flex items-center gap-2 px-2 py-1.5 rounded border border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40 hover:border-red-500 transition-all"><Power size={12} /> <span className="hidden md:inline">DISCONNECT</span></button>
                </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded px-2 py-1.5 md:px-3 md:py-2 flex items-center gap-2 md:gap-3 animate-pulse">
                <Target size={12} className="text-blue-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                    <span className="text-[9px] text-blue-300 font-mono font-bold tracking-wider uppercase whitespace-nowrap">CURRENT TASK:</span>
                    <span className="text-[10px] text-white font-mono truncate">{activeObjective.description}</span>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 to-black custom-scrollbar min-h-0 relative">
             {/* Chat Messages */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
             {scam.history.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: msg.sender === 'player' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex relative z-10 ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'victim' && <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-2 md:mr-3 border border-zinc-600 shadow-lg flex-shrink-0 self-end mb-1"><img src={scam.victim.avatarUrl} alt="avatar" className="w-full h-full object-cover" /></div>}
                    <div className={`max-w-[90%] p-3 rounded-xl text-xs md:text-sm leading-relaxed shadow-lg backdrop-blur-md border ${msg.sender === 'player' ? 'bg-green-900/10 border-green-500/30 text-green-50 rounded-br-none' : 'bg-zinc-800/60 border-zinc-600/30 text-zinc-200 rounded-bl-none'}`}><p>{msg.text}</p></div>
                </motion.div>
             ))}
             <AnimatePresence>
                {hints.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col gap-2 items-end mb-2 relative z-20">
                        <span className="text-[9px] md:text-[10px] text-blue-400 font-mono uppercase tracking-wider bg-black/80 px-2 rounded">Suggested Response Vectors</span>
                        <div className="flex flex-wrap gap-2 justify-end max-w-2xl">
                            {hints.map((hint, idx) => <button key={idx} onClick={() => handleSend(hint)} className="text-[10px] md:text-xs bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 text-blue-200 px-2 py-1 md:px-3 md:py-2 rounded-lg text-left hover:border-blue-500 transition-colors">"{hint}"</button>)}
                        </div>
                    </motion.div>
                )}
                {processing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start items-center gap-2 relative z-10">
                         <div className="bg-zinc-900/50 border border-zinc-700/50 px-3 py-2 md:px-4 md:py-3 rounded-xl rounded-bl-none flex gap-1.5 items-center">
                             <span className="text-[10px] md:text-xs text-zinc-500 font-mono animate-pulse">TYPING</span>
                            <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-75"></div><div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-2 md:p-3 bg-black/80 backdrop-blur border-t border-zinc-800 shrink-0 relative z-20">
             <div className="flex gap-2">
                 <div className="relative flex gap-2">
                    <button onClick={requestHints} disabled={loadingHints || processing || scam.trust < 20} className={`p-3 rounded-lg border bg-black border-zinc-700 text-zinc-400 transition-all relative group ${scam.trust >= 20 ? 'hover:text-blue-400 hover:border-blue-500' : 'opacity-30 cursor-not-allowed'}`}>
                         {loadingHints ? <Loader2 size={18} className="animate-spin"/> : <Lightbulb size={18}/>}
                    </button>
                    {/* BACKPACK BUTTON */}
                    <button onClick={() => setInventoryOpen(true)} className="p-3 rounded-lg border bg-black border-zinc-700 text-zinc-400 hover:text-purple-400 hover:border-purple-500 transition-all relative group">
                         <Package size={18}/>
                         <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{player.inventory.length}</span>
                    </button>
                 </div>

                 <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => {
                        setInput(e.target.value);
                    }} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                    disabled={processing} 
                    placeholder="Type payload..." 
                    className="flex-1 bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 outline-none transition-all font-mono text-xs"
                 />
                 <button onClick={() => handleSend()} disabled={processing || !input.trim()} className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-zinc-800 text-black font-bold px-4 rounded-lg transition-all flex items-center justify-center"><Send size={18} /></button>
             </div>
        </div>
       </div>

       {/* ... RIGHT COL (INTEL/ARBITER) ... */}
       <div className="hidden md:flex flex-col gap-4 h-full relative z-10 col-span-1">
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl flex flex-col shadow-xl min-h-0 overflow-hidden backdrop-blur-sm shrink-0 max-h-[30%]">
             <button onClick={() => setIntelExpanded(!intelExpanded)} className="p-3 border-b border-zinc-800 bg-black/40 flex justify-between items-center hover:bg-zinc-900/50 transition-colors">
                <p className="text-green-600 uppercase font-bold text-[10px] flex items-center gap-2 tracking-widest"><Terminal size={12}/> TARGET_INTEL</p>
                {intelExpanded ? <ChevronDown size={12} className="text-zinc-500"/> : <ChevronUp size={12} className="text-zinc-500"/>}
             </button>
             {intelExpanded && (
                 <div className="overflow-y-auto p-3 custom-scrollbar space-y-3 text-xs font-mono">
                     <div className="bg-zinc-900/50 p-2 rounded border-l-2 border-zinc-700"><p className="text-zinc-500 text-[10px] uppercase">Strategy</p><p className="text-zinc-300">{scam.category}</p></div>
                     {(player.skills.includes('doxxing_suite') || player.skills.includes('social_scraper') || scam.revealedFacts.length > 0) && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
                            {player.skills.includes('doxxing_suite') && <div className="bg-green-900/10 p-2 rounded border-l-2 border-green-600"><p className="text-green-500 text-[10px] uppercase font-bold">LEAK DETECTED</p><p className="text-zinc-300">{scam.victim.hiddenFact}</p></div>}
                            {player.skills.includes('social_scraper') && <div className="bg-red-900/10 p-2 rounded border-l-2 border-red-600"><p className="text-red-500 text-[10px] uppercase font-bold">PSYCH VULNERABILITY</p><p className="text-zinc-300">{scam.victim.weakness}</p></div>}
                            {scam.revealedFacts.map((fact, idx) => <div key={idx} className="bg-blue-900/10 p-2 rounded border-l-2 border-blue-600"><p className="text-blue-500 text-[10px] uppercase font-bold">NEW INTEL</p><p className="text-zinc-300">{fact}</p></div>)}
                        </div>
                     )}
                 </div>
             )}
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-6 flex-1 flex flex-col relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Radio size={60} className="text-green-500"/></div>
                <p className="text-zinc-500 mb-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2"><Wifi size={12} className={processing ? "animate-pulse text-green-500" : "text-zinc-600"}/> AI_ARBITER_LINK</p>
                <div className="font-mono text-sm relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                    {processing ? (
                        <div className="flex flex-col gap-3 text-yellow-500 h-full justify-center items-center opacity-90"><Loader2 size={32} className="animate-spin"/><span className="tracking-widest font-bold text-xs">ANALYZING PATTERNS...</span></div>
                    ) : (
                        <div className="text-zinc-300 leading-relaxed h-full"><span className="text-green-500 mr-2 text-lg font-bold">&gt;</span>{lastThought || "ESTABLISHED CONNECTION. WAITING FOR INPUT..."}</div>
                    )}
                </div>
            </div>
       </div>

       {/* Overlays */}
       <AnimatePresence>
            {showAbortConfirm && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-red-600 p-6 md:p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden">
                         <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                         <ShieldAlert size={48} className="text-red-500 mx-auto mb-4 animate-pulse"/>
                         <h3 className="text-xl md:text-2xl font-bold text-white font-mono mb-2">TERMINATE CONNECTION?</h3>
                         <p className="text-zinc-400 text-sm mb-6 leading-relaxed">Aborting this operation will flag your IP address. <br/><span className="text-red-500 font-bold">HEAT LEVEL WILL INCREASE.</span></p>
                         <div className="flex gap-4 justify-center">
                             <button onClick={() => setShowAbortConfirm(false)} className="px-4 py-2 md:px-6 md:py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-mono text-xs md:text-sm">CANCEL</button>
                             <button onClick={onAbort} className="px-4 py-2 md:px-6 md:py-3 bg-red-600 hover:bg-red-500 text-black font-bold rounded font-mono text-xs md:text-sm">CONFIRM</button>
                         </div>
                    </div>
                </motion.div>
            )}
             {scam.objectives.every(o => o.isCompleted) && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-green-950/90 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="text-center space-y-4 p-8 md:p-12 border-2 border-green-500 rounded-2xl bg-black shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                        <CheckCircle2 size={60} className="text-green-500 mx-auto animate-bounce"/>
                        <h1 className="text-3xl md:text-5xl font-black text-white font-mono tracking-tighter">PAYLOAD DELIVERED</h1>
                        <p className="text-green-400 font-mono uppercase tracking-widest text-sm md:text-base">Funds Transferred Successfully</p>
                    </div>
                </motion.div>
            )}
             {scam.suspicion >= 100 && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-red-950/90 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="text-center space-y-4 p-8 md:p-12 border-2 border-red-500 rounded-2xl bg-black shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                        <ShieldAlert size={60} className="text-red-500 mx-auto animate-pulse"/>
                        <h1 className="text-3xl md:text-5xl font-black text-white font-mono tracking-tighter">CONNECTION TERMINATED</h1>
                        <p className="text-red-400 font-mono uppercase tracking-widest text-sm md:text-base">Target Alerted Authorities</p>
                    </div>
                </motion.div>
            )}
       </AnimatePresence>
       
        <InventoryModal 
            isOpen={inventoryOpen} 
            onClose={() => setInventoryOpen(false)} 
            inventory={player.inventory} 
            onUseItem={handleUseItem}
            context="scam"
        />
    </div>
  );
};

export default ScamInterface;
