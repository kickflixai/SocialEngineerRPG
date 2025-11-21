
import React, { useState } from 'react';
import { GameView, PlayerState, ScamState, PlayerAttributes, Skill, ScamObjective } from './types';
import { INITIAL_MONEY, INITIAL_THREAT, SCAM_CATEGORIES, MAX_THREAT, SKILLS, SHOP_ITEMS, COUNTRY_DATA, SCAM_SCENARIOS, ACHIEVEMENTS } from './constants';
import { generateVictim, generateOpener } from './services/geminiService';

import CharacterCreator from './components/CharacterCreator';
import Dashboard from './components/Dashboard';
import ScamInterface from './components/ScamInterface';
import VictimDossier from './components/VictimDossier';
import LandingScreen from './components/LandingScreen'; 
import { Siren, Skull, ArrowLeft, Cpu, AlertOctagon, Terminal, Shield } from 'lucide-react';

const App: React.FC = () => {
  // Start at LANDING view
  const [view, setView] = useState<GameView>(GameView.LANDING);
  const [player, setPlayer] = useState<PlayerState>({
    attributes: { name: '', gender: '', age: '', country: '', archetype: '', clothing: '', facialFeatures: '', accessories: '', avatarUrl: '' },
    money: INITIAL_MONEY,
    threatLevel: INITIAL_THREAT,
    scamsCompleted: 0,
    inventory: [],
    skills: [],
    achievements: []
  });
  
  const [activeScam, setActiveScam] = useState<ScamState | null>(null);
  const [loadingScam, setLoadingScam] = useState(false);
  const [generatingOpener, setGeneratingOpener] = useState(false);

  // Handle Start from Landing Screen
  const handleStart = () => {
      setView(GameView.CHARACTER_CREATION);
  };

  const handleCharacterComplete = (attrs: PlayerAttributes) => {
    // Retrieve Country Data
    const countryStats = COUNTRY_DATA[attrs.country] || COUNTRY_DATA['USA'];

    // Merge Country Stats into Initial Player State
    setPlayer({
        attributes: attrs,
        money: countryStats.startingMoney,
        threatLevel: countryStats.startingThreat,
        scamsCompleted: 0,
        inventory: [...countryStats.startingItems],
        skills: [...countryStats.startingSkills],
        achievements: []
    });

    setView(GameView.DASHBOARD);
  };

  // Step 1: Find a Target (Generates Victim, goes to Dossier)
  const findTarget = async (difficulty: 'easy' | 'medium' | 'hard') => {
    setLoadingScam(true);
    try {
        const victim = await generateVictim(difficulty);
        
        // Apply Country Trust/Suspicion Modifiers
        const countryStats = COUNTRY_DATA[player.attributes.country];
        const trustMod = countryStats?.modifiers?.trustBonus || 0;
        const suspicionMod = countryStats?.modifiers?.suspicionStart || 0;

        let baseTrust = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 20 : 0;
        
        setActiveScam({
            victim,
            category: '', // Selected in Dossier
            objectives: [], // Set in finalizeScam
            history: [],
            trust: Math.max(0, Math.min(100, baseTrust + trustMod)),
            suspicion: Math.max(0, Math.min(100, suspicionMod)),
            status: 'active',
            revealedFacts: []
        });
        
        setView(GameView.VICTIM_DOSSIER);
    } catch (e) {
        alert("Failed to find target. Network busy or API Key invalid.");
    } finally {
        setLoadingScam(false);
    }
  };

  // Step 2: Launch Scam (Generates Opener, goes to Chat)
  const finalizeScam = async (category: string) => {
      if (!activeScam) return;
      setGeneratingOpener(true);
      try {
          const opener = await generateOpener(category, activeScam.victim);
          
          // Select a random scenario based on the category
          const scenarios = SCAM_SCENARIOS[category] || SCAM_SCENARIOS["Grandson in Trouble"];
          const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

          // Build the 3-step objective array
          const objectives: ScamObjective[] = [
              { id: '1', description: randomScenario.mini1, isCompleted: false, isFinal: false, order: 1 },
              { id: '2', description: randomScenario.mini2, isCompleted: false, isFinal: false, order: 2 },
              { id: '3', description: randomScenario.final, isCompleted: false, isFinal: true, order: 3 }
          ];

          setActiveScam(prev => prev ? ({
              ...prev,
              category: category,
              objectives: objectives,
              history: [{ sender: 'player', text: opener, timestamp: Date.now() }]
          }) : null);
          setView(GameView.ACTIVE_SCAM);
      } catch (e) {
          console.error(e);
          alert("Failed to establish connection.");
      } finally {
          setGeneratingOpener(false);
      }
  };

  const handleAbortScam = () => {
      // Removed native confirm to let ScamInterface handle UI confirmation
      const penalty = 15;
      const newThreat = Math.min(MAX_THREAT, player.threatLevel + penalty);
      
      setPlayer(prev => ({ ...prev, threatLevel: newThreat }));
      setActiveScam(null);
      
      if (newThreat >= MAX_THREAT) {
          setView(GameView.GAME_OVER);
      } else {
          setView(GameView.DASHBOARD);
      }
  };

  const checkAchievements = (outcome: 'success' | 'failed' | 'police', currentScam: ScamState, moneyChange: number) => {
      const unlocked = [...player.achievements];
      const add = (id: string) => { if (!unlocked.includes(id)) unlocked.push(id); };

      if (outcome === 'success') {
          add('first_blood');
          if (player.money + moneyChange >= 20000) add('high_roller');
          if (currentScam.suspicion === 0) add('untouchable');
          if (currentScam.suspicion > 90) add('close_call');

          // Category specific
          if (currentScam.category === "Grandson in Trouble") add('ach_grandson');
          if (currentScam.category === "IRS Tax Audit") add('ach_irs');
          if (currentScam.category === "Tech Support Virus") add('ach_tech');
          if (currentScam.category === "Lottery Winner") add('ach_lotto');
          if (currentScam.category === "Crypto Investment Opportunity") add('ach_crypto');
          if (currentScam.category === "Romance Scam") add('ach_romance');
          if (currentScam.category === "Business Email Compromise") add('ach_bec');
          if (currentScam.category === "Kidnapping Hoax") add('ach_kidnap');
          if (currentScam.category === "Charity Fraud") add('ach_charity');
          if (currentScam.category === "Inheritance Advance Fee") add('ach_inherit');
          if (currentScam.category === "Employment Mule Scam") add('ach_mule');
      }

      return unlocked;
  };

  const handleScamEnd = (result: 'success' | 'failed' | 'police') => {
    if (!activeScam) return;

    let moneyChange = 0;
    let threatChange = 0;

    // Retrieve stats
    const countryStats = COUNTRY_DATA[player.attributes.country];
    const payoutMult = countryStats?.modifiers?.payoutMultiplier || 1.0;
    const threatMult = countryStats?.modifiers?.threatMultiplier || 1.0;

    if (result === 'success') {
        const baseReward = activeScam.victim.difficulty === 'easy' ? 1500 : activeScam.victim.difficulty === 'medium' ? 5000 : 15000;
        const skillMult = player.skills.includes('money_laundering') ? 1.15 : 1.0;
        
        // Calculate final reward with multipliers
        const totalMult = payoutMult * skillMult;
        moneyChange = Math.floor((baseReward + Math.floor(Math.random() * 1000)) * totalMult);
        
        // Check Achievements
        const newAchievements = checkAchievements('success', activeScam, moneyChange);

        setPlayer(prev => ({ 
            ...prev, 
            money: prev.money + moneyChange,
            scamsCompleted: prev.scamsCompleted + 1,
            achievements: newAchievements
        }));
        // Delay for effect is handled by UI overlay
        setTimeout(() => {
            const newThreat = Math.min(MAX_THREAT, player.threatLevel);
            setPlayer(prev => ({ ...prev, threatLevel: newThreat }));
            setActiveScam(null);
            setView(GameView.DASHBOARD);
        }, 3000);
        return;

    } else if (result === 'police') {
        threatChange = 25;
        if (player.skills.includes('vpn_tunnel')) threatChange = 12;
        if (player.skills.includes('legal_retainer') && Math.random() < 0.1) {
            threatChange = 0;
            alert("Legal Team blocked the police report!");
        }
    } else {
        threatChange = 10;
        if (player.skills.includes('vpn_tunnel')) threatChange = 5;
    }

    // Apply Threat Multiplier
    threatChange = Math.ceil(threatChange * threatMult);
    const newThreat = Math.min(MAX_THREAT, player.threatLevel + threatChange);
    
    setTimeout(() => {
        setPlayer(prev => ({ ...prev, threatLevel: newThreat }));
        setActiveScam(null);

        if (newThreat >= MAX_THREAT) {
            setView(GameView.GAME_OVER);
        } else {
            setView(GameView.DASHBOARD);
        }
    }, 3000);
  };

  const buyItem = (item: typeof SHOP_ITEMS[0]) => {
      // Check for China trait
      const countryStats = COUNTRY_DATA[player.attributes.country];
      const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
      const finalCost = Math.floor(item.cost * costMultiplier);

      if (player.money >= finalCost) {
          if (item.effect === 'reset_threat') {
              setPlayer(prev => ({ ...prev, money: prev.money - finalCost, threatLevel: 0 }));
          } else if (item.effect === 'reduce_threat') {
               setPlayer(prev => ({ ...prev, money: prev.money - finalCost, threatLevel: Math.max(0, prev.threatLevel - 20) }));
          } else if (item.effect === 'reduce_threat_major') {
               setPlayer(prev => ({ ...prev, money: prev.money - finalCost, threatLevel: Math.max(0, prev.threatLevel - 50) }));
          } else {
              setPlayer(prev => ({ 
                  ...prev, 
                  money: prev.money - finalCost,
                  inventory: [...prev.inventory, item.id]
              }));
          }
      }
  };

  const buySkill = (skill: typeof SKILLS[0]) => {
      // Check for China trait
      const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
      const finalCost = Math.floor(skill.cost * costMultiplier);

      if (player.money >= finalCost && !player.skills.includes(skill.id)) {
          setPlayer(prev => ({
              ...prev,
              money: prev.money - finalCost,
              skills: [...prev.skills, skill.id]
          }));
      }
  };

  if (view === GameView.GAME_OVER) {
      return (
          <div className="w-screen h-[100dvh] bg-red-950 flex items-center justify-center flex-col text-red-500 space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <Siren size={120} className="animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
              <div className="text-center z-10">
                  <h1 className="text-6xl md:text-8xl font-bold font-mono mb-4 tracking-tighter">BUSTED</h1>
                  <p className="text-white text-xl md:text-2xl font-mono uppercase tracking-widest px-4">Federal Agents have seized your assets</p>
              </div>
              <button onClick={() => window.location.reload()} className="px-10 py-4 bg-red-600 text-white rounded hover:bg-red-500 font-bold z-10 shadow-lg hover:shadow-red-500/50 transition-all">
                  TERMINATE SESSION & RETRY
              </button>
          </div>
      );
  }

  return (
    <div className="w-screen h-[100dvh] bg-zinc-950 text-gray-100 font-sans overflow-hidden flex flex-col relative selection:bg-green-500/30 selection:text-green-200">
        {/* Global Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0)_2px,transparent_2px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-20"></div>
        
        {/* Header */}
        {view !== GameView.LANDING && view !== GameView.CHARACTER_CREATION && (
            <header className="h-16 md:h-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-50 shrink-0">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 rounded flex items-center justify-center border border-green-500/30">
                        <Skull size={20} className="text-green-500 md:w-6 md:h-6"/>
                    </div>
                    <div>
                        <h1 className="font-mono font-bold text-white text-sm md:text-lg tracking-tighter">SCAM_SIM<span className="text-green-500">_V2</span></h1>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest hidden md:block">Dark Web Interface // Secured</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase hidden md:block">Available Funds</p>
                        <p className="text-sm md:text-xl font-mono text-white font-bold">${player.money.toLocaleString()}</p>
                    </div>
                    {/* Hide Dashboard button in Dossier and Active Scam to prevent easy exit */}
                    {view !== GameView.DASHBOARD && view !== GameView.VICTIM_DOSSIER && view !== GameView.ACTIVE_SCAM && (
                        <button 
                            onClick={() => setView(GameView.DASHBOARD)} 
                            className="px-3 py-2 md:px-4 md:py-2 bg-zinc-900 border border-zinc-700 hover:border-white rounded text-xs md:text-sm text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={14}/> <span className="hidden md:inline">Dashboard</span>
                        </button>
                    )}
                </div>
            </header>
        )}

        <main className="flex-1 overflow-hidden relative z-40">
            
            {view === GameView.LANDING && (
                <LandingScreen onStart={handleStart} />
            )}

            {view === GameView.CHARACTER_CREATION && (
                <div className="h-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black overflow-y-auto custom-scrollbar">
                    <CharacterCreator onComplete={handleCharacterComplete} />
                </div>
            )}

            {view === GameView.DASHBOARD && (
                <Dashboard player={player} onChangeView={setView} />
            )}
            
            {view === GameView.VICTIM_DOSSIER && activeScam && (
                <VictimDossier 
                    victim={activeScam.victim} 
                    player={player} 
                    onExecute={finalizeScam}
                    onAbort={handleAbortScam}
                    loading={generatingOpener}
                />
            )}

            {view === GameView.ACTIVE_SCAM && activeScam && (
                <ScamInterface 
                    scam={activeScam} 
                    player={player} 
                    onUpdateScam={setActiveScam} 
                    onScamEnd={handleScamEnd} 
                    onAbort={handleAbortScam}
                />
            )}

            {view === GameView.SCAM_SELECTION && (
                <div className="flex items-center justify-center h-full p-4 md:p-8 overflow-y-auto custom-scrollbar">
                    {loadingScam ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-green-500 font-mono animate-pulse text-lg md:text-xl text-center">SCANNING DARK WEB DIRECTORY...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl w-full pb-8">
                            {/* Tier 1 */}
                            <button onClick={() => findTarget('easy')} className="relative group bg-zinc-900 border border-zinc-800 hover:border-green-500 rounded-2xl p-6 md:p-8 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                                <div className="mb-4 md:mb-6 text-green-500 font-mono font-bold text-sm tracking-widest">TIER 1 // LOW YIELD</div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">The Elderly</h3>
                                <p className="text-zinc-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">Targets with low digital literacy and high isolation. Easy to manipulate emotionally.</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-zinc-500 font-mono text-sm">$500 - $2,000</span>
                                    <span className="text-green-400 group-hover:translate-x-2 transition-transform text-sm">Scan &rarr;</span>
                                </div>
                            </button>

                            {/* Tier 2 */}
                            <button 
                                onClick={() => findTarget('medium')} 
                                disabled={player.scamsCompleted < 2}
                                className="relative group bg-zinc-900 border border-zinc-800 hover:border-yellow-500 rounded-2xl p-6 md:p-8 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                                <div className="mb-4 md:mb-6 text-yellow-500 font-mono font-bold text-sm tracking-widest">TIER 2 // MID YIELD</div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">Small Business</h3>
                                <p className="text-zinc-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">Busy professionals or shop owners. Requires logical consistency.</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-zinc-500 font-mono text-sm">$5k - $15k</span>
                                    {player.scamsCompleted < 2 ? <span className="text-red-500 text-xs">LOCKED (2 Wins)</span> : <span className="text-yellow-400 group-hover:translate-x-2 transition-transform text-sm">Scan &rarr;</span>}
                                </div>
                            </button>

                            {/* Tier 3 */}
                            <button 
                                onClick={() => findTarget('hard')} 
                                disabled={player.scamsCompleted < 5}
                                className="relative group bg-zinc-900 border border-zinc-800 hover:border-red-500 rounded-2xl p-6 md:p-8 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                                <div className="mb-4 md:mb-6 text-red-500 font-mono font-bold text-sm tracking-widest">TIER 3 // HIGH YIELD</div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">The Executive</h3>
                                <p className="text-zinc-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">C-Suite targets. Zero trust baseline. Requires perfect intel.</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-zinc-500 font-mono text-sm">$50k+</span>
                                    {player.scamsCompleted < 5 ? <span className="text-red-500 text-xs">LOCKED (5 Wins)</span> : <span className="text-red-400 group-hover:translate-x-2 transition-transform text-sm">Scan &rarr;</span>}
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {view === GameView.SHOP && (
                <div className="p-6 md:p-12 max-w-7xl mx-auto pb-24 h-full overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 mb-8 md:mb-12">
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Cpu size={24} className="text-purple-500 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">BLACK MARKET</h2>
                            <p className="text-zinc-400 text-sm md:text-base">Hardware and services to mitigate risk.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {SHOP_ITEMS.map(item => {
                            // Check cost modifiers (China)
                            const countryStats = COUNTRY_DATA[player.attributes.country];
                            const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
                            const finalCost = Math.floor(item.cost * costMultiplier);
                            const canAfford = player.money >= finalCost;
                            
                            return (
                                <div key={item.id} className={`bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 rounded-2xl flex flex-col justify-between transition-all group backdrop-blur-sm ${canAfford ? 'hover:border-purple-500/50' : 'opacity-50 grayscale cursor-not-allowed'}`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className={`font-bold text-lg md:text-xl transition-colors ${canAfford ? 'text-white group-hover:text-purple-400' : 'text-zinc-500'}`}>{item.name}</h3>
                                            <span className={`${canAfford ? 'text-purple-500' : 'text-zinc-600'} font-mono text-sm font-bold`}>${finalCost}</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => buyItem(item)}
                                        disabled={!canAfford}
                                        className={`mt-6 md:mt-8 w-full py-3 rounded-lg font-bold shadow-lg transition-all ${canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                                    >
                                        {canAfford ? 'Purchase Unit' : 'Insufficient Funds'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {view === GameView.SKILL_TREE && (
                 <div className="p-6 md:p-12 max-w-7xl mx-auto pb-24 h-full overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 mb-8 md:mb-12">
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <AlertOctagon size={24} className="text-blue-500 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">NEURAL ENHANCEMENTS</h2>
                            <p className="text-zinc-400 text-sm md:text-base">Cognitive upgrades to improve success rates.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Social Column */}
                        <div className="space-y-6 flex flex-col">
                            <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest border-b border-blue-500/20 pb-4 mb-2 flex items-center gap-2">
                                <Terminal size={14}/> Social Engineering
                            </h3>
                            <div className="space-y-6 flex-1">
                                {SKILLS.filter(s => s.category === 'social').map(skill => (
                                    <SkillCard key={skill.id} skill={skill} player={player} onBuy={() => buySkill(skill)} color="blue" />
                                ))}
                            </div>
                        </div>
                         {/* Tech Column */}
                         <div className="space-y-6 flex flex-col">
                            <h3 className="text-green-400 font-mono text-sm uppercase tracking-widest border-b border-green-500/20 pb-4 mb-2 flex items-center gap-2">
                                <Cpu size={14}/> Technical Intel
                            </h3>
                            <div className="space-y-6 flex-1">
                                {SKILLS.filter(s => s.category === 'tech').map(skill => (
                                    <SkillCard key={skill.id} skill={skill} player={player} onBuy={() => buySkill(skill)} color="green" />
                                ))}
                            </div>
                        </div>
                         {/* Ops Column */}
                         <div className="space-y-6 flex flex-col">
                            <h3 className="text-orange-400 font-mono text-sm uppercase tracking-widest border-b border-orange-500/20 pb-4 mb-2 flex items-center gap-2">
                                <Shield size={14}/> Operations
                            </h3>
                            <div className="space-y-6 flex-1">
                                {SKILLS.filter(s => s.category === 'ops').map(skill => (
                                    <SkillCard key={skill.id} skill={skill} player={player} onBuy={() => buySkill(skill)} color="orange" />
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
            )}
        </main>
    </div>
  );
};

// Helper component for Skills
const SkillCard: React.FC<{ skill: Skill, player: PlayerState, onBuy: () => void, color: string }> = ({ skill, player, onBuy, color }) => {
    const isOwned = player.skills.includes(skill.id);
    // Add check to prevent crash if country is not yet set in player attributes (e.g. initial state)
    const countryStats = player.attributes.country ? COUNTRY_DATA[player.attributes.country] : null;
    const costMultiplier = countryStats?.id === 'China' ? 1.2 : 1.0;
    const finalCost = Math.floor(skill.cost * costMultiplier);
    const canAfford = player.money >= finalCost;
    
    const colors: any = {
        blue: 'border-blue-500/30 text-blue-400 bg-blue-600',
        green: 'border-green-500/30 text-green-400 bg-green-600',
        orange: 'border-orange-500/30 text-orange-400 bg-orange-600'
    };

    return (
        <div className={`bg-zinc-900/80 border p-6 rounded-xl relative overflow-hidden transition-all group shadow-lg ${
            isOwned 
            ? 'border-zinc-700 opacity-70' 
            : canAfford 
                ? `border-zinc-800 hover:-translate-y-1 hover:${colors[color].split(' ')[0]}`
                : 'border-zinc-800 opacity-50 grayscale cursor-not-allowed'
        }`}>
             {isOwned && <div className="absolute top-0 right-0 bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 uppercase">Installed</div>}
             <h3 className={`font-bold text-lg flex items-center gap-2 ${isOwned ? 'text-zinc-500' : canAfford ? 'text-white' : 'text-zinc-600'}`}>
                {skill.name}
             </h3>
             <p className="text-zinc-500 text-xs mt-2 mb-4 leading-relaxed">{skill.description}</p>
             <button 
                onClick={onBuy}
                disabled={!canAfford || isOwned}
                className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                    isOwned 
                    ? 'bg-zinc-800 text-zinc-600 cursor-default' 
                    : canAfford
                        ? `${colors[color].split(' ').pop()} hover:brightness-110 text-white shadow-lg`
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
            >
                {isOwned ? 'Active' : canAfford ? `Install $${finalCost}` : 'Insufficient Funds'}
            </button>
        </div>
    );
};

export default App;
