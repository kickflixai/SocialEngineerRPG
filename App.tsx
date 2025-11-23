
import React, { useState, useEffect } from 'react';
import { GameView, PlayerState, ScamState, PlayerAttributes, SkillDefinition, ScamObjective, ShopItem, ScamHistoryItem } from './types';
import { INITIAL_MONEY, INITIAL_THREAT, MAX_THREAT, SHOP_ITEMS, COUNTRY_DATA, SCAM_SCENARIOS, AI_COSTS } from './constants';
import { generateVictim, generateOpener, generateScamSummary } from './services/geminiService';
import { audioManager } from './services/audioService';

import CharacterCreator from './components/CharacterCreator';
import Dashboard from './components/Dashboard';
import ScamInterface from './components/ScamInterface';
import VictimDossier from './components/VictimDossier';
import LandingScreen from './components/LandingScreen'; 
import InventoryModal from './components/InventoryModal';
import ScamResult from './components/ScamResult';
import Shop from './components/Shop';
import SkillTree from './components/SkillTree';
import ScamSelection from './components/ScamSelection';
import { Siren, ArrowLeft, Volume2, VolumeX, Terminal, Activity } from 'lucide-react';

const STORAGE_KEY = 'SCAM_SIM_SAVE_V1';

const App: React.FC = () => {
  // Start at LANDING view
  const [view, setView] = useState<GameView>(GameView.LANDING);
  
  // Initial Player State
  const [player, setPlayer] = useState<PlayerState>({
    attributes: { name: '', gender: '', age: '', country: '', archetype: '', clothing: '', facialFeatures: '', accessories: '', avatarUrl: '' },
    money: INITIAL_MONEY,
    threatLevel: INITIAL_THREAT,
    scamsCompleted: 0,
    inventory: [],
    skills: {}, // Now a map of ID -> Level
    achievements: [],
    history: [],
    stats: { textRequests: 0, imageRequests: 0, totalCost: 0 }
  });
  
  const [activeScam, setActiveScam] = useState<ScamState | null>(null);
  const [loadingScam, setLoadingScam] = useState(false);
  const [generatingOpener, setGeneratingOpener] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [highValueTargetActive, setHighValueTargetActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Last Result for Result Screen
  const [lastResult, setLastResult] = useState<{
      outcome: 'success' | 'failed' | 'police', 
      moneyChange: number, 
      threatChange: number, 
      victimName: string, 
      reason?: string,
      victimAvatar: string,
      victimFlavor: string,
      summary: string[],
      victimAftermath?: string
    } | null>(null);

  // Save Data Summary for Landing Screen
  const [saveSummary, setSaveSummary] = useState<{name: string, money: number, threat: number} | null>(null);

  // 1. Check for Save on Mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.player && data.player.attributes) {
          setSaveSummary({
            name: data.player.attributes.name || 'Unknown Agent',
            money: data.player.money,
            threat: data.player.threatLevel
          });
        }
      } catch (e) {
        console.error("Save file corrupt", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // 2. Auto-Save Logic with Quota Handling & Debounce
  useEffect(() => {
    if (view === GameView.LANDING || view === GameView.CHARACTER_CREATION || view === GameView.GAME_OVER) return;
    
    const saveGame = () => {
        const gameState = {
            player,
            activeScam,
            view,
            highValueTargetActive,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn("LocalStorage quota exceeded. Compressing history...");
                const optimizedHistory = player.history.map((item, index) => {
                    if (index < 5) return item; 
                    return { ...item, victimAvatar: '' }; 
                });
                const optimizedPlayer = { ...player, history: optimizedHistory };
                const optimizedState = { ...gameState, player: optimizedPlayer };
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedState));
                } catch (e2) {
                    console.error("Critical Save Failure.", e2);
                }
            }
        }
    };

    const timeoutId = setTimeout(saveGame, 1000);
    return () => clearTimeout(timeoutId);

  }, [player, activeScam, view, highValueTargetActive]);


  useEffect(() => {
      if (view === GameView.LANDING) return;
      if (view === GameView.ACTIVE_SCAM) {
          audioManager.stopDashboardTheme();
          return;
      }
      if (loadingScam) {
          audioManager.stopDashboardTheme();
          return;
      }
      audioManager.startDashboardTheme();
  }, [view, loadingScam]);

  const toggleAudio = () => {
      const muted = audioManager.toggleMute();
      setIsMuted(muted);
  };

  const trackUsage = (type: 'text' | 'image') => {
      setPlayer(prev => {
          const cost = type === 'text' ? AI_COSTS.TEXT_REQUEST : AI_COSTS.IMAGE_REQUEST;
          return {
              ...prev,
              stats: {
                  ...prev.stats,
                  textRequests: prev.stats.textRequests + (type === 'text' ? 1 : 0),
                  imageRequests: prev.stats.imageRequests + (type === 'image' ? 1 : 0),
                  totalCost: prev.stats.totalCost + cost
              }
          };
      });
  };

  // --- ACTION HANDLERS ---

  const handleResumeGame = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (!data.player.stats) data.player.stats = { textRequests: 0, imageRequests: 0, totalCost: 0 };
        // Migration for Skills (Array to Map)
        if (Array.isArray(data.player.skills)) {
            const skillMap: Record<string, number> = {};
            data.player.skills.forEach((id: string) => { skillMap[id] = 1; });
            data.player.skills = skillMap;
        }
        setPlayer(data.player);
        setActiveScam(data.activeScam);
        setHighValueTargetActive(data.highValueTargetActive);
        setView(data.view);
        audioManager.playSuccess();
      } catch (e) {
        alert("Save data corrupted.");
        handleNewGame();
      }
    }
  };

  const handleNewGame = () => {
    if (saveSummary && !window.confirm("Starting a new system will erase your current progress. Are you sure?")) {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setSaveSummary(null);
    setPlayer({
        attributes: { name: '', gender: '', age: '', country: '', archetype: '', clothing: '', facialFeatures: '', accessories: '', avatarUrl: '' },
        money: INITIAL_MONEY,
        threatLevel: INITIAL_THREAT,
        scamsCompleted: 0,
        inventory: [],
        skills: {},
        achievements: [],
        history: [],
        stats: { textRequests: 0, imageRequests: 0, totalCost: 0 }
    });
    setActiveScam(null);
    setHighValueTargetActive(false);
    audioManager.startDashboardTheme();
    audioManager.playSuccess();
    setView(GameView.CHARACTER_CREATION);
  };

  const handleCharacterComplete = (attrs: PlayerAttributes) => {
    audioManager.playSuccess();
    trackUsage('image'); 
    const countryStats = COUNTRY_DATA[attrs.country] || COUNTRY_DATA['USA'];
    
    // Convert starting skill IDs to Map, counting duplicates as levels
    const skillMap: Record<string, number> = {};
    countryStats.startingSkills.forEach(id => {
        skillMap[id] = (skillMap[id] || 0) + 1;
    });

    setPlayer(prev => ({
        ...prev,
        attributes: attrs,
        money: countryStats.startingMoney,
        threatLevel: countryStats.startingThreat,
        scamsCompleted: 0,
        inventory: [...countryStats.startingItems],
        skills: skillMap,
        achievements: [],
        history: []
    }));
    setView(GameView.DASHBOARD);
  };

  const handleConsumeItem = (item: ShopItem) => {
      audioManager.playClick();
      const newInventory = [...player.inventory];
      const index = newInventory.indexOf(item.id);
      if (index > -1) {
          newInventory.splice(index, 1);
          setPlayer(prev => ({ ...prev, inventory: newInventory }));
      }
      if (item.effect === 'reduce_threat') {
          setPlayer(prev => ({ ...prev, threatLevel: Math.max(0, prev.threatLevel - 20) }));
          alert("Burner phone used. Threat reduced by 20.");
      } else if (item.effect === 'reduce_threat_major') {
          setPlayer(prev => ({ ...prev, threatLevel: Math.max(0, prev.threatLevel - 50) }));
          alert("Bribe accepted. Threat reduced by 50.");
      } else if (item.effect === 'reset_threat') {
          setPlayer(prev => ({ ...prev, threatLevel: 0 }));
          alert("Digital footprint wiped. Threat level reset.");
      } else if (item.effect === 'high_value_target') {
          setHighValueTargetActive(true);
          alert("Data leak purchased. Next target will be High Value.");
      }
      return item;
  };

  const findTarget = async (difficulty: 'easy' | 'medium' | 'hard') => {
    audioManager.startScanLoop(); 
    setLoadingScam(true);
    try {
        trackUsage('text'); 
        const victim = await generateVictim(difficulty);
        trackUsage('image'); 
        
        const countryStats = COUNTRY_DATA[player.attributes.country];
        const trustBonus = countryStats?.modifiers?.trustStartBonus || 0;
        let baseTrust = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 20 : 0;
        
        setActiveScam({
            victim,
            category: '', 
            objectives: [], 
            history: [],
            trust: Math.max(0, Math.min(100, baseTrust + trustBonus)),
            suspicion: 0, 
            socialCharge: 0,
            status: 'active',
            revealedFacts: [],
            isHighValue: highValueTargetActive
        });

        if (highValueTargetActive) {
            setHighValueTargetActive(false); 
        }
        setView(GameView.VICTIM_DOSSIER);
    } catch (e) {
        alert("Failed to find target. Network busy or API Key invalid.");
    } finally {
        audioManager.stopScanLoop(); 
        setLoadingScam(false);
    }
  };

  const finalizeScam = async (category: string) => {
      if (!activeScam) return;
      audioManager.playSuccess();
      setGeneratingOpener(true);
      try {
          trackUsage('text');
          const opener = await generateOpener(category, activeScam.victim);
          
          const scenarios = SCAM_SCENARIOS[category] || SCAM_SCENARIOS["Grandson in Trouble"];
          const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

          const objectives: ScamObjective[] = [
              { id: '1', description: randomScenario.mini1, isCompleted: false, isFinal: false, order: 1 },
              { id: '2', description: randomScenario.mini2, isCompleted: false, isFinal: false, order: 2 },
              { id: '3', description: randomScenario.final, isCompleted: false, isFinal: true, order: 3 }
          ];

          setActiveScam(prev => prev ? ({
              ...prev,
              category: category,
              objectives: objectives,
              history: [{ sender: 'player', text: opener, timestamp: Date.now() }],
              trust: prev.trust
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
      audioManager.playFailure();
      let penalty = 15;
      
      // VPN Tunneling (Ops 1)
      const vpnLevel = player.skills['ops_1'] || 0;
      if (vpnLevel > 0) {
          penalty = Math.ceil(penalty * (1 - (vpnLevel * 0.05))); // 5% per level reduction
      }

      const newThreat = Math.min(MAX_THREAT, player.threatLevel + penalty);
      
      // Handle scam end with 'failed' status to generate summary
      if (activeScam) {
          handleScamEnd('failed', 'Aborted by User');
      } else {
          setPlayer(prev => ({ ...prev, threatLevel: newThreat }));
          if (newThreat >= MAX_THREAT) {
              setView(GameView.GAME_OVER);
              localStorage.removeItem(STORAGE_KEY);
          } else {
              setView(GameView.DASHBOARD);
          }
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
          // ... (Rest of achievements logic remains same based on category string)
      }
      return unlocked;
  };

  const handleScamEnd = async (result: 'success' | 'failed' | 'police', reason?: string) => {
    if (!activeScam) return;

    let moneyChange = 0;
    let threatChange = 0;
    let summary: string[] = [];
    let victimAftermath = "";

    const countryStats = COUNTRY_DATA[player.attributes.country];
    const payoutMult = countryStats?.modifiers?.payoutMultiplier || 1.0;
    const threatMult = countryStats?.modifiers?.threatMultiplier || 1.0;

    if (result === 'success') {
        audioManager.playSuccess();
        const baseReward = activeScam.victim.difficulty === 'easy' ? 800 : activeScam.victim.difficulty === 'medium' ? 2500 : 6000;
        const variance = activeScam.victim.difficulty === 'easy' ? 400 : activeScam.victim.difficulty === 'medium' ? 1000 : 3000;
        
        // Cult of Personality (Social 5)
        const social5Level = player.skills['social_5'] || 0;
        const skillMult = 1 + (social5Level * 0.05); // +5% per level
        
        const hvtMult = activeScam.isHighValue ? 2.5 : 1.0;
        
        const totalMult = payoutMult * skillMult * hvtMult;
        moneyChange = Math.floor((baseReward + Math.floor(Math.random() * variance)) * totalMult);

    } else if (result === 'police') {
        audioManager.playFailure();
        threatChange = 25;
        
        // VPN Tunneling (Ops 1)
        const vpnLevel = player.skills['ops_1'] || 0;
        if (vpnLevel > 0) threatChange = Math.ceil(threatChange * (1 - (vpnLevel * 0.05)));

        // Legal Retainer (Ops 4) - 10% chance block
        if ((player.skills['ops_4'] || 0) > 0 && Math.random() < 0.1) {
            threatChange = 0;
            alert("Legal Team blocked the police report!");
        }
    } else {
        audioManager.playFailure();
        threatChange = 10;
        // VPN Tunneling (Ops 1)
        const vpnLevel = player.skills['ops_1'] || 0;
        if (vpnLevel > 0) threatChange = Math.ceil(threatChange * (1 - (vpnLevel * 0.05)));
    }

    // Generate Summary for ALL outcomes
    trackUsage('text');
    const aiSummary = await generateScamSummary(activeScam.history, activeScam.victim, result);
    summary = aiSummary.summary;
    victimAftermath = aiSummary.aftermath;

    threatChange = Math.ceil(threatChange * threatMult);
    
    const historyItem: ScamHistoryItem = {
        id: crypto.randomUUID(),
        victimName: activeScam.victim.name,
        victimAvatar: activeScam.victim.avatarUrl,
        victimOccupation: activeScam.victim.occupation,
        payout: moneyChange,
        outcome: result,
        date: Date.now(),
        method: activeScam.category,
        failReason: reason
    };

    const newAchievements = checkAchievements(result, activeScam, moneyChange);

    setPlayer(prev => ({ 
        ...prev, 
        money: prev.money + moneyChange,
        scamsCompleted: result === 'success' ? prev.scamsCompleted + 1 : prev.scamsCompleted,
        achievements: newAchievements,
        history: [historyItem, ...prev.history]
    }));
    
    setLastResult({
        outcome: result,
        moneyChange,
        threatChange,
        victimName: activeScam.victim.name,
        victimAvatar: activeScam.victim.avatarUrl,
        victimFlavor: activeScam.victim.flavor,
        summary,
        victimAftermath,
        reason
    });

    const newThreat = Math.min(MAX_THREAT, player.threatLevel + threatChange);
    setPlayer(prev => ({ ...prev, threatLevel: newThreat }));
    setActiveScam(null);

    if (newThreat >= MAX_THREAT) {
        setView(GameView.GAME_OVER);
        localStorage.removeItem(STORAGE_KEY);
    } else {
        setView(GameView.SCAM_RESULT);
    }
  };

  const buyItem = (item: typeof SHOP_ITEMS[0]) => {
      audioManager.playClick();
      const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
      // Cleaner Crew (Ops 3) Discount
      const cleanerLevel = player.skills['ops_3'] || 0;
      const discount = 1 - (cleanerLevel * 0.05);
      
      const finalCost = Math.floor(item.cost * costMultiplier * discount);

      if (player.money >= finalCost) {
          setPlayer(prev => ({ 
              ...prev, 
              money: prev.money - finalCost,
              inventory: [...prev.inventory, item.id]
          }));
      }
  };

  // UPDATED: Buy Skill Logic for Linear Trees
  const buySkill = (skill: SkillDefinition) => {
      audioManager.playClick();
      const currentLevel = player.skills[skill.id] || 0;
      
      if (currentLevel >= skill.maxLevel) return; // Maxed

      const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
      const nextLevel = currentLevel + 1;
      const levelCostMultiplier = 1 + ((nextLevel - 1) * 0.5); 
      const finalCost = Math.floor(skill.baseCost * levelCostMultiplier * costMultiplier);

      if (player.money >= finalCost) {
          setPlayer(prev => ({
              ...prev,
              money: prev.money - finalCost,
              skills: {
                  ...prev.skills,
                  [skill.id]: nextLevel
              }
          }));
      }
  };

  const resetGame = () => {
      if (window.confirm("WARNING: This will completely wipe your current save. Are you sure?")) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
      }
  };

  const handleScamAction = (type: 'message_sent') => {
      if (type === 'message_sent') {
          trackUsage('text');
          trackUsage('text');
          // Botnet Miner (Ops 2)
          const botnetLevel = player.skills['ops_2'] || 0;
          if (botnetLevel > 0) {
              setPlayer(prev => ({...prev, money: prev.money + 5}));
          }
      }
  };

  if (view === GameView.GAME_OVER) {
      return (
          <div className="w-screen h-[100dvh] bg-red-950 flex items-center justify-center flex-col text-red-500 space-y-8 relative overflow-hidden">
              <Siren size={120} className="animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
              <div className="text-center z-10">
                  <h1 className="text-6xl md:text-8xl font-bold font-mono mb-4 tracking-tighter">BUSTED</h1>
                  <button onClick={() => window.location.reload()} className="px-10 py-4 bg-red-600 text-white rounded hover:bg-red-500 font-bold z-10 shadow-lg transition-all">
                      TERMINATE SESSION & RETRY
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="w-screen h-[100dvh] bg-zinc-950 text-gray-100 font-sans overflow-hidden flex flex-col relative selection:bg-green-500/30 selection:text-green-200">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0)_2px,transparent_2px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
        
        {view !== GameView.LANDING && view !== GameView.CHARACTER_CREATION && (
            <header className="h-14 border-b border-zinc-800 bg-black flex items-center justify-between px-4 md:px-6 z-50 shrink-0 shadow-lg relative">
                <div className="flex items-center gap-4">
                    <div className="text-green-600 animate-pulse">
                        <Terminal size={18} />
                    </div>
                    <div className="flex flex-col">
                         <span className="font-mono text-xs font-bold text-white tracking-[0.2em] leading-none">SCAM_SIMULATOR</span>
                         <span className="font-mono text-[9px] text-green-500 tracking-wider">SYSTEM_ONLINE_V2.0</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                     <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <Activity size={12} /> NET_STATUS: STABLE
                     </div>

                    <button onClick={toggleAudio} className="text-zinc-500 hover:text-white transition-colors">
                        {isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                    </button>
                    
                    {view !== GameView.DASHBOARD && view !== GameView.VICTIM_DOSSIER && view !== GameView.ACTIVE_SCAM && (
                        <button onClick={() => { audioManager.playClick(); setView(GameView.DASHBOARD); }} className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-white rounded-sm text-[10px] font-mono text-white flex items-center gap-2 transition-all uppercase tracking-wider">
                            <ArrowLeft size={10}/> Dashboard
                        </button>
                    )}
                </div>
            </header>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-40">
            {view === GameView.LANDING && (
                <LandingScreen onNewGame={handleNewGame} onResume={handleResumeGame} saveSummary={saveSummary} isMuted={isMuted} toggleAudio={toggleAudio} />
            )}
            {view === GameView.CHARACTER_CREATION && (
                <div className="h-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black overflow-y-auto custom-scrollbar">
                    <CharacterCreator onComplete={handleCharacterComplete} isMuted={isMuted} toggleAudio={toggleAudio} />
                </div>
            )}
            {view === GameView.DASHBOARD && (
                <Dashboard 
                    player={player} 
                    onChangeView={(v) => { audioManager.playClick(); setView(v); }} 
                    onOpenInventory={() => { audioManager.playClick(); setShowInventory(true); }}
                    onReset={resetGame}
                />
            )}
            {view === GameView.VICTIM_DOSSIER && activeScam && (
                <VictimDossier victim={activeScam.victim} player={player} onExecute={finalizeScam} onAbort={handleAbortScam} loading={generatingOpener} />
            )}
            {view === GameView.ACTIVE_SCAM && activeScam && (
                <ScamInterface scam={activeScam} player={player} onUpdateScam={setActiveScam} onScamEnd={handleScamEnd} onAbort={handleAbortScam} onOpenInventory={() => { audioManager.playClick(); setShowInventory(true); }} onConsumeItem={handleConsumeItem} onAction={handleScamAction} />
            )}
            {view === GameView.SCAM_RESULT && lastResult && (
                <ScamResult result={lastResult} onContinue={() => setView(GameView.DASHBOARD)} />
            )}

            {/* SCAM SELECTION (Now using Component) */}
            {view === GameView.SCAM_SELECTION && (
                 <ScamSelection 
                    onSelectDifficulty={findTarget}
                    loading={loadingScam}
                    scamsCompleted={player.scamsCompleted}
                 />
            )}

             {view === GameView.SHOP && (
                <Shop player={player} onBuy={buyItem} />
            )}

             {view === GameView.SKILL_TREE && (
                <SkillTree player={player} onBuy={buySkill} />
            )}
        </main>
        <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} inventory={player.inventory} onUseItem={handleConsumeItem} context={view === GameView.ACTIVE_SCAM ? 'scam' : 'dashboard'} />
    </div>
  );
};

export default App;
