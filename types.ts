
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
  startingSkills: string[];
  modifiers: {
    trustBonus?: number;
    threatMultiplier?: number;
    payoutMultiplier?: number;
    suspicionStart?: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isHidden?: boolean; // If true, details hidden until unlocked
}

export interface PlayerState {
  attributes: PlayerAttributes;
  money: number;
  threatLevel: number; // 0-100
  scamsCompleted: number;
  inventory: string[];
  skills: string[];
  achievements: string[]; // Array of unlocked Achievement IDs
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
  hiddenFact: string; 
  weakness: string;
  resistanceStyle: string; 
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
  order: number; // 1, 2, or 3
}

export interface ScamState {
  victim: Victim;
  category: string; 
  // winCondition is now handled by the final objective in the objectives array
  objectives: ScamObjective[];
  history: ChatMessage[];
  trust: number; // 0-100
  suspicion: number; // 0-100
  status: 'active' | 'success' | 'failed' | 'police_called';
  revealedFacts: string[];
}

export interface ArbiterResponse {
  logicScore: number; 
  emotionalImpact: number; 
  trustDelta: number;
  suspicionDelta: number;
  objectiveComplete: boolean; // Replaces progressDelta
  internalThought: string;
  scamStatus: 'continue' | 'success' | 'failed' | 'police_called';
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  category: 'social' | 'tech' | 'ops';
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  icon: string;
}
