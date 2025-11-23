
import { SkillDefinition } from './types';

// --- LINEAR SKILL TREES ---
// 3 Branches: Social, Tech, Ops.
// Each has 5 Tiers. Tiers 1, 3, 5 are multi-level (5 levels). Tiers 2, 4 are Perks (1 level).

export const SKILL_TREE_SOCIAL: SkillDefinition[] = [
    // TIER 1: STAT BOOST (Trust Gain)
    {
        id: 'social_1',
        name: 'Charisma Training',
        description: 'Increases Trust gain by {value}% per level.',
        branch: 'social',
        tier: 1,
        maxLevel: 5,
        baseCost: 500,
        costMultiplier: 1.5,
        icon: 'MessageSquare',
        effectValue: 5, // +5% per level
        effectType: 'trust_gain_bonus'
    },
    // TIER 2: PERK (Cold Reading)
    {
        id: 'social_2',
        name: 'Cold Reading',
        description: 'Unlocks "Psych Profile" analysis in the System Log.',
        branch: 'social',
        tier: 2,
        maxLevel: 1,
        baseCost: 3000,
        costMultiplier: 1,
        requiredSkillId: 'social_1',
        icon: 'Eye',
        effectValue: 1,
        effectType: 'unlock_psych_profile'
    },
    // TIER 3: STAT BOOST (Suspicion Reduction)
    {
        id: 'social_3',
        name: 'Silver Tongue',
        description: 'Reduces Suspicion gain by {value}% per level.',
        branch: 'social',
        tier: 3,
        maxLevel: 5,
        baseCost: 1500,
        costMultiplier: 1.5,
        requiredSkillId: 'social_2',
        icon: 'Feather',
        effectValue: 5, // -5% per level
        effectType: 'suspicion_reduction'
    },
    // TIER 4: PERK (Authority Voice)
    {
        id: 'social_4',
        name: 'Authority Voice',
        description: 'Massive Trust bonus when using authoritative commands.',
        branch: 'social',
        tier: 4,
        maxLevel: 1,
        baseCost: 8000,
        costMultiplier: 1,
        requiredSkillId: 'social_3',
        icon: 'Megaphone',
        effectValue: 1,
        effectType: 'authority_bonus'
    },
    // TIER 5: STAT BOOST (Payout Multiplier)
    {
        id: 'social_5',
        name: 'Cult of Personality',
        description: 'Increases final payout by {value}% per level.',
        branch: 'social',
        tier: 5,
        maxLevel: 5,
        baseCost: 5000,
        costMultiplier: 2.0,
        requiredSkillId: 'social_4',
        icon: 'Crown',
        effectValue: 5, // +5% per level
        effectType: 'payout_bonus_social'
    }
];

export const SKILL_TREE_TECH: SkillDefinition[] = [
    // TIER 1: STAT BOOST (Hack Cost Reduction)
    {
        id: 'tech_1',
        name: 'Script Optimization',
        description: 'Reduces Hacking Power cost by {value}% per level.',
        branch: 'tech',
        tier: 1,
        maxLevel: 5,
        baseCost: 500,
        costMultiplier: 1.5,
        icon: 'Code',
        effectValue: 5, // -5% per level
        effectType: 'hack_cost_reduction'
    },
    // TIER 2: PERK (Doxxing)
    {
        id: 'tech_2',
        name: 'Doxxing Suite',
        description: 'Instantly reveals one hidden fact about the target.',
        branch: 'tech',
        tier: 2,
        maxLevel: 1,
        baseCost: 3000,
        costMultiplier: 1,
        requiredSkillId: 'tech_1',
        icon: 'Search',
        effectValue: 1,
        effectType: 'reveal_intel'
    },
    // TIER 3: STAT BOOST (Charge Regen/Gain)
    {
        id: 'tech_3',
        name: 'Social Engineering Toolkit',
        description: 'Increases Hacking Power generation by {value}% per level.',
        branch: 'tech',
        tier: 3,
        maxLevel: 5,
        baseCost: 1500,
        costMultiplier: 1.5,
        requiredSkillId: 'tech_2',
        icon: 'Zap',
        effectValue: 10, // +10% per level
        effectType: 'charge_gain_bonus'
    },
    // TIER 4: PERK (Deepfake)
    {
        id: 'tech_4',
        name: 'Deepfake Studio',
        description: 'Unlocks "Deepfake Audio" hack capability.',
        branch: 'tech',
        tier: 4,
        maxLevel: 1,
        baseCost: 8000,
        costMultiplier: 1,
        requiredSkillId: 'tech_3',
        icon: 'Mic',
        effectValue: 1,
        effectType: 'unlock_deepfake'
    },
    // TIER 5: STAT BOOST (Bypass Chance)
    {
        id: 'tech_5',
        name: 'Zero Day Exploit',
        description: '{value}% chance to completely ignore a Suspicion increase.',
        branch: 'tech',
        tier: 5,
        maxLevel: 5,
        baseCost: 5000,
        costMultiplier: 2.0,
        requiredSkillId: 'tech_4',
        icon: 'Ghost',
        effectValue: 5, // 5% chance per level
        effectType: 'suspicion_bypass_chance'
    }
];

export const SKILL_TREE_OPS: SkillDefinition[] = [
    // TIER 1: STAT BOOST (Heat Reduction)
    {
        id: 'ops_1',
        name: 'VPN Tunneling',
        description: 'Reduces Global Heat gain by {value}% per level.',
        branch: 'ops',
        tier: 1,
        maxLevel: 5,
        baseCost: 500,
        costMultiplier: 1.5,
        icon: 'Shield',
        effectValue: 5, // -5% per level
        effectType: 'heat_reduction'
    },
    // TIER 2: PERK (Passive Income)
    {
        id: 'ops_2',
        name: 'Botnet Miner',
        description: 'Generates $5 every time you send a message.',
        branch: 'ops',
        tier: 2,
        maxLevel: 1,
        baseCost: 3000,
        costMultiplier: 1,
        requiredSkillId: 'ops_1',
        icon: 'Cpu',
        effectValue: 5,
        effectType: 'passive_income'
    },
    // TIER 3: STAT BOOST (Bribe Cost / Cleanup)
    {
        id: 'ops_3',
        name: 'Cleaner Crew',
        description: 'Reduces cost of Black Market items by {value}%.',
        branch: 'ops',
        tier: 3,
        maxLevel: 5,
        baseCost: 1500,
        costMultiplier: 1.5,
        requiredSkillId: 'ops_2',
        icon: 'Trash2',
        effectValue: 5, // -5% per level
        effectType: 'shop_discount'
    },
    // TIER 4: PERK (Legal Retainer)
    {
        id: 'ops_4',
        name: 'Legal Retainer',
        description: '10% chance to block a "Police Called" Game Over event.',
        branch: 'ops',
        tier: 4,
        maxLevel: 1,
        baseCost: 8000,
        costMultiplier: 1,
        requiredSkillId: 'ops_3',
        icon: 'Scale',
        effectValue: 10,
        effectType: 'legal_defense'
    },
    // TIER 5: STAT BOOST (High Value Target)
    {
        id: 'ops_5',
        name: 'Insider Trading',
        description: '{value}% chance for any target to be "High Value" (2.5x Payout).',
        branch: 'ops',
        tier: 5,
        maxLevel: 5,
        baseCost: 5000,
        costMultiplier: 2.0,
        requiredSkillId: 'ops_4',
        icon: 'TrendingUp',
        effectValue: 5, // 5% chance per level
        effectType: 'hvt_chance'
    }
];

export const ALL_SKILLS = [...SKILL_TREE_SOCIAL, ...SKILL_TREE_TECH, ...SKILL_TREE_OPS];
