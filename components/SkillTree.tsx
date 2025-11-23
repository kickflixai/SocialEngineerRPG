import React from 'react';
import { Terminal, Cpu, Shield, Lock, ChevronRight, BrainCircuit } from 'lucide-react';
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
        if (reqLevel === 0) isLocked = true;
    }

    // Cost Calculation
    const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
    const nextLevel = currentLevel + 1;
    const levelCostMultiplier = 1 + ((nextLevel - 1) * 0.5);
    const cost = Math.floor(skill.baseCost * levelCostMultiplier * costMultiplier);
    const canAfford = player.money >= cost;

    const themeColors: any = {
        blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500', bgHover: 'hover:border-blue-400' },
        green: { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-500', bgHover: 'hover:border-green-400' },
        orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500', bgHover: 'hover:border-orange-400' }
    };
    const t = themeColors[colorTheme];

    return (
        <div className="relative group z-10 w-full">
            {/* Connector Line (Top) */}
            {skill.tier > 1 && (
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-[2px] h-8 ${isLocked ? 'bg-zinc-900' : 'bg-zinc-700'} z-0`}></div>
            )}

            <button 
                onClick={() => !isMaxed && !isLocked && onBuy(skill)}
                disabled={isMaxed || isLocked}
                className={`
                    w-full relative text-left transition-all duration-300 group
                    flex flex-col
                    ${isLocked 
                        ? 'opacity-50 grayscale cursor-not-allowed' 
                        : ''
                    }
                `}
            >
                {/* Card Container */}
                <div className={`
                    bg-black border p-4 relative overflow-hidden transition-all
                    ${isLocked ? 'border-zinc-900' : isMaxed ? `border-zinc-700` : `border-zinc-800 ${t.bgHover} hover:bg-zinc-900`}
                `}>
                    {/* Active Indicator Strip */}
                    {currentLevel > 0 && <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.bg}`}></div>}
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isLocked ? 'text-zinc-700' : t.text}`}>
                            TIER_0{skill.tier}
                        </span>
                        {currentLevel > 0 && <span className={`text-[9px] font-mono font-bold ${t.text} bg-zinc-900 px-1`}>{currentLevel}/{skill.maxLevel}</span>}
                    </div>

                    <h4 className={`font-bold font-mono text-sm mb-1 ${isLocked ? 'text-zinc-600' : isMaxed ? 'text-zinc-400' : 'text-white'}`}>
                        {skill.name}
                    </h4>
                    
                    <p className="text-[10px] text-zinc-500 leading-relaxed min-h-[2.5em]">
                         {skill.description.replace('{value}', (skill.effectValue * (currentLevel || 1)).toString())}
                    </p>

                    {/* Footer / Price */}
                    {!isMaxed && !isLocked && (
                        <div className={`mt-3 pt-2 border-t border-zinc-900 flex justify-between items-center`}>
                            <span className={`font-mono text-xs ${canAfford ? 'text-white' : 'text-zinc-600'}`}>${cost}</span>
                            <span className={`text-[9px] uppercase flex items-center gap-1 ${canAfford ? t.text : 'text-zinc-700'}`}>
                                {canAfford ? 'INSTALL' : 'NO FUNDS'} <ChevronRight size={10}/>
                            </span>
                        </div>
                    )}
                    
                    {isMaxed && (
                         <div className={`mt-3 pt-2 border-t border-zinc-900 text-center text-[9px] font-bold uppercase text-zinc-500`}>
                            MAX_LEVEL_REACHED
                        </div>
                    )}
                    
                    {isLocked && <div className="absolute top-2 right-2 text-zinc-800"><Lock size={14}/></div>}
                </div>
            </button>
        </div>
    )
}

const SkillTree: React.FC<Props> = ({ player, onBuy }) => {
    return (
        <div className="h-full w-full bg-black relative overflow-y-auto custom-scrollbar font-mono">
             {/* Background Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(50,50,50,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(50,50,50,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
             
             <div className="p-6 md:p-8 relative z-10 max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 border border-zinc-800 bg-zinc-900">
                            <BrainCircuit size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter">NEURAL_UPGRADES</h2>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mt-1">Cybernetic Skill Trees</p>
                        </div>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Available Funds</div>
                        <div className="text-xl font-bold text-white">${player.money.toLocaleString()}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 items-start">
                    {/* SOCIAL COLUMN */}
                    <div className="flex flex-col gap-8 relative">
                        <div className="flex items-center gap-3 border-b border-blue-900/30 pb-4 mb-4">
                            <Terminal size={16} className="text-blue-500"/>
                            <span className="font-mono text-blue-500 font-bold uppercase tracking-widest text-xs">Social Engineering</span>
                        </div>
                        {SKILL_TREE_SOCIAL.map(skill => (
                            <SkillNode key={skill.id} skill={skill} player={player} onBuy={onBuy} colorTheme="blue" />
                        ))}
                    </div>

                    {/* TECH COLUMN */}
                     <div className="flex flex-col gap-8 relative">
                        <div className="flex items-center gap-3 border-b border-green-900/30 pb-4 mb-4">
                            <Cpu size={16} className="text-green-500"/>
                            <span className="font-mono text-green-500 font-bold uppercase tracking-widest text-xs">Technical Exploits</span>
                        </div>
                        {SKILL_TREE_TECH.map(skill => (
                            <SkillNode key={skill.id} skill={skill} player={player} onBuy={onBuy} colorTheme="green" />
                        ))}
                    </div>

                    {/* OPS COLUMN */}
                     <div className="flex flex-col gap-8 relative">
                        <div className="flex items-center gap-3 border-b border-orange-900/30 pb-4 mb-4">
                            <Shield size={16} className="text-orange-500"/>
                            <span className="font-mono text-orange-500 font-bold uppercase tracking-widest text-xs">Operations Security</span>
                        </div>
                        {SKILL_TREE_OPS.map(skill => (
                            <SkillNode key={skill.id} skill={skill} player={player} onBuy={onBuy} colorTheme="orange" />
                        ))}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default SkillTree;