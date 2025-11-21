
import React, { useRef, useState } from 'react';
import { CheckCircle2, ShieldAlert, Banknote, AlertTriangle, ArrowRight, Home, Share2, Quote, Loader2, Download } from 'lucide-react';
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
            className={`max-w-5xl w-full bg-zinc-950 border-2 rounded-3xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row ${isSuccess ? 'border-green-500 shadow-green-900/30' : 'border-red-500 shadow-red-900/30'}`}
        >
            
            {/* LEFT SIDE: TITLE & STATS */}
            <div className="p-8 md:p-12 w-full md:w-[45%] flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/20 relative">
                {/* Background Pattern for Screenshot aesthetics */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none"></div>

                {/* Icon/Avatar */}
                <div className="mb-6 relative">
                    {isSuccess ? (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                            {result.victimAvatar ? (
                                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                                    <img src={result.victimAvatar} alt="Victim" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-48 h-48 md:w-64 md:h-64 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                    <CheckCircle2 size={64} className="text-green-500"/>
                                </div>
                            )}
                            {isSuccess && result.victimFlavor && (
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black border border-green-500 text-green-400 text-xs md:text-sm uppercase font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-xl z-20">
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

                <h2 className={`text-4xl md:text-6xl font-black font-mono mb-2 tracking-tighter leading-none ${isSuccess ? 'text-white' : 'text-white'}`}>
                    {isSuccess ? 'SUCCESS' : isPolice ? 'BUSTED' : 'FAILED'}
                </h2>
                <p className={`text-sm md:text-base font-mono uppercase tracking-widest mb-8 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
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
            <div className="p-8 md:p-12 flex-1 flex flex-col justify-between bg-zinc-950 relative">
                {isSuccess && result.summary && result.summary.length > 0 ? (
                    <div className="flex-1 flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Quote size={14} className="text-green-500"/> Mission Debrief
                            </h3>
                            <ul className="space-y-4">
                                {result.summary.map((point, idx) => (
                                    <li key={idx} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-sm md:text-lg text-zinc-200 italic relative group hover:border-green-500/30 transition-colors font-medium leading-relaxed">
                                        <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-zinc-700 group-hover:bg-green-500 transition-colors"></span>
                                        "{point}"
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="mt-auto" data-html2canvas-ignore>
                            <button 
                                onClick={handleShare}
                                disabled={capturing}
                                className="w-full py-4 mb-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 hover:border-[#1DA1F2] text-[#1DA1F2] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                            >
                                {capturing ? <Loader2 size={18} className="animate-spin"/> : <Download size={18} />}
                                {capturing ? 'Generating Proof...' : 'Download Proof & Share on X'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-600 italic text-sm">
                        {isSuccess ? "Generating report..." : "No data recovered from failed session."}
                    </div>
                )}

                <div className="pt-4 border-t border-zinc-900" data-html2canvas-ignore>
                    <button 
                        onClick={onContinue}
                        className={`w-full py-5 rounded-xl font-bold text-lg font-mono flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl ${isSuccess ? 'bg-green-600 hover:bg-green-500 text-black shadow-green-900/20' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                    >
                        {isSuccess ? <ArrowRight size={24}/> : <Home size={24}/>}
                        {isSuccess ? 'SECURE FUNDS & RETURN' : 'RETURN TO DASHBOARD'}
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

export default ScamResult;