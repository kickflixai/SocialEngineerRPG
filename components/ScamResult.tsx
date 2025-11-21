
import React from 'react';
import { CheckCircle2, ShieldAlert, Banknote, AlertTriangle, ArrowRight, Home } from 'lucide-react';

interface Props {
  result: {
      outcome: 'success' | 'failed' | 'police';
      moneyChange: number;
      threatChange: number;
      victimName: string;
      reason?: string;
  };
  onContinue: () => void;
}

const ScamResult: React.FC<Props> = ({ result, onContinue }) => {
  const isSuccess = result.outcome === 'success';
  const isPolice = result.outcome === 'police';

  return (
    <div className="h-full flex items-center justify-center bg-black/90 p-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isSuccess ? 'from-green-900 to-black' : 'from-red-900 to-black'}`}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,16,16,0)_2px,transparent_2px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

        <div className={`max-w-2xl w-full bg-zinc-950 border-2 rounded-2xl p-12 text-center relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] ${isSuccess ? 'border-green-500 shadow-green-900/30' : 'border-red-500 shadow-red-900/30'}`}>
            
            {/* Icon */}
            <div className="mb-8 flex justify-center">
                {isSuccess ? (
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-bounce">
                        <CheckCircle2 size={48} className="text-green-500"/>
                    </div>
                ) : (
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
                        <ShieldAlert size={48} className="text-red-500"/>
                    </div>
                )}
            </div>

            {/* Title */}
            <h2 className={`text-5xl font-black font-mono mb-2 tracking-tighter ${isSuccess ? 'text-white' : 'text-white'}`}>
                {isSuccess ? 'MISSION ACCOMPLISHED' : isPolice ? 'AUTHORITIES ALERTED' : 'CONNECTION LOST'}
            </h2>
            <p className={`text-lg font-mono uppercase tracking-widest mb-12 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {isSuccess ? 'Payload Delivered Successfully' : result.reason || (isPolice ? 'Emergency Evasion Protocol Active' : 'Target Terminated Connection')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-12 text-left">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                    <p className="text-zinc-500 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                        <Banknote size={14}/> Net Earnings
                    </p>
                    <p className={`text-3xl font-mono font-bold ${result.moneyChange > 0 ? 'text-green-400' : 'text-zinc-400'}`}>
                        {result.moneyChange > 0 ? '+' : ''}${result.moneyChange.toLocaleString()}
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                    <p className="text-zinc-500 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle size={14}/> Heat Change
                    </p>
                    <p className={`text-3xl font-mono font-bold ${result.threatChange > 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                        {result.threatChange > 0 ? '+' : ''}{result.threatChange}%
                    </p>
                </div>
            </div>

            <div className="border-t border-zinc-800 pt-8">
                <button 
                    onClick={onContinue}
                    className={`w-full py-4 rounded-xl font-bold text-lg font-mono flex items-center justify-center gap-3 transition-all hover:scale-[1.02] ${isSuccess ? 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                >
                    {isSuccess ? <ArrowRight size={24}/> : <Home size={24}/>}
                    {isSuccess ? 'SECURE FUNDS & RETURN' : 'RETURN TO DASHBOARD'}
                </button>
            </div>

        </div>
    </div>
  );
};

export default ScamResult;
