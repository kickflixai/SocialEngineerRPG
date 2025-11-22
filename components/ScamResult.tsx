
import React, { useRef, useState } from 'react';
import { CheckCircle2, ShieldAlert, Banknote, AlertTriangle, ArrowRight, Home, Share2, Quote, Loader2, Download, Smile } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Props {
  result: {
      outcome: 'success' | 'failed' | 'police';
      moneyChange: number;
      threatChange: number;
      victimName: string;
      reason?: string;
      victimAvatar?: string;
      victimFlavor?: string;
      summary?: string[];
      victimAftermath?: string;
  };
  onContinue: () => void;
}

const ScamResult: React.FC<Props> = ({ result, onContinue }) => {
  const isSuccess = result.outcome === 'success';
  const isPolice = result.outcome === 'police';
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const handleShare = async () => {
      if (!cardRef.current) return;
      setCapturing(true);
      
      try {
          // Generate Image
          const canvas = await html2canvas(cardRef.current, {
              backgroundColor: '#09090b', // zinc-950
              scale: 2 // High res
          });
          const image = canvas.toDataURL("image/png");
          
          // Trigger download
          const link = document.createElement('a');
          link.href = image;
          link.download = `Scam_Result_${result.victimName.replace(/ /g, '_')}.png`;
          link.click();
          
          // Open Twitter intent with text
          const text = `I just scammed ${result.victimName} (${result.victimFlavor}) out of $${result.moneyChange} in Scam Simulator!\n\n(Attach your summary card below!)\n\nPlay now:`;
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
      } catch (e) {
          console.error("Screenshot failed", e);
          alert("Could not generate image. Opening Twitter anyway.");
          const text = `I just scammed ${result.victimName} out of $${result.moneyChange} in Scam Simulator!`;
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
      } finally {
          setCapturing(false);
      }
  };

  return (
    <div className="h-full flex items-center justify-center bg-black/90 p-4 md:p-8 relative overflow-hidden overflow-y-auto custom-scrollbar">
        {/* Background Effects */}
        <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isSuccess ? 'from-green-900 to-black' : 'from-red-900 to-black'}`}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,16,16,0)_2px,transparent_2px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

        <div 
            ref={cardRef}
            className={`max-w-5xl w-full bg-zinc-950 border-2 rounded-3xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row ${isSuccess ? 'border-red-500 shadow-red-900/30' : 'border-zinc-700 shadow-red-900/30'}`}
        >
            
            {/* LEFT SIDE: TITLE & STATS */}
            <div className="p-6 md:p-10 w-full md:w-[45%] flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/20 relative">
                {/* Background Pattern for Screenshot aesthetics */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none"></div>

                {/* Icon/Avatar */}
                <div className="mb-6 relative">
                    {isSuccess ? (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                            {result.victimAvatar ? (
                                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-red-600 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                                    <img src={result.victimAvatar} alt="Victim" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-48 h-48 md:w-64 md:h-64 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                    <CheckCircle2 size={64} className="text-red-500"/>
                                </div>
                            )}
                            {isSuccess && result.victimFlavor && (
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black border border-red-500 text-red-500 text-xs md:text-sm uppercase font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-xl z-20">
                                    {result.victimFlavor}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-32 h-32 md:w-48 md:h-48 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
                            <ShieldAlert size={64} className="text-red-500"/>
                        </div>
                    )}
                </div>

                <h2 className={`text-4xl md:text-6xl font-black font-mono mb-2 tracking-tighter leading-none ${isSuccess ? 'text-red-500' : 'text-white'}`}>
                    {isSuccess ? 'SCAMMED' : isPolice ? 'BUSTED' : 'FAILED'}
                </h2>
                <p className={`text-sm md:text-base font-mono uppercase tracking-widest mb-8 ${isSuccess ? 'text-zinc-500' : 'text-red-500'}`}>
                    {isSuccess ? result.victimName : result.reason || 'Connection Terminated'}
                </p>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-2 gap-4 w-full text-left">
                    <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-2">
                            <Banknote size={12}/> Payout
                        </p>
                        <p className={`text-2xl md:text-3xl font-mono font-bold ${result.moneyChange > 0 ? 'text-green-400' : 'text-zinc-400'}`}>
                            {result.moneyChange > 0 ? '+' : ''}${result.moneyChange.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-2">
                            <AlertTriangle size={12}/> Heat
                        </p>
                        <p className={`text-2xl md:text-3xl font-mono font-bold ${result.threatChange > 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                            {result.threatChange > 0 ? '+' : ''}{result.threatChange}%
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: SUMMARY (If success) or CONTINUE */}
            <div className="p-6 md:p-10 flex-1 flex flex-col bg-zinc-950 relative">
                {isSuccess && result.summary && result.summary.length > 0 ? (
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Aftermath Quote */}
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 relative">
                            <Quote size={20} className="text-zinc-700 absolute top-4 left-4" />
                            <p className="text-center text-sm md:text-base text-zinc-300 italic font-medium px-6 py-2">
                                "{result.victimAftermath || "They are now financially ruined and confused."}"
                            </p>
                            <div className="text-center mt-2">
                                <span className="text-[10px] uppercase font-bold text-red-900 bg-red-950/30 px-2 py-1 rounded">Current Status: Ruined</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <h3 className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-900 pb-2">
                                OPERATION LOG
                            </h3>
                            <ul className="space-y-3">
                                {result.summary.map((point, idx) => (
                                    <li key={idx} className="flex gap-3 text-xs md:text-sm text-zinc-400">
                                        <span className="text-green-900 select-none font-mono">0{idx+1}</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="mt-auto pt-4" data-html2canvas-ignore>
                            <button 
                                onClick={handleShare}
                                disabled={capturing}
                                className="w-full py-3 mb-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 hover:border-[#1DA1F2] text-[#1DA1F2] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                            >
                                {capturing ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
                                {capturing ? 'Generating Proof...' : 'Share Victory on X'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-600 italic text-sm">
                        {isSuccess ? "Generating report..." : "No data recovered from failed session."}
                    </div>
                )}

                <div className="pt-2 border-t border-zinc-900" data-html2canvas-ignore>
                    <button 
                        onClick={onContinue}
                        className={`w-full py-4 rounded-xl font-bold text-base font-mono flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl ${isSuccess ? 'bg-zinc-100 hover:bg-white text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                    >
                        {isSuccess ? <ArrowRight size={20}/> : <Home size={20}/>}
                        {isSuccess ? 'SECURE FUNDS & RETURN' : 'RETURN TO DASHBOARD'}
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

export default ScamResult;
