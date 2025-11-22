
import React, { useState, useEffect, useRef } from 'react';
import { ScamState, PlayerState, ChatMessage, ShopItem, HackAbility } from '../types';
import { getVictimResponse, arbitrateChat, generateScamHint } from '../services/geminiService';
import { audioManager } from '../services/audioService';
import { HACK_ABILITIES } from '../constants';
import { Send, Terminal, Wifi, Loader2, Power, ShieldAlert, CheckCircle2, AlertTriangle, Lock, Circle, Package, Target, Lightbulb, ArrowRight, Zap, Fingerprint, Database, Code, MessageSquare, MonitorPlay, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryModal from './InventoryModal';
import HackingTerminalModal from './HackingTerminalModal';

interface Props {
  scam: ScamState;
  player: PlayerState;
  onUpdateScam: (scam: ScamState) => void;
  onScamEnd: (result: 'success' | 'failed' | 'police', reason?: string) => void;
  onAbort: () => void;
  onOpenInventory: () => void;
  onConsumeItem: (item: ShopItem) => ShopItem;
  onAction: (type: 'message_sent') => void; // Hook for App usage counting and Botnet
}

type MobileTab = 'comm' | 'intel' | 'sys';

const ScamInterface: React.FC<Props> = ({ scam, player, onUpdateScam, onScamEnd, onAbort, onOpenInventory, onConsumeItem, onAction }) => {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastThought, setLastThought] = useState<string | null>(null);
  
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [viewSuccessModal, setViewSuccessModal] = useState(false);
  
  // Mobile Tabs
  const [mobileTab, setMobileTab] = useState<MobileTab>('comm');

  // Hacking Terminal
  const [showHackTerminal, setShowHackTerminal] = useState(false);
  const [hackCooldown, setHackCooldown] = useState<string | null>(null);
  
  // Hint System
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [showHintConfirm, setShowHintConfirm] = useState(false);

  // Inventory Modal Local State
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initRef = useRef(false);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (mobileTab === 'comm') {
        scrollToBottom();
    }
  }, [scam.history, processing, hints, mobileTab]);

  // Auto-focus input when processing finishes
  useEffect(() => {
      if (!processing && mobileTab === 'comm') {
          setTimeout(() => {
              inputRef.current?.focus();
          }, 50);
      }
  }, [processing, mobileTab]);

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
                 const replyData = await getVictimResponse(scam.history, scam.victim, scam.category, activeObjective, scam.trust, player.skills);
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
  }, [scam, onUpdateScam, activeObjective, player.skills]);

  // Intercept consumption to handle local state
  const handleUseItem = (item: ShopItem) => {
     onConsumeItem(item); // Remove from inventory globally

     if (item.effect === 'boost_trust_minor') {
         onUpdateScam({ ...scam, trust: Math.min(100, scam.trust + 20) });
         alert("Voice modulator active. Trust boosted.");
     } else if (item.effect === 'boost_trust') {
         onUpdateScam({ ...scam, trust: Math.min(100, scam.trust + 25) });
         alert("Fake ID verified. Trust boosted.");
     } else if (item.effect === 'reset_trust') {
         onUpdateScam({ ...scam, trust: 50 });
         alert("DDoS attack successful. Connection reset (Trust=50).");
     } else if (item.effect === 'force_objective') {
         const updatedObjectives = [...scam.objectives];
         const objIndex = updatedObjectives.findIndex(o => o.id === activeObjective.id);
         if (objIndex !== -1) {
             updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
         }
         onUpdateScam({ 
             ...scam, 
             objectives: updatedObjectives,
             suspicion: Math.min(100, scam.suspicion + 30) // Cost of using ransomware
         });
         alert("Ransomware deployed. Objective forced. Suspicion increased.");
     }
  };

  // Execute Hack
  const executeHack = async (hack: HackAbility) => {
      if (scam.socialCharge < hack.cost || processing) return;

      audioManager.playClick();
      // Deduct cost
      let chargeCost = hack.cost;
      if (player.skills.includes('linguistic_mimicry')) {
          chargeCost = Math.floor(chargeCost * 0.9);
      }
      
      const newCharge = Math.max(0, scam.socialCharge - chargeCost);
      const systemMsgText = `[${hack.name.toUpperCase()}] ${hack.systemMessage}`;
      const newHistory = [...scam.history, { sender: 'system', text: systemMsgText, timestamp: Date.now() } as ChatMessage];
      
      // Handle Mechanical Effects (Unlock Intel)
      const updatedRevealedFacts = [...scam.revealedFacts];
      if (hack.id === 'background_check') { // Quick Dox
          if (!updatedRevealedFacts.includes('secret')) {
              updatedRevealedFacts.push('secret');
          }
      }

      onUpdateScam({
          ...scam,
          socialCharge: newCharge,
          history: newHistory,
          revealedFacts: updatedRevealedFacts
      });

      setHackCooldown(hack.id);
      setTimeout(() => setHackCooldown(null), 3000);
      
      // Auto-switch to comms to see effect
      setMobileTab('comm');

      setProcessing(true);
      try {
          onAction('message_sent');
          const replyData = await getVictimResponse(newHistory, scam.victim, scam.category, activeObjective, scam.trust, player.skills);
          audioManager.playMessageReceived();
          
          if (replyData.policeTriggered) {
               onUpdateScam({
                  ...scam,
                  history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }],
                  revealedFacts: updatedRevealedFacts
              });
              onScamEnd('police', 'Target contacted authorities');
              return;
          }
          if (replyData.callTerminated) {
               onUpdateScam({
                  ...scam,
                  history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }],
                  revealedFacts: updatedRevealedFacts
              });
              onScamEnd('failed', 'Target disconnected call');
              return;
          }

          onUpdateScam({
              ...scam,
              socialCharge: newCharge,
              history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() } as ChatMessage],
              revealedFacts: updatedRevealedFacts
          });
      } catch (e) {
          console.error(e);
      } finally {
          setProcessing(false);
      }
  };

  const handleSend = async (textOverride?: string) => {
    const msgToSend = textOverride || input;
    if (!msgToSend.trim() || processing) return;

    audioManager.playMessageSent();
    setHints([]);
    onAction('message_sent');
    const playerMsg: ChatMessage = { sender: 'player', text: msgToSend, timestamp: Date.now() };
    const newHistory = [...scam.history, playerMsg];
    
    onUpdateScam({ ...scam, history: newHistory });
    setInput('');
    setProcessing(true);
    setLastThought("ANALYZING NEURAL PATTERNS...");

    try {
        const analysis = await arbitrateChat(
            msgToSend, 
            scam.victim, 
            scam.trust,
            scam.suspicion, 
            scam.category, 
            activeObjective, 
            allCompleted,
            newHistory,
            player.skills
        );
        
        setLastThought(analysis.internalThought);

        let trustDelta = analysis.trustDelta;
        if (trustDelta > 0) trustDelta = Math.ceil(trustDelta * 0.5);
        if (player.skills.includes('silver_tongue') && trustDelta < 0) trustDelta = Math.round(trustDelta * 0.8); 
        if (player.skills.includes('empathy_mirror') && trustDelta > 0) trustDelta = Math.round(trustDelta * 1.25); 

        let suspicionDelta = Math.max(0, analysis.suspicionDelta);
        if (suspicionDelta > 0) trustDelta -= suspicionDelta;

        const newTrust = Math.max(0, Math.min(100, scam.trust + trustDelta));
        const newSuspicion = Math.min(100, scam.suspicion + suspicionDelta);

        let chargeGain = analysis.creativityScore * 3;
        if (player.skills.includes('empathy_mirror')) chargeGain = Math.floor(chargeGain * 1.25);
        const newCharge = Math.min(100, scam.socialCharge + chargeGain);

        let updatedObjectives = [...scam.objectives];
        let isObjectiveComplete = analysis.objectiveComplete;

        // Check for Scam Success logic
        if (analysis.scamStatus === 'success') {
            const objIndex = updatedObjectives.findIndex(o => o.id === activeObjective.id);
            if (objIndex !== -1) updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
            isObjectiveComplete = true;
        } else if (isObjectiveComplete) {
            audioManager.playSuccess(); 
            const objIndex = updatedObjectives.findIndex(o => o.id === activeObjective.id);
            if (objIndex !== -1) updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
        }

        let updatedScam = {
            ...scam,
            history: newHistory,
            trust: newTrust,
            suspicion: newSuspicion,
            socialCharge: newCharge,
            objectives: updatedObjectives
        };
        onUpdateScam(updatedScam);

        if (analysis.scamStatus === 'police_called' || newSuspicion >= 100) {
            onScamEnd('police', newSuspicion >= 100 ? 'Suspicion threshold breached' : 'Target alerted authorities');
            return;
        }

        // IMMEDIATE SUCCESS CHECK - DO NOT WAIT FOR VICTIM RESPONSE
        const isAllDone = updatedObjectives.every(o => o.isCompleted);
        if (isAllDone) {
            audioManager.playSuccess();
            setViewSuccessModal(true);
            setProcessing(false);
            return;
        }
        
        const nextActiveObjective = updatedObjectives.find(o => !o.isCompleted) || updatedObjectives[updatedObjectives.length - 1];
        const replyData = await getVictimResponse(newHistory, scam.victim, scam.category, nextActiveObjective, newTrust, player.skills);
        audioManager.playMessageReceived();

        if (replyData.policeTriggered) {
              onUpdateScam({
                  ...updatedScam,
                  history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }]
              });
              onScamEnd('police', 'Target contacted authorities');
              return;
        }
        if (replyData.callTerminated) {
             onUpdateScam({
                  ...updatedScam,
                  history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }]
              });
              onScamEnd('failed', 'Target disconnected call');
              return;
        }

        if (replyData.objectiveComplete && !isObjectiveComplete) {
             audioManager.playSuccess();
             const objIndex = updatedObjectives.findIndex(o => o.id === nextActiveObjective.id);
             if (objIndex !== -1) {
                updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
                updatedScam = { ...updatedScam, objectives: updatedObjectives };
                setLastThought(`TARGET YIELDED DATA. "${nextActiveObjective.description.toUpperCase()}" VERIFIED.`);
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

  const requestHint = () => {
      if (scam.trust < 20) return;
      setShowHintConfirm(true);
  };

  const executeHint = async () => {
      setShowHintConfirm(false);
      audioManager.playClick();
      onUpdateScam({ ...scam, trust: Math.max(0, scam.trust - 10) });
      setLoadingHints(true);
      try {
          onAction('message_sent');
          const suggestions = await generateScamHint(scam.history, activeObjective.description, scam.victim);
          setHints(suggestions);
      } catch (e) { console.error(e); } finally { setLoadingHints(false); }
  };

  const hasDoxxing = player.skills.includes('doxxing_suite');
  const hasScraper = player.skills.includes('social_scraper');
  const secretRevealed = hasDoxxing || scam.revealedFacts.includes('secret');

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden relative">
       
       {/* MOBILE TAB NAVIGATION (Top) */}
       <div className="md:hidden flex shrink-0 border-b border-zinc-800 bg-zinc-950">
           <button 
                onClick={() => setMobileTab('comm')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'comm' ? 'bg-zinc-900 text-white border-b-2 border-green-500' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
           >
               <MessageSquare size={14} /> COMM
           </button>
           <button 
                onClick={() => setMobileTab('intel')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'intel' ? 'bg-zinc-900 text-white border-b-2 border-green-500' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
           >
               <MonitorPlay size={14} /> INTEL
           </button>
           <button 
                onClick={() => setMobileTab('sys')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'sys' ? 'bg-zinc-900 text-white border-b-2 border-green-500' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
           >
               <Activity size={14} /> SYS
           </button>
       </div>

       <div className="flex-1 flex md:grid md:grid-cols-3 gap-4 md:gap-6 p-2 md:p-6 min-h-0 relative">
       
           {/* ... LEFT COL (INTEL / METERS) ... */}
           <div className={`${mobileTab === 'intel' ? 'flex' : 'hidden'} md:flex flex-col gap-4 h-full relative z-10 col-span-1 overflow-y-auto custom-scrollbar pr-1`}>
               {/* Profile Card */}
               <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 md:p-6 flex flex-col items-center text-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0">
                 <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 mb-3 mt-1 group">
                    <div className="absolute inset-0 rounded-full border border-dashed border-green-500/40 animate-spin-slow"></div>
                    <img src={scam.victim.avatarUrl} alt="Target" className="w-full h-full rounded-full object-cover border-4 border-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-1 -right-1 bg-black text-green-500 text-[9px] font-bold px-2 py-0.5 rounded border border-green-900 flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <Wifi size={8} className="animate-pulse" /> LIVE
                    </div>
                 </div>
                 <h2 className="text-base md:text-lg font-bold text-white font-mono truncate w-full tracking-tight mb-0.5">{scam.victim.name}</h2>
                 <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">{scam.victim.age} Y/O // {scam.victim.occupation}</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 md:p-5 shadow-xl space-y-5 backdrop-blur-sm relative flex flex-col shrink-0">
                {/* METERS */}
                <div className="space-y-4 shrink-0">
                    <div>
                        <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-1">
                            <span className="text-green-500 font-bold flex items-center gap-2"><CheckCircle2 size={12}/> TRUST</span>
                            <span className="text-white font-mono">{scam.trust}%</span>
                        </div>
                        <div className="h-2 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden shadow-inner relative">
                             <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-900 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-700 ease-out"
                                style={{ width: `${scam.trust}%` }}
                             ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-1">
                            <span className="text-red-500 font-bold flex items-center gap-2"><AlertTriangle size={12}/> SUSPICION</span>
                            <span className="text-white font-mono">{scam.suspicion}%</span>
                        </div>
                        <div className="h-2 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden shadow-inner relative">
                             <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-700 ease-out"
                                style={{ width: `${scam.suspicion}%` }}
                             ></div>
                        </div>
                    </div>
                </div>
                
                {/* HACKING POWER METER */}
                 <div className="w-full bg-zinc-900/50 rounded-lg border border-blue-900/30 p-2">
                     <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest flex items-center gap-1"><Zap size={10}/> HACKING POWER</span>
                          <span className="text-white font-mono text-xs font-bold">{scam.socialCharge}%</span>
                     </div>
                     <div className="w-full h-2 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden mb-1">
                         <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" style={{width: `${scam.socialCharge}%`}}></div>
                     </div>
                 </div>

                 <div className="border-t border-zinc-800 pt-4 flex-1 flex flex-col min-h-0">
                    <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Target size={12} className="text-blue-500" /> Execution Steps
                    </h4>
                    <div className="space-y-2">
                        {scam.objectives.map((obj, idx) => {
                            const isActive = !obj.isCompleted && (idx === 0 || scam.objectives[idx - 1].isCompleted);
                            const isLocked = !obj.isCompleted && !isActive;
                            return (
                                <div key={obj.id} className={`p-2 rounded border flex items-start gap-2 text-[10px] font-mono transition-all ${obj.isCompleted ? 'bg-green-900/20 border-green-500/30 text-green-400' : isActive ? 'bg-blue-900/20 border-blue-500/50 text-white shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                                    <div className="mt-0.5 shrink-0">{obj.isCompleted ? <CheckCircle2 size={12}/> : isLocked ? <Lock size={12}/> : <Circle size={12} className="animate-pulse text-blue-400"/>}</div>
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
           <div className={`${mobileTab === 'comm' ? 'flex' : 'hidden'} md:flex flex-1 md:col-span-1 flex-col bg-zinc-950 border border-zinc-800/60 rounded-xl overflow-hidden relative shadow-2xl h-full z-10`}>
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
                        
                        {msg.sender === 'system' ? (
                             <div className="max-w-[90%] p-2 rounded border bg-yellow-900/20 border-yellow-500/30 text-yellow-200 font-mono text-xs tracking-tight flex items-center gap-2">
                                 <Zap size={12} className="text-yellow-500 animate-pulse shrink-0"/>
                                 {msg.text}
                             </div>
                        ) : (
                            <div className={`max-w-[90%] p-3 rounded-xl text-xs md:text-sm leading-relaxed shadow-lg backdrop-blur-md border ${msg.sender === 'player' ? 'bg-green-900/10 border-green-500/30 text-green-50 rounded-br-none' : 'bg-zinc-800/60 border-zinc-600/30 text-zinc-200 rounded-bl-none'}`}><p>{msg.text}</p></div>
                        )}
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
                        <button onClick={requestHint} disabled={loadingHints || processing || scam.trust < 20} className={`p-3 rounded-lg border bg-black border-zinc-700 text-zinc-400 transition-all relative group ${scam.trust >= 20 ? 'hover:text-blue-400 hover:border-blue-500' : 'opacity-30 cursor-not-allowed'}`}>
                             {loadingHints ? <Loader2 size={18} className="animate-spin"/> : <Lightbulb size={18}/>}
                        </button>
                        <button onClick={() => setInventoryOpen(true)} className="p-3 rounded-lg border bg-black border-zinc-700 text-zinc-400 hover:text-purple-400 hover:border-purple-500 transition-all relative group">
                             <Package size={18}/>
                             <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{player.inventory.length}</span>
                        </button>
                     </div>

                     {allCompleted ? (
                         <button 
                            onClick={() => setViewSuccessModal(true)}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg p-3 flex items-center justify-center gap-2 animate-pulse"
                         >
                             <CheckCircle2 size={20} /> MISSION COMPLETE - SECURE FUNDS
                         </button>
                     ) : (
                        <>
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={input} 
                                // Only autoFocus on desktop to prevent mobile keyboard flicker on tab switch
                                autoFocus={window.innerWidth > 768}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                }} 
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                                disabled={processing} 
                                placeholder="Type payload..." 
                                className="flex-1 bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 outline-none transition-all font-mono text-xs"
                            />
                            <button onClick={() => handleSend()} disabled={processing || !input.trim()} className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-zinc-800 text-black font-bold px-4 rounded-lg transition-all flex items-center justify-center"><Send size={18} /></button>
                        </>
                     )}
                 </div>
            </div>
           </div>

           {/* ... RIGHT COL (SYSTEM / LOGS) ... */}
           <div className={`${mobileTab === 'sys' ? 'flex' : 'hidden'} md:flex flex-col gap-4 h-full relative z-10 col-span-1 overflow-y-auto custom-scrollbar pr-1`}>
               
               {/* TARGET ANALYSIS */}
               <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-3 shrink-0 space-y-3">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center justify-between">
                        <span>Target Analysis</span>
                        <div className="flex gap-1">
                            {/* Move Psych Profile to top right properly if needed, currently below is fine */}
                        </div>
                    </h3>
                    
                    <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800/50 flex flex-col gap-1">
                        <h4 className="text-zinc-400 text-[10px] font-bold uppercase flex items-center gap-2 tracking-wider">
                            <Fingerprint size={12} className="text-purple-400"/> Psych Profile
                        </h4>
                        <p className="text-zinc-300 text-xs leading-relaxed font-mono">{scam.victim.personality}</p>
                    </div>

                    <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800/50 flex flex-col gap-1">
                        <h4 className="text-zinc-400 text-[10px] font-bold uppercase flex items-center gap-2 tracking-wider">
                            <Database size={12} className="text-orange-400"/> Intel
                        </h4>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500">SECRET:</span>
                            <span className={`font-mono ${secretRevealed ? 'text-green-400' : 'text-red-900'}`}>{secretRevealed ? scam.victim.hiddenFact : 'ENCRYPTED'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500">WEAKNESS:</span>
                            <span className={`font-mono ${hasScraper ? 'text-green-400' : 'text-red-900'}`}>{hasScraper ? scam.victim.weakness : 'ENCRYPTED'}</span>
                        </div>
                    </div>
               </div>

               {/* TERMINAL LOG */}
               <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl flex flex-col relative overflow-hidden shadow-xl flex-1 min-h-[12rem]">
                    <div className="p-2 border-b border-zinc-800 bg-black/40 flex justify-between items-center">
                        <p className="text-green-600 uppercase font-bold text-[10px] flex items-center gap-2 tracking-widest"><Terminal size={12} className="text-green-500" /> SYS_LOG</p>
                        <div className="flex items-center gap-2">
                            <Wifi size={12} className={processing ? "animate-pulse text-green-500" : "text-zinc-600"}/>
                        </div>
                    </div>
                    <div className="flex-1 p-2 font-mono text-[10px] overflow-y-auto custom-scrollbar flex flex-col">
                         <div className="flex flex-col justify-start gap-2">
                            <div className="text-zinc-500">&gt;&gt; CONNECTION ESTABLISHED</div>
                             {lastThought && (
                                <div className="text-green-400 typing-effect leading-tight">
                                    <span className="text-zinc-500 mr-2">&gt;&gt;</span>{lastThought}
                                </div>
                            )}
                         </div>
                         {processing && (
                            <div className="flex flex-col gap-1 text-green-500/50 justify-start mt-2">
                                 <div className="animate-pulse">&gt;&gt; ANALYZING INPUT VECTOR...</div>
                                 <div className="animate-pulse delay-75">&gt;&gt; CALCULATING PROBABILITY...</div>
                            </div>
                        )}
                    </div>
               </div>

               {/* HACKING TERMINAL BUTTON */}
               <button 
                    onClick={() => setShowHackTerminal(true)}
                    className="w-full py-4 bg-zinc-900 hover:bg-blue-900/20 border border-zinc-700 hover:border-blue-500 rounded-xl text-zinc-400 hover:text-blue-400 transition-all font-bold font-mono text-xs flex items-center justify-center gap-2 group shadow-lg shrink-0"
               >
                   <Code size={16} /> INITIALIZE HACKING CONSOLE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
               </button>
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
            
             {showHintConfirm && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-blue-600 p-6 md:p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(37,99,235,0.3)] relative overflow-hidden">
                         <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
                         <Lightbulb size={48} className="text-blue-500 mx-auto mb-4 animate-pulse"/>
                         <h3 className="text-xl md:text-2xl font-bold text-white font-mono mb-2">REQUEST AI ASSISTANCE?</h3>
                         <p className="text-zinc-400 text-sm mb-6 leading-relaxed">Analyzing potential response vectors consumes processing power. <br/><span className="text-red-500 font-bold">COST: 10 TRUST POINTS.</span></p>
                         <div className="flex gap-4 justify-center">
                             <button onClick={() => setShowHintConfirm(false)} className="px-4 py-2 md:px-6 md:py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-mono text-xs md:text-sm">CANCEL</button>
                             <button onClick={executeHint} className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-500 text-black font-bold rounded font-mono text-xs md:text-sm">PROCEED</button>
                         </div>
                    </div>
                </motion.div>
            )}

             {viewSuccessModal && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-green-950/90 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="text-center space-y-6 p-8 md:p-12 border-2 border-green-500 rounded-2xl bg-black shadow-[0_0_50px_rgba(34,197,94,0.5)] max-w-lg w-full">
                        <CheckCircle2 size={60} className="text-green-500 mx-auto animate-bounce"/>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white font-mono tracking-tighter mb-2">PAYLOAD DELIVERED</h1>
                            <p className="text-green-400 font-mono uppercase tracking-widest text-sm md:text-base">Funds Transferred Successfully</p>
                        </div>
                        <button 
                            onClick={() => {
                                if (isExiting) return;
                                setIsExiting(true);
                                onScamEnd('success');
                            }}
                            disabled={isExiting}
                            className={`w-full py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all font-mono text-lg flex items-center justify-center gap-2 ${isExiting ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-black font-bold hover:scale-[1.02]'}`}
                        >
                             {isExiting ? 'SECURING FUNDS...' : 'SECURE FUNDS & EXIT'} <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
             {scam.suspicion >= 100 && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-red-950/90 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="text-center space-y-6 p-8 md:p-12 border-2 border-red-500 rounded-2xl bg-black shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-lg w-full">
                        <ShieldAlert size={60} className="text-red-500 mx-auto animate-pulse"/>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white font-mono tracking-tighter mb-2">CONNECTION TERMINATED</h1>
                            <p className="text-red-400 font-mono uppercase tracking-widest text-sm md:text-base">Target Alerted Authorities</p>
                        </div>
                        <button 
                            onClick={() => {
                                if (isExiting) return;
                                setIsExiting(true);
                                onScamEnd('police', 'Suspicion Threshold Exceeded');
                            }}
                            disabled={isExiting}
                            className={`w-full py-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all font-mono text-lg flex items-center justify-center gap-2 ${isExiting ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white font-bold hover:scale-[1.02]'}`}
                        >
                             {isExiting ? 'DISCONNECTING...' : 'EMERGENCY DISCONNECT'} <Power size={20} />
                        </button>
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

        <HackingTerminalModal 
            isOpen={showHackTerminal}
            onClose={() => setShowHackTerminal(false)}
            abilities={HACK_ABILITIES}
            socialCharge={scam.socialCharge}
            onExecute={executeHack}
            cooldowns={hackCooldown}
            processing={processing}
        />
    </div>
  );
};

export default ScamInterface;
