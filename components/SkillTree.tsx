
import React from 'react';
import { AlertOctagon, Terminal, Cpu, Shield, Lock, Unlock } from 'lucide-react';
import { PlayerState, SkillDefinition } from '../types';
import { SKILL_TREE_SOCIAL, SKILL_TREE_TECH, SKILL_TREE_OPS, COUNTRY_DATA } from '../constants';

interface Props {
    player: PlayerState;
    onBuy: (skill: SkillDefinition) => void;
}

const SkillBranch: React.FC<{ title: string, color: string, skills: SkillDefinition[], player: PlayerState, onBuy: (s: SkillDefinition) => void, icon: React.ReactNode }> = ({ title, color, skills, player, onBuy, icon }) => {
    const colors: any = {
        blue: 'text-blue-400 border-blue-500/30 bg-blue-500',
        green: 'text-green-400 border-green-500/30 bg-green-500',
        orange: 'text-orange-400 border-orange-500/30 bg-orange-500'
    };

    return (
        <div className="space-y-4">
            <h3 className={`font-mono text-sm uppercase tracking-widest border-b pb-4 mb-2 flex items-center gap-2 ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
                {icon} {title}
            </h3>
            <div className="space-y-4 relative">
                {/* Vertical Line connecting nodes */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-zinc-800 -z-10"></div>
                
                {skills.map((skill, index) => {
                    const currentLevel = player.skills[skill.id] || 0;
                    const isMaxed = currentLevel >= skill.maxLevel;
                    
                    // Check Requirements
                    let isLocked = false;
                    if (skill.requiredSkillId) {
                        const reqSkill = skills.find(s => s.id === skill.requiredSkillId);
                        const reqLevel = player.skills[skill.requiredSkillId] || 0;
                        if (reqSkill && reqLevel < reqSkill.maxLevel) {
                            isLocked = true;
                        }
                    }

                    // Cost Calculation
                    const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
                    const nextLevel = currentLevel + 1;
                    const levelCostMultiplier = 1 + ((nextLevel - 1) * 0.5);
                    const cost = Math.floor(skill.baseCost * levelCostMultiplier * costMultiplier);
                    const canAfford = player.money >= cost;

                    return (
                        <div key={skill.id} className={`relative bg-zinc-900/80 border p-4 rounded-xl transition-all ${isLocked ? 'border-zinc-800 opacity-50' : 'border-zinc-700'}`}>
                            {isLocked && <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center rounded-xl"><Lock size={16} className="text-zinc-500"/></div>}
                            
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${currentLevel > 0 ? colors[color].replace('text-', 'bg-').split(' ')[2] + ' text-black border-transparent' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
                                        <span className="font-bold text-xs">{skill.tier}</span>
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${currentLevel > 0 ? 'text-white' : 'text-zinc-500'}`}>{skill.name}</h4>
                                        <div className="flex gap-1 mt-1">
                                            {Array.from({length: skill.maxLevel}).map((_, i) => (
                                                <div key={i} className={`w-2 h-2 rounded-sm ${i < currentLevel ? colors[color].replace('text-', 'bg-').split(' ')[2] : 'bg-zinc-800'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {currentLevel > 0 && <span className="text-[10px] font-mono text-green-500 bg-green-900/20 px-2 py-0.5 rounded">LVL {currentLevel}</span>}
                            </div>
                            
                            <p className="text-zinc-500 text-xs mb-3 min-h-[2.5em]">
                                {skill.description.replace('{value}', (skill.effectValue * (currentLevel || 1)).toString())}
                            </p>

                            {!isMaxed && !isLocked && (
                                <button 
                                    onClick={() => onBuy(skill)}
                                    disabled={!canAfford}
                                    className={`w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${canAfford ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
                                >
                                    {canAfford ? <Unlock size={10}/> : <Lock size={10}/>}
                                    Upgrade ${cost}
                                </button>
                            )}
                            {isMaxed && (
                                <div className="w-full py-1.5 bg-green-900/20 text-green-500 text-[10px] font-bold text-center rounded uppercase border border-green-500/20">
                                    MAXED OUT
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SkillTree: React.FC<Props> = ({ player, onBuy }) => {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"><AlertOctagon size={24} className="text-blue-500" /></div>
                <div><h2 className="text-3xl font-bold text-white font-mono">NEURAL ENHANCEMENTS</h2></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <SkillBranch title="Social Engineering" color="blue" skills={SKILL_TREE_SOCIAL} player={player} onBuy={onBuy} icon={<Terminal size={16}/>} />
                <SkillBranch title="Technical Intel" color="green" skills={SKILL_TREE_TECH} player={player} onBuy={onBuy} icon={<Cpu size={16}/>} />
                <SkillBranch title="Operations" color="orange" skills={SKILL_TREE_OPS} player={player} onBuy={onBuy} icon={<Shield size={16}/>} />
            </div>
        </div>
    );
};

export default SkillTree;
