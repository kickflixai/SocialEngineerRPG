
export enum GameView {
  LANDING,
  MENU,
  CHARACTER_CREATION,
  DASHBOARD,
  SCAM_SELECTION,
  VICTIM_DOSSIER,
  ACTIVE_SCAM,
  SCAM_RESULT, 
  SHOP,
  SKILL_TREE,
  GAME_OVER
}

export interface PlayerAttributes {
  name: string;
  gender: string;
  age: string;
  country: string;
  archetype: string;
  clothing: string;
  facialFeatures: string;
  accessories: string;
  avatarUrl: string;
}

export interface CountryStats {
  id: string;
  name: string;
  description: string;
  perkName: string;
  perkDescription: string;
  weaknessName: string;
  weaknessDescription: string;
  startingMoney: number;
  startingThreat: number;
  startingItems: string[];
  startingSkills: string[]; // Still list of IDs, converted to levels on init
  modifiers: {
    trustStartBonus?: number; 
    threatMultiplier?: number;
    payoutMultiplier?: number;
    startSuspicious?: boolean;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isHidden?: boolean; 
}

export interface ScamHistoryItem {
  id: string;
  victimName: string;
  victimAvatar: string;
  victimOccupation: string;
  payout: number;
  outcome: 'success' | 'failed' | 'police';
  date: number;
  method: string;
  failReason?: string; 
}

export interface AiStats {
  textRequests: number;
  imageRequests: number;
  totalCost: number;
}

export interface PlayerState {
  attributes: PlayerAttributes;
  money: number;
  threatLevel: number; // 0-100
  scamsCompleted: number;
  inventory: string[];
  skills: Record<string, number>; // MAP ID -> Level (e.g., { 'social_1': 5, 'tech_2': 1 })
  achievements: string[];
  history: ScamHistoryItem[];
  stats: AiStats;
}

export interface VictimTraits {
  openness: number;      
  conscientiousness: number; 
  extraversion: number;  
  agreeableness: number; 
  neuroticism: number;   
  impulsivity: number;   
  techLiteracy: number;  
}

export interface Victim {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female'; 
  difficulty: 'easy' | 'medium' | 'hard';
  avatarUrl: string; 
  occupation: string;
  personality: string;
  archetype: string; 
  flavor: string; 
  hiddenFact: string; 
  weakness: string;
  resistanceStyle: string; 
  traits: VictimTraits; 
}

export interface ChatMessage {
  sender: 'player' | 'victim' | 'system'; 
  text: string;
  timestamp: number;
}

export interface ScamObjective {
  id: string;
  description: string;
  isCompleted: boolean;
  isFinal: boolean;
  order: number;
}

export interface ScamState {
  victim: Victim;
  category: string; 
  objectives: ScamObjective[];
  history: ChatMessage[];
  
  // MECHANICS
  trust: number; // 0-100
  suspicion: number; // 0-100 
  socialCharge: number; // 0-100 (Mana for hacks)
  
  status: 'active' | 'success' | 'failed' | 'police_called';
  revealedFacts: string[];
  isHighValue?: boolean;
}

export interface ArbiterResponse {
  trustDelta: number; 
  suspicionDelta: number; 
  creativityScore: number; 
  objectiveComplete: boolean; 
  internalThought: string;
  scamStatus: 'continue' | 'success' | 'failed' | 'police_called';
}

export interface HackAbility {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  systemMessage: string; 
}

// NEW LINEAR SKILL DEFINITION
export interface SkillDefinition {
  id: string;
  name: string;
  description: string; // Template string, use {value} for dynamic numbers
  baseCost: number;
  costMultiplier: number; // Cost increases per level
  maxLevel: number; // 1 for Perks, 5 for Stats
  tier: number; // 1-5
  branch: 'social' | 'tech' | 'ops';
  requiredSkillId?: string;
  icon: string;
  effectValue: number; // Base value per level (e.g., 5 for 5%)
  effectType: string; // For logic handling
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  icon: string;
  usageContext: 'dashboard' | 'scam' | 'any';
}
