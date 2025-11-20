
import React, { useState, useEffect, useRef } from 'react';
import { ScamState, PlayerState, ChatMessage } from '../types';
import { getVictimResponse, arbitrateChat, generateSpeech } from '../services/geminiService';
import { Send, Terminal, Wifi, Radio, Mic, MicOff, Volume2, VolumeX, Loader2, Power, ShieldAlert, CheckCircle2, AlertTriangle, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  scam: ScamState;
  player: PlayerState;
  onUpdateScam: (scam: ScamState) => void;
  onScamEnd: (result: 'success' | 'failed' | 'police') => void;
  onAbort: () => void;
}

const ScamInterface: React.FC<Props> = ({ scam, player, onUpdateScam, onScamEnd, onAbort }) => {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastThought, setLastThought] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [intelExpanded, setIntelExpanded] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [scam.history, processing]);

  // Audio Context Init
  useEffect(() => {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;
      }
      return () => {
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close();
          }
      }
  }, []);

  // Play Audio for new victim messages
  useEffect(() => {
      const lastMsg = scam.history[scam.history.length - 1];
      const playVoice = async () => {
          if (ttsEnabled && lastMsg.sender === 'victim' && !initRef.current) { 
              setIsPlayingAudio(true);
              const audioData = await generateSpeech(lastMsg.text, scam.victim.gender);
              if (audioData && audioContextRef.current) {
                  try {
                      if (audioContextRef.current.state === 'suspended') {
                          await audioContextRef.current.resume();
                      }
                      const buffer = await audioContextRef.current.decodeAudioData(audioData);
                      const source = audioContextRef.current.createBufferSource();
                      source.buffer = buffer;
                      source.connect(audioContextRef.current.destination);
                      source.start();
                      source.onended = () => setIsPlayingAudio(false);
                  } catch (e) {
                      console.error("Audio decode error", e);
                      setIsPlayingAudio(false);
                  }
              } else {
                  setIsPlayingAudio(false);
              }
          }
      };
      
      const t = setTimeout(playVoice, 500);
      return () => clearTimeout(t);
  }, [scam.history, ttsEnabled, scam.victim.gender]);

  // Handle initial Victim Message
  useEffect(() => {
     if (!initRef.current && scam.history.length === 1 && scam.history[0].sender === 'player') {
         initRef.current = true;
         const fetchFirstReply = async () => {
             setProcessing(true);
             try {
                 const reply = await getVictimResponse(scam.history, scam.victim, scam.category);
                 const newHistory = [...scam.history, { sender: 'victim', text: reply, timestamp: Date.now() } as ChatMessage];
                 onUpdateScam({
                     ...scam,
                     history: newHistory
                 });
             } catch(e) { console.error(e); }
             setProcessing(false);
         };
         fetchFirstReply();
     }
  }, [scam, onUpdateScam]);

  const handleSend = async () => {
    if (!input.trim() || processing) return;

    const playerMsg: ChatMessage = { sender: 'player', text: input, timestamp: Date.now() };
    const newHistory = [...scam.history, playerMsg];
    
    onUpdateScam({ ...scam, history: newHistory });
    setInput('');
    setProcessing(true);
    setLastThought("ANALYZING RESPONSE VECTORS...");

    try {
        const analysis = await arbitrateChat(input, scam.victim, scam.trust, scam.suspicion, scam.progress, scam.category);
        setLastThought(analysis.internalThought);

        let newTrust = Math.max(0, Math.min(100, scam.trust + analysis.trustDelta));
        let newSuspicion = Math.max(0, Math.min(100, scam.suspicion + analysis.suspicionDelta));
        let newProgress = Math.max(0, Math.min(100, scam.progress + analysis.progressDelta));

        if (player.skills.includes('silver_tongue') && analysis.suspicionDelta > 0) {
             newSuspicion -= Math.floor(analysis.suspicionDelta * 0.2);
        }
        if (player.skills.includes('empathy_mirror') && analysis.trustDelta > 0) {
             newTrust += Math.ceil(analysis.trustDelta * 0.25);
        }

        const updatedScam = {
            ...scam,
            history: newHistory,
            trust: newTrust,
            suspicion: newSuspicion,
            progress: newProgress
        };
        onUpdateScam(updatedScam);

        if (analysis.scamStatus === 'police_called' || newSuspicion >= 100) {
            onScamEnd('police');
            return;
        }
        if (analysis.scamStatus === 'success' || (newProgress >= 100)) {
            onScamEnd('success');
            return;
        }

        const reply = await getVictimResponse(newHistory, scam.victim, scam.category);
        onUpdateScam({
            ...updatedScam,
            history: [...newHistory, { sender: 'victim', text: reply, timestamp: Date.now() }]
        });

    } catch (error) {
        console.error(error);
    } finally {
        setProcessing(false);
    }
  };

  const toggleListening = () => {
      setSpeechError(null);
      if (listening || recognitionRef.current) {
          if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) {}
          setListening(false);
          recognitionRef.current = null;
          return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          setSpeechError("Not Supported");
          return;
      }

      try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          recognition.onstart = () => setListening(true);
          recognition.onend = () => { setListening(false); recognitionRef.current = null; };
          
          recognition.onerror = (e: any) => {
              const errorMsg = e.error || 'unknown';
              console.log("Speech Error:", errorMsg);
              setListening(false);
              recognitionRef.current = null;
              
              if (errorMsg === 'network') {
                  setSpeechError("Offline");
              } else if (errorMsg === 'not-allowed') {
                  setSpeechError("Denied");
              } else if (errorMsg !== 'no-speech') {
                  setSpeechError("Error");
              }
          };
          
          recognition.onresult = (e: any) => {
              const transcript = e.results[0][0].transcript;
              setInput(prev => prev + (prev ? ' ' : '') + transcript);
          };
          recognitionRef.current = recognition;
          recognition.start();
      } catch (e) {
          console.error(e);
          setListening(false);
      }
  };

  return (
    <div className="flex h-full gap-6 p-6 bg-black overflow-hidden relative">
      {/* Global CRT Scanline & Vignette Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.8)_100%)] z-0 pointer-events-none"></div>

      {/* Left: Victim Profile & Stats */}
      <div className="w-80 flex flex-col gap-4 shrink-0 h-full relative z-10">
        
        {/* Profile Card */}
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 flex flex-col items-center text-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0">
             {/* Avatar */}
             <div className="relative w-28 h-28 mb-4 mt-2 group">
                <div className="absolute inset-0 rounded-full border border-dashed border-green-500/40 animate-spin-slow"></div>
                <img src={scam.victim.avatarUrl} alt="Target" className="w-full h-full rounded-full object-cover border-2 border-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-2 -right-1 bg-black text-green-500 text-[10px] font-bold px-2 py-1 rounded border border-green-900 flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <Wifi size={8} className="animate-pulse" /> LIVE FEED
                </div>
             </div>
             
             <h2 className="text-xl font-bold text-white font-mono truncate w-full tracking-tight">{scam.victim.name}</h2>
             <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">{scam.victim.age} Y/O // {scam.victim.occupation}</p>
        </div>

        {/* METERS: Trust, Suspicion, Progress */}
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 shadow-xl shrink-0 space-y-4 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800"></div>
            
            {/* Trust */}
            <div className="space-y-1 relative">
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-green-500 font-bold tracking-widest flex items-center gap-1"><Lock size={8}/> TRUST_LEVEL</span>
                    <span className="text-white">{scam.trust}%</span>
                </div>
                <div className="h-2 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex gap-0.5">
                    {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className={`flex-1 transition-all duration-300 ${i < (scam.trust / 5) ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-zinc-900'}`}></div>
                    ))}
                </div>
            </div>

            {/* Suspicion */}
            <div className="space-y-1 relative">
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-red-500 font-bold tracking-widest flex items-center gap-1"><AlertTriangle size={8}/> SUSPICION</span>
                    <span className="text-white">{scam.suspicion}%</span>
                </div>
                <div className="h-2 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex gap-0.5">
                     {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className={`flex-1 transition-all duration-300 ${i < (scam.suspicion / 5) ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-zinc-900'}`}></div>
                    ))}
                </div>
            </div>

             {/* Progress */}
             <div className="space-y-1 relative">
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-blue-400 font-bold tracking-widest flex items-center gap-1"><Unlock size={8}/> INFILTRATION</span>
                    <span className="text-white">{scam.progress}%</span>
                </div>
                 <div className="h-3 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden relative">
                     <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${scam.progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                     />
                </div>
            </div>
        </div>

        {/* Intel Log (Compact / Auto-Sizing) */}
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl flex flex-col shadow-xl min-h-0 overflow-hidden backdrop-blur-sm shrink-0 max-h-64">
             <button 
                onClick={() => setIntelExpanded(!intelExpanded)}
                className="p-3 border-b border-zinc-800 bg-black/40 flex justify-between items-center hover:bg-zinc-900/50 transition-colors"
             >
                <p className="text-green-600 uppercase font-bold text-[10px] flex items-center gap-2 tracking-widest">
                    <Terminal size={12}/> TARGET_INTEL
                </p>
                {intelExpanded ? <ChevronDown size={12} className="text-zinc-500"/> : <ChevronUp size={12} className="text-zinc-500"/>}
             </button>
             
             {intelExpanded && (
                 <div className="overflow-y-auto p-3 custom-scrollbar space-y-3 text-xs font-mono">
                     <div className="bg-zinc-900/50 p-2 rounded border-l-2 border-zinc-700">
                        <p className="text-zinc-500 text-[10px] uppercase">Strategy</p>
                        <p className="text-zinc-300">{scam.category}</p>
                     </div>
                     
                     {(player.skills.includes('doxxing_suite') || player.skills.includes('social_scraper') || scam.revealedFacts.length > 0) && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
                            {player.skills.includes('doxxing_suite') && (
                                <div className="bg-green-900/10 p-2 rounded border-l-2 border-green-600">
                                    <p className="text-green-500 text-[10px] uppercase font-bold">LEAK DETECTED</p>
                                    <p className="text-zinc-300">{scam.victim.hiddenFact}</p>
                                </div>
                            )}
                            {player.skills.includes('social_scraper') && (
                                <div className="bg-red-900/10 p-2 rounded border-l-2 border-red-600">
                                    <p className="text-red-500 text-[10px] uppercase font-bold">PSYCH VULNERABILITY</p>
                                    <p className="text-zinc-300">{scam.victim.weakness}</p>
                                </div>
                            )}
                            {scam.revealedFacts.map((fact, idx) => (
                                 <div key={idx} className="bg-blue-900/10 p-2 rounded border-l-2 border-blue-600">
                                    <p className="text-blue-500 text-[10px] uppercase font-bold">NEW INTEL</p>
                                    <p className="text-zinc-300">{fact}</p>
                                </div>
                            ))}
                        </div>
                     )}
                 </div>
             )}
        </div>

        {/* Arbiter - Expanded to Fill Remaining Space */}
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 flex-1 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20"><Radio size={40} className="text-green-500"/></div>
             <p className="text-zinc-500 mb-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                 <Wifi size={10} className={processing ? "animate-pulse text-green-500" : "text-zinc-600"}/> AI_ARBITER_LINK
             </p>
             
             <div className="font-mono text-xs relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                {processing ? (
                     <div className="flex flex-col gap-2 text-yellow-500 h-full justify-center items-center opacity-80">
                         <Loader2 size={24} className="animate-spin"/>
                         <span>ANALYZING PATTERNS...</span>
                     </div>
                ) : (
                    <div className="text-zinc-300 leading-relaxed">
                        <span className="text-green-500 mr-2">&gt;</span>
                        {lastThought || "ESTABLISHED CONNECTION. WAITING FOR INPUT..."}
                    </div>
                )}
             </div>
        </div>
      </div>

      {/* Right: Chat Window */}
      <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-800/60 rounded-xl overflow-hidden relative shadow-2xl h-full z-10">
        {/* Header */}
        <div className="h-16 bg-black/60 backdrop-blur border-b border-zinc-800 flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
                <div>
                    <div className="text-sm font-mono font-bold text-white tracking-widest">SECURE_CHANNEL_V2</div>
                    <div className="text-[10px] text-zinc-500 font-mono">ENCRYPTION: AES-256 // ROUTING: ONION</div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`text-[10px] font-bold font-mono flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${ttsEnabled ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}
                >
                    {isPlayingAudio ? <Loader2 size={12} className="animate-spin"/> : ttsEnabled ? <Volume2 size={12}/> : <VolumeX size={12}/>}
                    {ttsEnabled ? 'AUDIO_FEED' : 'MUTED'}
                </button>
                
                <div className="h-6 w-px bg-zinc-800 mx-2"></div>

                <button 
                    onClick={() => setShowAbortConfirm(true)}
                    className="text-[10px] font-bold font-mono flex items-center gap-2 px-3 py-1.5 rounded border border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40 hover:border-red-500 transition-all"
                >
                    <Power size={12} /> DISCONNECT
                </button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 to-black custom-scrollbar min-h-0 relative">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            {scam.history.map((msg, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: msg.sender === 'player' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex relative z-10 ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                >
                    {msg.sender === 'victim' && (
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-zinc-600 shadow-lg flex-shrink-0 self-end mb-1">
                            <img src={scam.victim.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed shadow-lg backdrop-blur-md border ${
                        msg.sender === 'player' 
                        ? 'bg-green-900/10 border-green-500/30 text-green-50 rounded-br-none' 
                        : 'bg-zinc-800/60 border-zinc-600/30 text-zinc-200 rounded-bl-none'
                    }`}>
                        <p>{msg.text}</p>
                        <p className="text-[9px] opacity-40 mt-2 font-mono text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                </motion.div>
            ))}
            
            <AnimatePresence>
                {processing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-start items-center gap-2 relative z-10"
                    >
                         <div className="bg-zinc-900/50 border border-zinc-700/50 px-4 py-3 rounded-xl rounded-bl-none flex gap-1.5 items-center">
                             <span className="text-xs text-zinc-500 font-mono animate-pulse">TYPING</span>
                            <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/80 backdrop-blur border-t border-zinc-800 shrink-0 relative z-20">
             <div className="flex gap-3">
                 <div className="relative">
                    {speechError && (
                        <div className="absolute -top-8 left-0 bg-red-900 text-white text-[10px] px-2 py-1 rounded border border-red-500 whitespace-nowrap">
                            {speechError}
                        </div>
                    )}
                    <button 
                        onClick={toggleListening}
                        className={`p-4 rounded-lg border transition-all ${listening ? 'bg-red-900/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_10px_red]' : speechError ? 'bg-zinc-900 border-red-900 text-red-500' : 'bg-black border-zinc-700 text-zinc-400 hover:text-white'}`}
                        title="Voice Input"
                    >
                        {listening ? <MicOff size={18}/> : <Mic size={18}/>}
                    </button>
                 </div>

                 <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={processing}
                    placeholder={listening ? "LISTENING..." : "Inject social engineering payload..."}
                    className="flex-1 bg-black border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 outline-none transition-all font-mono text-sm"
                 />
                 <button 
                    onClick={handleSend}
                    disabled={processing || !input.trim()}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-zinc-800 text-black font-bold px-6 rounded-lg transition-all flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                 >
                    <Send size={18} />
                 </button>
             </div>
        </div>

        {/* OVERLAYS FOR SUCCESS / FAILURE / ABORT */}
        <AnimatePresence>
            {/* ABORT CONFIRMATION MODAL */}
            {showAbortConfirm && (
                <motion.div 
                    initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
                >
                    <div className="bg-zinc-950 border border-red-600 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden">
                         <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                         <ShieldAlert size={48} className="text-red-500 mx-auto mb-4 animate-pulse"/>
                         <h3 className="text-2xl font-bold text-white font-mono mb-2">TERMINATE CONNECTION?</h3>
                         <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                             Aborting this operation will flag your IP address. <br/>
                             <span className="text-red-500 font-bold">HEAT LEVEL WILL INCREASE.</span>
                         </p>
                         <div className="flex gap-4 justify-center">
                             <button 
                                onClick={() => setShowAbortConfirm(false)}
                                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-mono text-sm"
                             >
                                 CANCEL
                             </button>
                             <button 
                                onClick={onAbort}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-black font-bold rounded font-mono text-sm"
                             >
                                 CONFIRM DISCONNECT
                             </button>
                         </div>
                    </div>
                </motion.div>
            )}

            {/* SUCCESS OVERLAY */}
            {scam.progress >= 100 && (
                <motion.div 
                    initial={{opacity: 0}} animate={{opacity: 1}}
                    className="absolute inset-0 z-50 bg-green-950/90 flex items-center justify-center backdrop-blur-sm"
                >
                    <div className="text-center space-y-4 p-12 border-2 border-green-500 rounded-2xl bg-black shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                        <CheckCircle2 size={80} className="text-green-500 mx-auto animate-bounce"/>
                        <h1 className="text-5xl font-black text-white font-mono tracking-tighter">PAYLOAD DELIVERED</h1>
                        <p className="text-green-400 font-mono uppercase tracking-widest">Funds Transferred Successfully</p>
                    </div>
                </motion.div>
            )}

            {/* FAILURE OVERLAY */}
            {scam.suspicion >= 100 && (
                <motion.div 
                    initial={{opacity: 0}} animate={{opacity: 1}}
                    className="absolute inset-0 z-50 bg-red-950/90 flex items-center justify-center backdrop-blur-sm"
                >
                    <div className="text-center space-y-4 p-12 border-2 border-red-500 rounded-2xl bg-black shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                        <ShieldAlert size={80} className="text-red-500 mx-auto animate-pulse"/>
                        <h1 className="text-5xl font-black text-white font-mono tracking-tighter">CONNECTION TERMINATED</h1>
                        <p className="text-red-400 font-mono uppercase tracking-widest">Target Alerted Authorities</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScamInterface;
