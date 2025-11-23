
import React from 'react';
import { Monitor, Armchair, Coffee, Lamp, Bitcoin, Heart, Award, Server, Cookie, Frame, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  achievements: string[];
  scamsCompleted: number;
}

const HackerRoom: React.FC<Props> = ({ achievements, scamsCompleted }) => {
  // Determine Upgrades based on achievements
  const chairTier = achievements.length > 10 ? 3 : achievements.length > 3 ? 2 : 1;
  const hasTripleMonitors = achievements.includes('high_roller');
  
  // DECORATIONS
  const hasLavaLamp = achievements.includes('ach_tech'); 
  const hasMiningRig = achievements.includes('ach_crypto'); 
  const hasRose = achievements.includes('ach_romance'); 
  const hasCookies = achievements.includes('ach_grandson'); 
  const hasDiploma = achievements.includes('ach_mule'); 
  const hasFirstDollar = achievements.includes('first_blood');
  const hasStealthTrophy = achievements.includes('untouchable');
  const hasGlobalMap = achievements.includes('ach_bec');

  return (
    <div className="w-full h-full relative overflow-hidden group">
      {/* Container for aspect ratio scaling */}
      <div className="absolute inset-0 flex items-end justify-center">
          
        {/* ROOM SCENE - Scaled via CSS container queries or just %, using % here for fluidity */}
        <div className="w-full h-full relative perspective-1000">

            {/* BACKGROUND GRID (Walls) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4vw_4vw] opacity-30"></div>
            
            {/* WINDOW / CITY VIEW */}
            <div className="absolute top-[10%] left-[5%] w-[15%] h-[20%] bg-black border-2 border-zinc-700 overflow-hidden rounded shadow-[0_0_15px_rgba(0,0,0,1)] z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-purple-900/50 animate-pulse"></div>
                <div className="absolute bottom-0 w-full h-[40%] bg-black/80 flex items-end gap-[5%] px-1">
                    <div className="w-[20%] h-[60%] bg-zinc-800"></div>
                    <div className="w-[30%] h-[90%] bg-zinc-800"></div>
                    <div className="w-[20%] h-[50%] bg-zinc-800"></div>
                </div>
                {hasStealthTrophy && (
                    <div className="absolute inset-0 text-[0.5vw] text-green-500 font-mono opacity-50 leading-none break-all cursor-help" style={{writingMode: 'vertical-lr'}}>1010101010</div>
                )}
            </div>

            {/* WALL DECOR - Absolute % positions */}
            {hasFirstDollar && (
                <div className="absolute top-[10%] right-[10%] w-[5%] aspect-[3/4] bg-zinc-800 border border-yellow-600 rounded flex items-center justify-center shadow-sm z-0">
                    <Frame className="text-yellow-500 w-[60%] h-[60%]" />
                </div>
            )}
            {hasDiploma && (
                <div className="absolute top-[15%] right-[20%] w-[6%] aspect-video bg-zinc-200 border-2 border-zinc-800 rounded-sm flex items-center justify-center rotate-3 shadow-sm z-0">
                    <Award className="text-red-600 w-[50%] h-[50%]" />
                </div>
            )}
            {hasGlobalMap && (
                <div className="absolute top-[30%] left-[5%] w-[8%] opacity-50 z-0">
                    <Globe className="text-blue-500/50 w-full h-full" />
                </div>
            )}

            {/* DESK AREA - Centered */}
            <div className="absolute bottom-0 left-[10%] w-[80%] h-[30%] bg-zinc-800 border-t-4 border-zinc-700 rounded-t-lg shadow-2xl flex justify-center items-end z-10">
                
                {/* MONITORS */}
                <div className="absolute bottom-[100%] mb-[1%] flex items-end gap-[1%] justify-center w-full">
                    {/* Left Monitor */}
                    {hasTripleMonitors && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="w-[15%] aspect-[4/3] bg-black border-2 border-zinc-600 rounded relative -rotate-6 origin-bottom-right">
                            <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                            <div className="absolute bottom-0 w-full h-[1px] bg-green-500"></div>
                        </motion.div>
                    )}
                    
                    {/* Main Monitor */}
                    <div className="w-[25%] aspect-[16/10] bg-black border-4 border-zinc-600 rounded-t relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.1)_50%)] bg-[size:100%_4px]"></div>
                        <div className="text-[0.6vw] text-green-500 font-mono leading-none text-center">System<br/>Ready</div>
                    </div>

                    {/* Right Monitor */}
                    {hasTripleMonitors && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="w-[15%] aspect-[4/3] bg-black border-2 border-zinc-600 rounded relative rotate-6 origin-bottom-left">
                            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                            <div className="text-[0.4vw] text-blue-500 font-mono p-[10%]">BTC: 42k</div>
                        </motion.div>
                    )}
                </div>

                {/* DESK ITEMS */}
                {hasLavaLamp && (
                    <div className="absolute bottom-[100%] left-[5%] w-[3%] aspect-[1/3] bg-orange-500/20 rounded-full border border-orange-500/50 flex flex-col items-center justify-end overflow-hidden shadow-[0_0_10px_orange]">
                        <div className="w-[50%] h-[20%] bg-orange-500 rounded-full animate-bounce blur-[1px]"></div>
                    </div>
                )}
                {hasCookies && <Cookie className="absolute bottom-[100%] right-[2%] text-amber-600 w-[4%] h-[4%]" />}
                {hasRose && <Heart className="absolute bottom-[100%] right-[10%] text-pink-600 fill-pink-600 w-[3%] h-[3%]" />}
            </div>

            {/* CHAIR - Centered over desk */}
            <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-20 w-[15%] aspect-[1/1.5] flex items-end justify-center">
                {chairTier === 1 && <Armchair className="text-zinc-600 fill-zinc-800 w-full h-full" strokeWidth={1.5} />}
                {chairTier === 2 && <Armchair className="text-blue-300 fill-blue-900 w-full h-full" strokeWidth={1.5} />}
                {chairTier === 3 && (
                    <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                        <Armchair className="text-purple-400 fill-zinc-900 w-full h-full relative z-10" strokeWidth={2} />
                    </div>
                )}
            </div>

            {/* FLOOR ITEMS */}
            {hasMiningRig && (
                <div className="absolute bottom-[5%] right-[2%] w-[8%] aspect-[3/4] bg-zinc-800 border border-zinc-600 rounded flex flex-col items-center justify-center gap-1 shadow-lg z-20">
                    <Server className="text-green-500 w-[50%] h-[50%]" />
                    <Bitcoin className="text-orange-500 absolute -top-[10%] -right-[10%] bg-black rounded-full w-[40%] h-[40%]" />
                </div>
            )}
            
            {/* OVERLAY VIGNETTE */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-30"></div>
        </div>
      </div>
    </div>
  );
};

export default HackerRoom;
