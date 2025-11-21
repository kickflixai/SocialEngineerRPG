
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
    relationshipStartBonus?: number; // Replaces trustBonus
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

export interface PlayerState {
  attributes: PlayerAttributes;
  money: number;
  threatLevel: number; // 0-100
  scamsCompleted: number;
  inventory: string[];
  skills: string[];
  achievements: string[];
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
  sender: 'player' | 'victim' | 'system'; // Added system
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
  
  // NEW MECHANICS
  relationship: number; // -100 (Suspicion) to 100 (Trust)
  socialCharge: number; // 0-100 (Mana for hacks)
  
  status: 'active' | 'success' | 'failed' | 'police_called';
  revealedFacts: string[];
  isHighValue?: boolean;
}

export interface ArbiterResponse {
  relationshipDelta: number; // -X to +X
  creativityScore: number; // 0 to 10 (Adds to Social Charge)
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
  systemMessage: string; // What appears in chat
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
  usageContext: 'dashboard' | 'scam' | 'any';
}
