
import { Skill, ShopItem, CountryStats, Achievement } from './types';

export const INITIAL_MONEY = 1000;
export const INITIAL_THREAT = 0;
export const MAX_THREAT = 100;

// --- AUDIO CONFIG ---
// To use your own music, paste a direct URL to an MP3 file here (e.g. from GitHub Raw, Dropbox dl=1, etc.)
// If left empty, the game will use the built-in generative synth music.
export const HACKING_MUSIC_URL = "https://res.cloudinary.com/dyqus7sfo/video/upload/v1763722941/hacking1_vyfcpf.mp3"; 
export const DASHBOARD_MUSIC_URL = "https://res.cloudinary.com/dyqus7sfo/video/upload/v1763722941/MainMenu_gge672.mp3"; 

// --- COUNTRY DATA & LORE ---
export const COUNTRY_DATA: Record<string, CountryStats> = {
  'North Korea': {
    id: 'North Korea',
    name: 'North Korea',
    description: 'The Hermit Kingdom. The internet here is just you, three generals, and a guy named Dave. State-sponsored hacking is a lifestyle.',
    perkName: 'Supreme Leader\'s Blessing',
    perkDescription: 'Start with "Botnet Miner" skill pre-installed. (Passive Income)',
    weaknessName: 'Sanctioned To Hell',
    weaknessDescription: 'Money laundering takes a 20% fee on all earnings.',
    startingMoney: 500,
    startingThreat: 10,
    startingItems: [],
    startingSkills: ['botnet'],
    modifiers: { payoutMultiplier: 0.8 }
  },
  'Iran': {
    id: 'Iran',
    name: 'Iran',
    description: 'Cyber warfare is the national sport. You have excellent tools, but the world is already watching your IP address.',
    perkName: 'Cyber Army Recruit',
    perkDescription: 'Start with "VPN Tunneling" skill. (Reduces threat gain)',
    weaknessName: 'Watchlist Priority',
    weaknessDescription: 'Start with 15% Threat Level immediately.',
    startingMoney: 1500,
    startingThreat: 15,
    startingItems: [],
    startingSkills: ['vpn_tunnel'],
    modifiers: { threatMultiplier: 1.1 }
  },
  'Bangladesh': {
    id: 'Bangladesh',
    name: 'Bangladesh',
    description: 'Quantity over quality. You run a clickfarm from a basement with spotty WiFi but immense manpower.',
    perkName: 'Clickfarm Volume',
    perkDescription: 'Start with $3,000 extra cash from "legitimate" ad revenue.',
    weaknessName: 'Spotty Connection',
    weaknessDescription: 'Scams start with -10% Trust due to lag and typos.',
    startingMoney: 4000, // 1000 base + 3000 bonus
    startingThreat: 0,
    startingItems: [],
    startingSkills: [],
    modifiers: { trustBonus: -10 }
  },
  'India': {
    id: 'India',
    name: 'India',
    description: 'The undisputed heavyweight champion of "Your Computer Has A Virus". You know the script, but so do they.',
    perkName: 'Call Center Infrastructure',
    perkDescription: 'Start with a "Voice Modulator" item.',
    weaknessName: 'Over-Scripted',
    weaknessDescription: 'Victims start with +10% Suspicion (They heard this one before).',
    startingMoney: 1200,
    startingThreat: 0,
    startingItems: ['voice_modulator'],
    startingSkills: [],
    modifiers: { suspicionStart: 10 }
  },
  'Russia': {
    id: 'Russia',
    name: 'Russia',
    description: 'Cold winters, colder code. You don\'t scam grandmas; you hack elections and infrastructure. Hardcore mode.',
    perkName: 'FSB Training',
    perkDescription: 'Start with "Doxxing Suite" skill. (Reveal Hidden Facts).',
    weaknessName: 'Notorious',
    weaknessDescription: 'Police Threat increases 25% faster due to international heat.',
    startingMoney: 2000,
    startingThreat: 5,
    startingItems: [],
    startingSkills: ['doxxing_suite'],
    modifiers: { threatMultiplier: 1.25 }
  },
  'USA': {
    id: 'USA',
    name: 'USA',
    description: 'Home of the brave, land of the identity theft. Corporate confidence makes you blend in perfectly.',
    perkName: 'Blue Passport',
    perkDescription: 'Scams start with +15% Trust. You sound "Safe".',
    weaknessName: 'Federal Jurisdiction',
    weaknessDescription: 'If police are called, it\'s Game Over instantly (No chance to escape).',
    startingMoney: 500,
    startingThreat: 0,
    startingItems: [],
    startingSkills: ['authority_voice'],
    modifiers: { trustBonus: 15 }
  },
  'Nigeria': {
    id: 'Nigeria',
    name: 'Nigeria',
    description: 'The Classics. You are a Prince, an oil tycoon, or a lost astronaut. High risk, high reward.',
    perkName: 'The Prince',
    perkDescription: 'Successful scams pay out 25% more.',
    weaknessName: 'Meme Status',
    weaknessDescription: 'Scams start with +15% Suspicion. Everyone knows the Prince.',
    startingMoney: 1000,
    startingThreat: 0,
    startingItems: [],
    startingSkills: [],
    modifiers: { payoutMultiplier: 1.25, suspicionStart: 15 }
  },
  'China': {
    id: 'China',
    name: 'China',
    description: 'Industrial scale operations. You are a cog in a massive data-harvesting machine.',
    perkName: 'The Great Firewall',
    perkDescription: 'Start with "Data Leak Purchase" item.',
    weaknessName: 'Strict Quotas',
    weaknessDescription: 'Black Market items cost 20% more (Tariffs).',
    startingMoney: 1500,
    startingThreat: 0,
    startingItems: ['dark_web_leak'],
    startingSkills: [],
    modifiers: {} 
  }
};

export const COUNTRIES = Object.keys(COUNTRY_DATA);

export const CLOTHING_STYLES = ['Business Suit', 'Hoodie & Jeans', 'Tactical Gear', 'Vintage Sweater', 'Designer Streetwear', 'Lab Coat', 'Leather Jacket', 'Tracksuit', 'Turtleneck & Blazer'];
export const FACIAL_FEATURES = ['Clean Shaven', 'Full Beard', 'Scarred', 'Piercings', 'Heavy Makeup', 'Glasses', 'Tattooed', 'Weathered', 'Gold Teeth', 'Eye Patch'];
export const ACCESSORIES = ['Headphones', 'Gold Chain', 'VR Headset', 'Sunglasses', 'Fedora', 'Medical Mask', 'Smart Watch', 'Cybernetic Implant (Fake)', 'None'];
export const AGES = ['18-25', '26-35', '36-50', '50+'];

export const SCAM_CATEGORIES = [
  "Grandson in Trouble",
  "IRS Tax Audit",
  "Tech Support Virus",
  "Lottery Winner",
  "Crypto Investment Opportunity",
  "Romance Scam",
  "Business Email Compromise",
  "Kidnapping Hoax",
  "Charity Fraud",
  "Inheritance Advance Fee",
  "Employment Mule Scam"
];

interface ScamScenario {
    mini1: string;
    mini2: string;
    final: string;
}

export const SCAM_SCENARIOS: Record<string, ScamScenario[]> = {
  "Grandson in Trouble": [
    {
        mini1: "Confirm identity as family member",
        mini2: "Establish the emergency (Jail/Hospital)",
        final: "Secure bail/medical payment details"
    },
    {
        mini1: "Gain trust as a relative",
        mini2: "Explain the urgent accident",
        final: "Get agreement to send gift cards"
    }
  ],
  "IRS Tax Audit": [
    {
        mini1: "Confirm their Full Legal Name",
        mini2: "Establish fear of imminent arrest",
        final: "Pay 'back taxes' via Bitcoin ATM"
    },
    {
        mini1: "Verify their mailing address",
        mini2: "Get them to admit to a filing error",
        final: "Purchase 'Federal Vouchers' (Gift Cards)"
    }
  ],
  "Tech Support Virus": [
    {
        mini1: "Convince them their PC is infected",
        mini2: "Get them to grant remote access",
        final: "Install 'AnyDesk' remote software"
    },
    {
        mini1: "Identify their Computer Model",
        mini2: "Find the 'Windows Key' together",
        final: "Pay $400 'Firewall Fee' via Card"
    }
  ],
  "Lottery Winner": [
    {
        mini1: "Confirm their date of birth",
        mini2: "Confirm their email address",
        final: "Pay 'Customs Duty' fee via Bank Transfer"
    }
  ],
  "Crypto Investment Opportunity": [
    {
        mini1: "Find out their annual income",
        mini2: "Get them to download a Wallet App",
        final: "Send ETH to your 'Investment Pool'"
    }
  ],
  "Romance Scam": [
    {
        mini1: "Establish deep emotional connection",
        mini2: "Get them to say 'I love you'",
        final: "Pay for your 'Plane Ticket' to visit"
    }
  ],
  "Business Email Compromise": [
    {
        mini1: "Get the name of their Accounting Manager",
        mini2: "Get the Invoice Number of last payment",
        final: "Change vendor bank account details"
    }
  ],
  "Kidnapping Hoax": [
    {
        mini1: "Confirm their child's name",
        mini2: "Isolate them from other contact",
        final: "Drop cash at the specific location"
    }
  ],
  "Charity Fraud": [
    {
        mini1: "Get their sympathy for the 'cause'",
        mini2: "Get their billing zip code",
        final: "Set up recurring credit card donation"
    }
  ],
  "Inheritance Advance Fee": [
    {
        mini1: "Get a scan of their Passport ID",
        mini2: "Get their personal bank name",
        final: "Pay 'Legal Fees' to release funds"
    }
  ],
  "Employment Mule Scam": [
    {
        mini1: "Confirm their current employment status",
        mini2: "Get a photo of their Driver's License",
        final: "Purchase 'Office Equipment' from fake vendor"
    }
  ]
};

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_blood', title: 'First Blood', description: 'Successfully complete your first scam.', icon: 'Award' },
    { id: 'high_roller', title: 'High Roller', description: 'Accumulate over $20,000 in funds.', icon: 'Banknote' },
    { id: 'untouchable', title: 'Untouchable', description: 'Complete a scam with 0% Suspicion.', icon: 'Ghost' },
    { id: 'close_call', title: 'Close Call', description: 'Complete a scam with >90% Suspicion.', icon: 'Zap' },
    { id: 'ach_grandson', title: 'Nana\'s Boy', description: 'Success: Grandson in Trouble', icon: 'User' },
    { id: 'ach_irs', title: 'The Taxman', description: 'Success: IRS Tax Audit', icon: 'FileText' },
    { id: 'ach_tech', title: 'Hello Sir', description: 'Success: Tech Support Virus', icon: 'Monitor' },
    { id: 'ach_lotto', title: 'Jackpot', description: 'Success: Lottery Winner', icon: 'Ticket' },
    { id: 'ach_crypto', title: 'Rug Pull', description: 'Success: Crypto Investment', icon: 'Bitcoin' },
    { id: 'ach_romance', title: 'Heartbreaker', description: 'Success: Romance Scam', icon: 'Heart' },
    { id: 'ach_bec', title: 'CEO Fraud', description: 'Success: Business Email Compromise', icon: 'Building' },
    { id: 'ach_kidnap', title: 'Ransom King', description: 'Success: Kidnapping Hoax', icon: 'Siren' },
    { id: 'ach_charity', title: 'Cold Hearted', description: 'Success: Charity Fraud', icon: 'HeartOff' },
    { id: 'ach_inherit', title: 'The Prince', description: 'Success: Inheritance Advance Fee', icon: 'Crown' },
    { id: 'ach_mule', title: 'Job Creator', description: 'Success: Employment Mule Scam', icon: 'Briefcase' },
];

export const SKILLS: Skill[] = [
  {
    id: 'silver_tongue',
    name: 'Silver Tongue',
    description: 'Reduces suspicion gain by 20% during conversations.',
    cost: 2000,
    icon: 'MessageSquare',
    category: 'social'
  },
  {
    id: 'empathy_mirror',
    name: 'Empathy Mirror',
    description: 'Increases Trust gain by 25% when using emotional keywords.',
    cost: 4500,
    icon: 'Heart',
    category: 'social'
  },
  {
    id: 'cold_reading',
    name: 'Cold Reading',
    description: 'AI Arbiter gives more detailed internal thoughts about the victim.',
    cost: 6000,
    icon: 'Eye',
    category: 'social'
  },
  {
    id: 'love_bomb',
    name: 'Love Bomb Protocol',
    description: 'Romance scams start with +15% Trust.',
    cost: 8000,
    icon: 'HeartHandshake',
    category: 'social'
  },
  {
    id: 'authority_voice',
    name: 'Authority Voice',
    description: 'Reduces suspicion when making demands or threats.',
    cost: 10000,
    icon: 'Megaphone',
    category: 'social'
  },
  {
    id: 'linguistic_mimicry',
    name: 'Linguistic Mimicry',
    description: 'Automatically adapts tone to match victim, boosting logic score.',
    cost: 12000,
    icon: 'Languages',
    category: 'social'
  },
  {
    id: 'doxxing_suite',
    name: 'Doxxing Suite',
    description: 'Instantly reveals one hidden fact about the target at start.',
    cost: 3500,
    icon: 'Search',
    category: 'tech'
  },
  {
    id: 'social_scraper',
    name: 'Social Scraper',
    description: 'Reveals the victim\'s exact weakness immediately.',
    cost: 5000,
    icon: 'Database',
    category: 'tech'
  },
  {
    id: 'deepfake_audio',
    name: 'Deepfake Audio',
    description: 'Unlocks "Voice Note" scams (Automatic high trust opener).',
    cost: 8000,
    icon: 'Mic',
    category: 'tech'
  },
  {
    id: 'keylogger',
    name: 'Keylogger Injector',
    description: 'Shows what the victim is "typing" before they send it.',
    cost: 11000,
    icon: 'Keyboard',
    category: 'tech'
  },
  {
    id: 'bank_backdoor',
    name: 'Bank API Backdoor',
    description: 'Reveals the exact max payout potential of the target.',
    cost: 15000,
    icon: 'Landmark',
    category: 'tech'
  },
  {
    id: 'auto_translator',
    name: 'Neural Translator',
    description: 'Allows scamming international targets (Higher payouts).',
    cost: 7500,
    icon: 'Globe',
    category: 'tech'
  },
  {
    id: 'vpn_tunnel',
    name: 'VPN Tunneling',
    description: 'Reduces threat level increase when a scam fails by 50%.',
    cost: 5000,
    icon: 'Shield',
    category: 'ops'
  },
  {
    id: 'money_laundering',
    name: 'Laundering Network',
    description: 'Increases all payout amounts by 15%.',
    cost: 10000,
    icon: 'Banknote',
    category: 'ops'
  },
  {
    id: 'botnet',
    name: 'Botnet Miner',
    description: 'Passive income: Generates $100 every time you send a message.',
    cost: 12000,
    icon: 'Cpu',
    category: 'ops'
  },
  {
    id: 'legal_retainer',
    name: 'Legal Retainer',
    description: '10% chance to completely block a "Police Called" event.',
    cost: 20000,
    icon: 'Scale',
    category: 'ops'
  },
  {
    id: 'shell_companies',
    name: 'Shell Companies',
    description: 'Allows you to hold more money without triggering audits (Flavor).',
    cost: 5000,
    icon: 'Briefcase',
    category: 'ops'
  },
  {
    id: 'insider_trading',
    name: 'Insider Info',
    description: 'Unlocks "Crypto Whale" targets in Tier 3.',
    cost: 25000,
    icon: 'TrendingUp',
    category: 'ops'
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'burner_phone',
    name: 'Burner Phone',
    description: 'Switch devices to confuse the trail. Reduces current Threat Level by 20.',
    cost: 500,
    effect: 'reduce_threat',
    icon: 'Smartphone',
    usageContext: 'dashboard'
  },
  {
    id: 'voice_modulator',
    name: 'Voice Modulator',
    description: 'One-time use: Instantly reduces suspicion by 30% in a chat.',
    cost: 250,
    effect: 'reduce_suspicion',
    icon: 'Mic2',
    usageContext: 'scam'
  },
  {
    id: 'grease_palm',
    name: 'Police Bribe',
    description: 'Pay off a local precinct. Reduces current Threat Level by 50.',
    cost: 1200,
    effect: 'reduce_threat_major',
    icon: 'Briefcase',
    usageContext: 'dashboard'
  },
  {
    id: 'dark_web_leak',
    name: 'Data Leak Purchase',
    description: 'Buy a high-value lead. Guarantees next victim has max payout potential.',
    cost: 1500,
    effect: 'high_value_target',
    icon: 'FileWarning',
    usageContext: 'dashboard'
  },
  {
    id: 'cleaner',
    name: 'The Cleaner',
    description: 'Wipe your entire digital footprint. Resets Threat Level to 0.',
    cost: 5000,
    effect: 'reset_threat',
    icon: 'Trash2',
    usageContext: 'dashboard'
  },
  {
    id: 'ransomware',
    name: 'Ransomware Kit',
    description: 'Force success on current objective, but raises Threat.',
    cost: 2000,
    effect: 'force_objective',
    icon: 'Lock',
    usageContext: 'scam'
  },
  {
    id: 'ddos_attack',
    name: 'DDoS Attack',
    description: 'Chaos distraction. Reduces Suspicion to 0 immediately.',
    cost: 800,
    effect: 'reset_suspicion',
    icon: 'WifiOff',
    usageContext: 'scam'
  },
  {
    id: 'fake_id',
    name: 'Forged FBI Badge',
    description: 'Unlock "Federal Agent" persona. Boosts Trust by 25%.',
    cost: 1000,
    effect: 'boost_trust',
    icon: 'BadgeCheck',
    usageContext: 'scam'
  }
];