
import React from 'react';
import { Monitor, Armchair, Coffee, Lamp, Bitcoin, Heart, Award, Server, Cookie, Frame, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  achievements: string[];
  scamsCompleted: number;
}

const HackerRoom: React.FC<Props> = ({ achievements, scamsCompleted }) => {
  // Determine Upgrades based on achievements
  
  // CHAIR TIER
  const chairTier = achievements.length > 10 ? 3 : achievements.length > 3 ? 2 : 1;
  
  // MONITOR SETUP
  const hasTripleMonitors = achievements.includes('high_roller');
  
  // DECORATIONS
  const hasLavaLamp = achievements.includes('ach_tech'); // Tech Support
  const hasMiningRig = achievements.includes('ach_crypto'); // Crypto
  const hasRose = achievements.includes('ach_romance'); // Romance
  const hasCookies = achievements.includes('ach_grandson'); // Grandson
  const hasDiploma = achievements.includes('ach_mule'); // Job Scam
  const hasFirstDollar = achievements.includes('first_blood');
  const hasStealthTrophy = achievements.includes('untouchable');
  const hasGlobalMap = achievements.includes('ach_bec');

  return (
    <div className="w-full h-full bg-zinc-900/80 border border-zinc-800 rounded-lg relative overflow-hidden group perspective-1000">
      {/* BACKGROUND GRID (Walls) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
      
      {/* WINDOW / CITY VIEW */}
      <div className="absolute top-4 left-4 w-24 h-16 bg-black border-2 border-zinc-700 overflow-hidden rounded shadow-[0_0_15px_rgba(0,0,0,1)]">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-purple-900/50 animate-pulse"></div>
          {/* City Lights */}
          <div className="absolute bottom-0 w-full h-8 bg-black/80 flex items-end gap-1 px-1">
              <div className="w-2 h-4 bg-zinc-800"></div>
              <div className="w-3 h-6 bg-zinc-800"></div>
              <div className="w-2 h-3 bg-zinc-800"></div>
              <div className="w-4 h-5 bg-zinc-800"></div>
          </div>
          {hasStealthTrophy && (
              <div 
                className="absolute inset-0 text-[8px] text-green-500 font-mono opacity-50 leading-none break-all cursor-help" 
                style={{writingMode: 'vertical-lr'}}
                title="Unlocked by [Untouchable]: Matrix Code Rain"
              >
                  10101010101010
              </div>
          )}
      </div>

      {/* WALL DECOR */}
      {hasFirstDollar && (
          <div className="absolute top-4 right-12 w-8 h-10 bg-zinc-800 border border-yellow-600 rounded flex items-center justify-center shadow-sm cursor-help" title="Unlocked by [First Blood]: Framed First Dollar">
              <Frame size={12} className="text-yellow-500" />
              <div className="absolute inset-0 bg-yellow-500/10"></div>
          </div>
      )}

      {hasDiploma && (
          <div className="absolute top-6 right-24 w-12 h-8 bg-zinc-200 border-4 border-zinc-800 rounded-sm flex items-center justify-center rotate-3 shadow-sm cursor-help" title="Unlocked by [Job Creator]: Fake Diploma">
              <Award size={12} className="text-red-600" />
          </div>
      )}
      
      {hasGlobalMap && (
          <div className="absolute top-16 left-4 w-16 h-10 opacity-50 hover:opacity-100 transition-opacity cursor-help" title="Unlocked by [CEO Fraud]: Global Operations Map">
              <Globe size={24} className="text-blue-500/50" />
          </div>
      )}

      {/* DESK AREA */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-zinc-800 border-t-4 border-zinc-700 rounded-t-lg shadow-2xl flex justify-center items-end relative">
          
          {/* MONITORS */}
          <div className="absolute bottom-full mb-2 flex items-end gap-1">
              {/* Left Monitor (Triple Setup) */}
              {hasTripleMonitors && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="w-10 h-8 bg-black border-2 border-zinc-600 rounded relative -rotate-12 origin-bottom-right cursor-help"
                    title="Unlocked by [High Roller]: Side Monitor"
                  >
                       <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                       <div className="absolute bottom-0 w-full h-[1px] bg-green-500"></div>
                  </motion.div>
              )}
              
              {/* Main Monitor */}
              <div className="w-16 h-12 bg-black border-4 border-zinc-600 rounded-t relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.1)_50%)] bg-[size:100%_4px]"></div>
                  <div className="text-[6px] text-green-500 font-mono leading-none">
                      Target<br/>Acquired
                  </div>
              </div>

              {/* Right Monitor (Triple Setup) */}
              {hasTripleMonitors && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="w-10 h-8 bg-black border-2 border-zinc-600 rounded relative rotate-12 origin-bottom-left cursor-help"
                    title="Unlocked by [High Roller]: Crypto Monitor"
                  >
                      <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                      <div className="text-[4px] text-blue-500 font-mono p-1">
                          ETH: $2942<br/>BTC: $42000
                      </div>
                  </motion.div>
              )}
          </div>

          {/* DESK ITEMS */}
          {hasLavaLamp && (
              <div className="absolute bottom-full mb-1 left-4 w-4 h-8 bg-orange-500/20 rounded-full border border-orange-500/50 flex flex-col items-center justify-end overflow-hidden shadow-[0_0_10px_orange] cursor-help" title="Unlocked by [Hello Sir]: Lava Lamp">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce blur-[1px]"></div>
                  <div className="w-3 h-3 bg-orange-600 rounded-t-full mt-1"></div>
              </div>
          )}
          
          {hasCookies && (
              <div className="absolute bottom-full mb-2 right-2 cursor-help" title="Unlocked by [Nana's Boy]: Grandma's Cookies">
                  <Cookie size={14} className="text-amber-600" />
              </div>
          )}

          {hasRose && (
              <div className="absolute bottom-full mb-2 right-8 cursor-help" title="Unlocked by [Heartbreaker]: Single Rose">
                  <Heart size={14} className="text-pink-600 fill-pink-600 drop-shadow-[0_0_5px_rgba(219,39,119,0.8)]" />
              </div>
          )}
      </div>

      {/* CHAIR */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
          {chairTier === 1 && (
              <div className="relative cursor-help" title="Level 1 Chair (Default)">
                  <Armchair size={32} className="text-zinc-600 fill-zinc-800" strokeWidth={1.5} />
              </div>
          )}
          {chairTier === 2 && (
              <div className="relative cursor-help" title="Level 2 Chair (Unlocked at 3 Achievements)">
                  <Armchair size={36} className="text-blue-300 fill-blue-900" strokeWidth={1.5} />
                  <div className="absolute -bottom-1 w-full h-1 bg-black blur-sm opacity-50"></div>
              </div>
          )}
          {chairTier === 3 && (
              <div className="relative cursor-help" title="Level 3 Chair (Unlocked at 10 Achievements)">
                  <div className="absolute -inset-2 bg-purple-500/20 blur-xl rounded-full"></div>
                  <Armchair size={40} className="text-purple-400 fill-zinc-900 relative z-10" strokeWidth={2} />
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse z-20"></div>
              </div>
          )}
      </div>

      {/* FLOOR ITEMS */}
      {hasMiningRig && (
          <div className="absolute bottom-4 right-4 w-8 h-10 bg-zinc-800 border border-zinc-600 rounded flex flex-col items-center justify-center gap-1 shadow-lg cursor-help" title="Unlocked by [Rug Pull]: Mining Rig">
              <Server size={12} className="text-green-500" />
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <Bitcoin size={12} className="text-orange-500 absolute -top-2 -right-2 bg-black rounded-full" />
          </div>
      )}
      
      {/* Coffee Cup (Always present if Scams > 0) */}
      {scamsCompleted > 0 && (
          <div className="absolute bottom-8 left-12 opacity-80 cursor-help" title="Unlocked by [First Blood]: Caffeine Supply">
              <Coffee size={12} className="text-zinc-400" />
          </div>
      )}

      {/* OVERLAY VIGNETTE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
      
      {/* LABEL */}
      <div className="absolute top-2 right-2 text-[8px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 px-1 rounded bg-black/50">
          SAFEHOUSE_V{chairTier}.0
      </div>
    </div>
  );
};

export default HackerRoom;
