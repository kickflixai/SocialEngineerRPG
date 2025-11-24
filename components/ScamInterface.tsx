
import React, { useState, useEffect, useRef } from 'react';
import { ScamState, PlayerState, ChatMessage, ShopItem, HackAbility } from '../types';
import { getVictimResponse, arbitrateChat, generateScamHint } from '../services/geminiService';
import { audioManager } from '../services/audioService';
import { HACK_ABILITIES } from '../constants';
import { MessageSquare, MonitorPlay, Activity, ShieldAlert, CheckCircle2, Power, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryModal from './InventoryModal';
import HackingTerminalModal from './HackingTerminalModal';
import ScamStatus from './ScamStatus';
import ScamChat from './ScamChat';
import ScamSystemLog from './ScamSystemLog';

interface Props {
  scam: ScamState;
  player: PlayerState;
  onUpdateScam: (scam: ScamState) => void;
  onScamEnd: (result: 'success' | 'failed' | 'police', reason?: string) => void;
  onAbort: () => void;
  onOpenInventory: () => void;
  onConsumeItem: (item: ShopItem) => ShopItem;
  onAction: (type: 'message_sent') => void; 
}

type MobileTab = 'comm' | 'intel' | 'sys';

const ScamInterface: React.FC<Props> = ({ scam, player, onUpdateScam, onScamEnd, onAbort, onOpenInventory, onConsumeItem, onAction }) => {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastThought, setLastThought] = useState<string | null>(null);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [viewSuccessModal, setViewSuccessModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('comm');
  const [showHackTerminal, setShowHackTerminal] = useState(false);
  const [hackCooldown, setHackCooldown] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const initRef = useRef(false);

  useEffect(() => {
      audioManager.startHackingTheme();
      return () => { audioManager.stopHackingTheme(); };
  }, []);

  const activeObjective = scam.objectives.find(o => !o.isCompleted) || scam.objectives[scam.objectives.length - 1];
  const allCompleted = scam.objectives.every(o => o.isCompleted);

  useEffect(() => {
     if (!initRef.current && scam.history.length === 1 && scam.history[0].sender === 'player') {
         initRef.current = true;
         const fetchFirstReply = async () => {
             setProcessing(true);
             try {
                 const replyData = await getVictimResponse(scam.history, scam.victim, scam.category, activeObjective, scam.trust, player.skills);
                 audioManager.playMessageReceived();
                 const newHistory = [...scam.history, { sender: 'victim', text: replyData.text, timestamp: Date.now() } as ChatMessage];
                 onUpdateScam({ ...scam, history: newHistory });
             } catch(e) { console.error(e); }
             setProcessing(false);
         };
         fetchFirstReply();
     }
  }, [scam, onUpdateScam, activeObjective, player.skills]);

  const handleUseItem = (item: ShopItem) => {
     onConsumeItem(item); 
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
         onUpdateScam({ ...scam, objectives: updatedObjectives, suspicion: Math.min(100, scam.suspicion + 30) });
         alert("Ransomware deployed. Objective forced. Suspicion increased.");
     }
  };

  const executeHack = async (hack: HackAbility) => {
      if (scam.socialCharge < hack.cost || processing) return;
      audioManager.playClick();
      
      // Tech Tier 1: Script Optimization (Reduces cost)
      const tech1Level = player.skills['tech_1'] || 0;
      let chargeCost = hack.cost;
      if (tech1Level > 0) {
          chargeCost = Math.floor(chargeCost * (1 - (tech1Level * 0.05))); // 5% reduction per level
      }
      
      const newCharge = Math.max(0, scam.socialCharge - chargeCost);
      const systemMsgText = `[${hack.name.toUpperCase()}] ${hack.systemMessage}`;
      const newHistory = [...scam.history, { sender: 'system', text: systemMsgText, timestamp: Date.now() } as ChatMessage];
      
      const updatedRevealedFacts = [...scam.revealedFacts];
      if (hack.id === 'background_check') { 
          if (!updatedRevealedFacts.includes('secret')) updatedRevealedFacts.push('secret');
      }

      onUpdateScam({ ...scam, socialCharge: newCharge, history: newHistory, revealedFacts: updatedRevealedFacts });
      setHackCooldown(hack.id);
      setTimeout(() => setHackCooldown(null), 3000);
      setMobileTab('comm');
      setProcessing(true);
      try {
          onAction('message_sent');
          const replyData = await getVictimResponse(newHistory, scam.victim, scam.category, activeObjective, scam.trust, player.skills);
          audioManager.playMessageReceived();
          
          if (replyData.policeTriggered) {
               onUpdateScam({ ...scam, history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }], revealedFacts: updatedRevealedFacts });
              onScamEnd('police', 'Target contacted authorities');
              return;
          }
          if (replyData.callTerminated) {
               onUpdateScam({ ...scam, history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }], revealedFacts: updatedRevealedFacts });
              onScamEnd('failed', 'Target disconnected call');
              return;
          }
          onUpdateScam({ ...scam, socialCharge: newCharge, history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() } as ChatMessage], revealedFacts: updatedRevealedFacts });
      } catch (e) { console.error(e); } finally { setProcessing(false); }
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
            msgToSend, scam.victim, scam.trust, scam.suspicion, scam.category, activeObjective, allCompleted, newHistory, player.skills
        );
        
        setLastThought(analysis.internalThought);
        let trustDelta = analysis.trustDelta;

        // SKILL: Social 1 (Charisma) - Boosts positive trust gain
        const social1Level = player.skills['social_1'] || 0;
        if (trustDelta > 0 && social1Level > 0) {
            trustDelta = Math.ceil(trustDelta * (1 + (social1Level * 0.05)));
        }

        // SKILL: Social 3 (Silver Tongue) - Reduces suspicion gain
        let suspicionDelta = Math.max(0, analysis.suspicionDelta);
        const social3Level = player.skills['social_3'] || 0;
        if (suspicionDelta > 0 && social3Level > 0) {
            suspicionDelta = Math.ceil(suspicionDelta * (1 - (social3Level * 0.05)));
        }
        
        // SKILL: Tech 5 (Zero Day) - Chance to bypass suspicion
        const tech5Level = player.skills['tech_5'] || 0;
        if (suspicionDelta > 0 && Math.random() < (tech5Level * 0.05)) {
            suspicionDelta = 0;
            setLastThought("ZERO DAY EXPLOIT: SUSPICION BYPASSED.");
        }

        // Difficulty Scaling
        if (trustDelta > 0) {
            const multiplier = scam.victim.difficulty === 'easy' ? 1.2 : scam.victim.difficulty === 'medium' ? 1.0 : 0.6;
            trustDelta = Math.ceil(trustDelta * multiplier);
        }

        if (suspicionDelta > 0) trustDelta -= suspicionDelta;

        const newTrust = Math.max(0, Math.min(100, scam.trust + trustDelta));
        const newSuspicion = Math.min(100, scam.suspicion + suspicionDelta);

        // SKILL: Tech 3 (Social Engineering Toolkit) - Charge Gain
        const tech3Level = player.skills['tech_3'] || 0;
        let chargeGain = analysis.creativityScore * 3;
        if (tech3Level > 0) {
            chargeGain = Math.ceil(chargeGain * (1 + (tech3Level * 0.1)));
        }
        const newCharge = Math.min(100, scam.socialCharge + chargeGain);

        let updatedObjectives = [...scam.objectives];
        let isObjectiveComplete = analysis.objectiveComplete;

        if (analysis.scamStatus === 'success') {
            const objIndex = updatedObjectives.findIndex(o => o.id === activeObjective.id);
            if (objIndex !== -1) updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
            isObjectiveComplete = true;
        } else if (isObjectiveComplete) {
            audioManager.playSuccess(); 
            const objIndex = updatedObjectives.findIndex(o => o.id === activeObjective.id);
            if (objIndex !== -1) updatedObjectives[objIndex] = { ...updatedObjectives[objIndex], isCompleted: true };
        }

        let updatedScam = { ...scam, history: newHistory, trust: newTrust, suspicion: newSuspicion, socialCharge: newCharge, objectives: updatedObjectives };
        onUpdateScam(updatedScam);

        if (analysis.scamStatus === 'police_called' || newSuspicion >= 100) {
            onScamEnd('police', newSuspicion >= 100 ? 'Suspicion threshold breached' : 'Target alerted authorities');
            return;
        }

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
              onUpdateScam({ ...updatedScam, history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }] });
              onScamEnd('police', 'Target contacted authorities');
              return;
        }
        if (replyData.callTerminated) {
             onUpdateScam({ ...updatedScam, history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }] });
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

        onUpdateScam({ ...updatedScam, history: [...newHistory, { sender: 'victim', text: replyData.text, timestamp: Date.now() }] });

    } catch (error) { console.error(error); } finally { setProcessing(false); }
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

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden relative">
       <div className="md:hidden flex shrink-0 border-b border-zinc-800 bg-zinc-950">
           <button onClick={() => setMobileTab('comm')} className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'comm' ? 'bg-zinc-900 text-white border-b-2 border-green-500' : 'text-zinc-500 hover:bg-zinc-900/50'}`}><MessageSquare size={14} /> COMM</button>
           <button onClick={() => setMobileTab('intel')} className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'intel' ? 'bg-zinc-900 text-white border-b-2 border-green-500' : 'text-zinc-500 hover:bg-zinc-900/50'}`}><MonitorPlay size={14} /> INTEL</button>
           <button onClick={() => setMobileTab('sys')} className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'sys' ? 'bg-zinc-900 text-white border-b-2 border-green-500' : 'text-zinc-500 hover:bg-zinc-900/50'}`}><Activity size={14} /> SYS</button>
       </div>

       <div className="flex-1 flex md:grid md:grid-cols-3 gap-4 md:gap-6 p-2 md:p-6 min-h-0 relative">
           
           <ScamStatus scam={scam} mobileTab={mobileTab} />
           
           <ScamChat 
                scam={scam} 
                player={player}
                mobileTab={mobileTab} 
                input={input} 
                setInput={setInput} 
                processing={processing}
                hints={hints}
                loadingHints={loadingHints}
                onSend={handleSend}
                onRequestHint={requestHint}
                onOpenInventory={() => setInventoryOpen(true)}
                onAbortConfirm={() => setShowAbortConfirm(true)}
                onSuccessModal={() => setViewSuccessModal(true)}
                allCompleted={allCompleted}
           />

           <ScamSystemLog 
                scam={scam} 
                player={player} 
                mobileTab={mobileTab} 
                processing={processing} 
                lastThought={lastThought} 
                onOpenHack={() => setShowHackTerminal(true)}
           />

       </div>

       <AnimatePresence>
            {showAbortConfirm && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-red-600 p-6 md:p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden">
                         <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                         <ShieldAlert size={48} className="text-red-500 mx-auto mb-4 animate-pulse"/>
                         <h3 className="text-xl md:text-2xl font-bold text-white font-mono mb-2">TERMINATE CONNECTION?</h3>
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
                         <p className="text-zinc-400 text-sm mb-6 leading-relaxed">COST: 10 TRUST POINTS.</p>
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
            playerSkills={player.skills}
        />
    </div>
  );
};

export default ScamInterface;
