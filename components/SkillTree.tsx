
import React from 'react';
import { AlertOctagon, Terminal, Cpu, Shield, Lock, Unlock, Zap, ChevronRight } from 'lucide-react';
import { PlayerState, SkillDefinition } from '../types';
import { SKILL_TREE_SOCIAL, SKILL_TREE_TECH, SKILL_TREE_OPS } from '../constants';

interface Props {
    player: PlayerState;
    onBuy: (skill: SkillDefinition) => void;
}

const SkillNode: React.FC<{ 
    skill: SkillDefinition, 
    player: PlayerState, 
    onBuy: (s: SkillDefinition) => void, 
    colorTheme: string 
}> = ({ skill, player, onBuy, colorTheme }) => {
    const currentLevel = player.skills[skill.id] || 0;
    const isMaxed = currentLevel >= skill.maxLevel;
    
    // Check Requirements
    let isLocked = false;
    if (skill.requiredSkillId) {
        const reqLevel = player.skills[skill.requiredSkillId] || 0;
        // Simple check: Is parent at least level 1? Usually needed max level of previous to be strict, 
        // but for gameplay flow, let's say Level 1 of previous is enough to see/unlock next.
        // Actually, prompt logic said "Linear", so let's enforce previous skill > 0.
        // Better yet, usually tier X requires tier X-1 maxed or at least level 1.
        // Let's assume Level 1 of previous is required to unlock next.
        if (reqLevel === 0) isLocked = true;
    }

    // Cost Calculation
    const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
    const nextLevel = currentLevel + 1;
    const levelCostMultiplier = 1 + ((nextLevel - 1) * 0.5);
    const cost = Math.floor(skill.baseCost * levelCostMultiplier * costMultiplier);
    const canAfford = player.money >= cost;

    const themeColors: any = {
        blue: { border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500', glow: 'shadow-blue-500/20' },
        green: { border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-500', glow: 'shadow-green-500/20' },
        orange: { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-500', glow: 'shadow-orange-500/20' }
    };
    const t = themeColors[colorTheme];

    return (
        <div className="relative group z-10">
            {/* Connector Line (Top) - If not Tier 1 */}
            {skill.tier > 1 && (
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 ${isLocked ? 'bg-zinc-800' : t.bg} opacity-50`}></div>
            )}

            <button 
                onClick={() => !isMaxed && !isLocked && onBuy(skill)}
                disabled={isMaxed || isLocked}
                className={`
                    w-full p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden text-left flex flex-col gap-2
                    ${isLocked 
                        ? 'bg-zinc-950 border-zinc-900 opacity-60 grayscale cursor-not-allowed' 
                        : isMaxed 
                            ? `bg-zinc-900 ${t.border} shadow-[0_0_20px_rgba(0,0,0,0.5)]` 
                            : `bg-zinc-900/80 border-zinc-700 hover:border-white ${canAfford ? 'hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}`
                    }
                `}
            >
                {/* Background circuit pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_100%)] bg-[size:20px_20px] pointer-events-none"></div>

                <div className="flex justify-between items-start relative z-10">
                    <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${isLocked ? 'border-zinc-800 text-zinc-600' : `${t.border} ${t.text} bg-black`}`}>
                        TIER {skill.tier}
                    </span>
                    {currentLevel > 0 && <span className={`text-[10px] font-mono font-bold ${t.text}`}>LVL {currentLevel}/{skill.maxLevel}</span>}
                </div>

                <div className="relative z-10">
                    <h4 className={`font-bold font-mono text-sm ${isLocked ? 'text-zinc-600' : 'text-white'}`}>{skill.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1 min-h-[2.5em] leading-relaxed">
                         {skill.description.replace('{value}', (skill.effectValue * (currentLevel || 1)).toString())}
                    </p>
                </div>

                {!isMaxed && !isLocked && (
                    <div className={`mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center text-xs font-mono relative z-10`}>
                        <span className={canAfford ? 'text-white font-bold' : 'text-zinc-600'}>${cost}</span>
                        <span className={`text-[10px] uppercase flex items-center gap-1 ${canAfford ? t.text : 'text-zinc-700'}`}>
                            {canAfford ? <>UPGRADE <ChevronRight size={10}/></> : 'FUNDS LOW'}
                        </span>
                    </div>
                )}
                
                {isMaxed && (
                     <div className={`mt-2 pt-2 border-t ${t.border} text-center text-[10px] font-bold uppercase ${t.text} relative z-10`}>
                        NEURAL LINK COMPLETE
                    </div>
                )}

                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-[1px] z-20">
                        <Lock size={24} className="text-zinc-700" />
                    </div>
                )}
            </button>
        </div>
    )
}

const SkillTree: React.FC<Props> = ({ player, onBuy }) => {
    return (
        <div className="h-full w-full bg-zinc-950 relative overflow-y-auto custom-scrollbar">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,30,35,0.8),transparent_70%)] pointer-events-none"></div>
             
             <div className="p-6 md:p-8 relative z-10">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-800">
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-pulse">
                        <BrainCircuit size={32} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white font-mono tracking-tighter">NEURAL_UPGRADES</h2>
                        <div className="flex gap-4 text-xs font-mono text-zinc-500 mt-1">
                             <span className="flex items-center gap-1"><Terminal size={12}/> SOCIAL</span>
                             <span className="flex items-center gap-1"><Cpu size={12}/> TECH</span>
                             <span className="flex items-center gap-1"><Shield size={12}/> OPS</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* SOCIAL COLUMN */}
                    <div className="flex flex-col gap-8 relative">
                        <div className="text-center font-mono text-blue-500 font-bold uppercase tracking-[0.3em] text-sm border-b border-blue-900/50 pb-2">Social Eng</div>
                        {SKILL_TREE_SOCIAL.map(skill => (
                            <SkillNode key={skill.id} skill={skill} player={player} onBuy={onBuy} colorTheme="blue" />
                        ))}
                    </div>

                    {/* TECH COLUMN */}
                     <div className="flex flex-col gap-8 relative">
                        <div className="text-center font-mono text-green-500 font-bold uppercase tracking-[0.3em] text-sm border-b border-green-900/50 pb-2">Technical</div>
                        {SKILL_TREE_TECH.map(skill => (
                            <SkillNode key={skill.id} skill={skill} player={player} onBuy={onBuy} colorTheme="green" />
                        ))}
                    </div>

                    {/* OPS COLUMN */}
                     <div className="flex flex-col gap-8 relative">
                        <div className="text-center font-mono text-orange-500 font-bold uppercase tracking-[0.3em] text-sm border-b border-orange-900/50 pb-2">Operations</div>
                        {SKILL_TREE_OPS.map(skill => (
                            <SkillNode key={skill.id} skill={skill} player={player} onBuy={onBuy} colorTheme="orange" />
                        ))}
                    </div>
                </div>
             </div>
        </div>
    );
};

import { BrainCircuit } from 'lucide-react';
export default SkillTree;
