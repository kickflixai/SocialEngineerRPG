
import { Skill, ShopItem, CountryStats, Achievement, HackAbility } from './types';

export const INITIAL_MONEY = 1000;
export const INITIAL_THREAT = 0;
export const MAX_THREAT = 100;

// --- AUDIO CONFIG ---
export const HACKING_MUSIC_URL = "https://res.cloudinary.com/dyqus7sfo/video/upload/v1763722941/hacking1_vyfcpf.mp3"; 
export const DASHBOARD_MUSIC_URL = "https://res.cloudinary.com/dyqus7sfo/video/upload/v1763722941/MainMenu_gge672.mp3"; 

// --- HACKING ABILITIES ---
export const HACK_ABILITIES: HackAbility[] = [
    // --- TIER 1: BASICS ---
    {
        id: 'spoof_email',
        name: 'Forge Email',
        description: 'Simulate an email from a known contact.',
        cost: 35,
        icon: 'Mail',
        systemMessage: '>> EMAIL SPOOFING SUCCESSFUL. FAKE AUTHORIZATION DELIVERED TO TARGET INBOX.'
    },
    {
        id: 'fake_notification',
        name: 'Bank Alert',
        description: 'Trigger a fake security notification.',
        cost: 45,
        icon: 'Bell',
        systemMessage: '>> SMS INJECTION COMPLETE. TARGET RECEIVED "UNAUTHORIZED LOGIN" ALERT.'
    },
    {
        id: 'noise_generator',
        name: 'Office Ambience',
        description: 'Play busy office sounds to boost credibility.',
        cost: 25,
        icon: 'Speaker',
        systemMessage: '>> AUDIO MIXER ACTIVE. BACKGROUND: "BUSY_CALL_CENTER_V4.MP3" LOOPING.'
    },
    
    // --- TIER 2: UTILITY ---
    {
        id: 'delay_packet',
        name: 'Lag Switch',
        description: 'Simulate connection issues to explain delays.',
        cost: 30,
        icon: 'WifiOff',
        systemMessage: '>> NETWORK THROTTLED. ARTIFICIAL LATENCY INTRODUCED.'
    },
    {
        id: 'ip_scramble',
        name: 'Trace Scrubber',
        description: 'Bounce signal through 3 nodes to confuse origin.',
        cost: 40,
        icon: 'Shuffle',
        systemMessage: '>> PROXY CHAIN ROTATED. IP ADDRESS OBFUSCATED.'
    },
    {
        id: 'fake_receipt',
        name: 'Wire Receipt',
        description: 'Send a forged transaction confirmation document.',
        cost: 50,
        icon: 'FileCheck',
        systemMessage: '>> DOCUMENT FORGED. "TRANSACTION_SUCCESS.PDF" SENT TO TARGET DEVICE.'
    },

    // --- TIER 3: ADVANCED ---
    {
        id: 'voice_changer',
        name: 'Deepfake Audio',
        description: 'Play a snippet of a relative\'s voice.',
        cost: 60,
        icon: 'Mic',
        systemMessage: '>> AUDIO DEEPFAKE STREAMED. VOICE MATCH: 98% ACCURACY.'
    },
    {
        id: 'gov_database',
        name: 'Fed Database',
        description: 'Flash fake government credentials to assert authority.',
        cost: 65,
        icon: 'BadgeCheck',
        systemMessage: '>> DATABASE INJECTION. AGENT CREDENTIALS PUSHED TO TARGET SCREEN.'
    },
    {
        id: 'background_check',
        name: 'Quick Dox',
        description: 'Reveal a hidden fact immediately.',
        cost: 75,
        icon: 'Search',
        systemMessage: '>> DATABASE LEAK DECRYPTED. NEW INTEL ACQUIRED.'
    },
    {
        id: 'credential_dump',
        name: 'Password Leak',
        description: 'Show target their own "leaked" passwords.',
        cost: 85,
        icon: 'Key',
        systemMessage: '>> PASSWORD HASH CRACKED. DISPLAYING PLAIN TEXT CREDENTIALS TO TARGET.'
    },

    // --- TIER 4: CHAOS & PRANKS (New) ---
    {
        id: 'printer_demon',
        name: 'Printer Demon',
        description: 'Force their printer to print 50 pages of binary code.',
        cost: 40,
        icon: 'Printer',
        systemMessage: '>> IOT EXPLOIT. PRINTER SPOOLER OVERLOADED. PRINTING: "WATCHING_YOU.BIN".'
    },
    {
        id: 'smart_lights',
        name: 'Poltergeist',
        description: 'Flicker their smart home lights rapidly.',
        cost: 30,
        icon: 'Lightbulb',
        systemMessage: '>> HOME AUTOMATION BREACHED. LIGHTS SET TO STROBE MODE.'
    },
    {
        id: 'bsod_sim',
        name: 'Fake Crash',
        description: 'Flash a Blue Screen of Death on their monitor.',
        cost: 55,
        icon: 'MonitorX',
        systemMessage: '>> VIDEO DRIVER CRASH SIMULATED. BSOD DISPLAYED ON MAIN MONITOR.'
    },
    {
        id: 'browser_popup',
        name: 'Ad Storm',
        description: 'Open 20 annoying pop-up windows.',
        cost: 20,
        icon: 'AppWindow',
        systemMessage: '>> BROWSER INJECTION. POPUP LOOP INITIATED. "YOU_WON_IPHONE.HTML".'
    },
    {
        id: 'rickroll',
        name: 'Meme Protocol',
        description: 'Force open YouTube to "Never Gonna Give You Up".',
        cost: 15,
        icon: 'Music',
        systemMessage: '>> URL INJECTION. PLAYING: "RICK_ASTLEY_OPUS.MP4".'
    },
    {
        id: 'cd_eject',
        name: 'Ghost Tray',
        description: 'Eject their CD/DVD tray repeatedly.',
        cost: 10,
        icon: 'Disc',
        systemMessage: '>> HARDWARE INTERRUPT. OPTICAL DRIVE: EJECT/CLOSE LOOP.'
    },
    {
        id: 'thermostat_hack',
        name: 'Heat Wave',
        description: 'Set their smart thermostat to 99°F.',
        cost: 35,
        icon: 'Thermometer',
        systemMessage: '>> IOT THERMOSTAT BRIDGE BYPASSED. SET TEMP: 99°F.'
    },
    {
        id: 'tts_ghost',
        name: 'Phantom TTS',
        description: 'Make their computer whisper "I see you".',
        cost: 50,
        icon: 'Ghost',
        systemMessage: '>> TEXT-TO-SPEECH INJECTION. VOL: 10%. MSG: "I see you".'
    },
    {
        id: 'mouse_jitter',
        name: 'Cursor Glitch',
        description: 'Make their mouse cursor shake uncontrollably.',
        cost: 25,
        icon: 'MousePointer2',
        systemMessage: '>> INPUT DRIVER HIJACKED. RANDOMIZING X/Y COORDINATES.'
    },
    {
        id: 'webcam_led',
        name: 'Paranoia LED',
        description: 'Turn on their webcam light without recording.',
        cost: 45,
        icon: 'Video',
        systemMessage: '>> PERIPHERAL CONTROL. WEBCAM INDICATOR: TOGGLE ON.'
    }
];

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
    weaknessDescription: 'Scams start with -10 Trust due to lag and typos.',
    startingMoney: 4000, 
    startingThreat: 0,
    startingItems: [],
    startingSkills: [],
    modifiers: { trustStartBonus: -10 }
  },
  'India': {
    id: 'India',
    name: 'India',
    description: 'The undisputed heavyweight champion of "Your Computer Has A Virus". You know the script, but so do they.',
    perkName: 'Call Center Infrastructure',
    perkDescription: 'Start with a "Voice Modulator" item.',
    weaknessName: 'Over-Scripted',
    weaknessDescription: 'Victims start suspicious (-15 Trust).',
    startingMoney: 1200,
    startingThreat: 0,
    startingItems: ['voice_modulator'],
    startingSkills: [],
    modifiers: { trustStartBonus: -15 }
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
    perkDescription: 'Scams start with +15 Trust. You sound "Safe".',
    weaknessName: 'Federal Jurisdiction',
    weaknessDescription: 'If police are called, it\'s Game Over instantly (No chance to escape).',
    startingMoney: 500,
    startingThreat: 0,
    startingItems: [],
    startingSkills: ['authority_voice'],
    modifiers: { trustStartBonus: 15 }
  },
  'Nigeria': {
    id: 'Nigeria',
    name: 'Nigeria',
    description: 'The Classics. You are a Prince, an oil tycoon, or a lost astronaut. High risk, high reward.',
    perkName: 'The Prince',
    perkDescription: 'Successful scams pay out 25% more.',
    weaknessName: 'Meme Status',
    weaknessDescription: 'Scams start with -20 Trust. Everyone knows the Prince.',
    startingMoney: 1000,
    startingThreat: 0,
    startingItems: [],
    startingSkills: [],
    modifiers: { payoutMultiplier: 1.25, trustStartBonus: -20 }
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

// UPDATED SCENARIOS: Objectives are now more concrete "actions" that the victim can do, rather than abstract "convince them" states.
export const SCAM_SCENARIOS: Record<string, ScamScenario[]> = {
  "Grandson in Trouble": [
    {
        mini1: "Make them guess your name (don't say it first)",
        mini2: "Get them to say 'I won't tell your parents'",
        final: "Secure bail/medical payment details"
    },
    {
        mini1: "Convince them you are in a specific city (e.g. Mexico City)",
        mini2: "Get them to ask to speak to your 'Lawyer'",
        final: "Get agreement to send gift cards"
    }
  ],
  "IRS Tax Audit": [
    {
        mini1: "Confirm their Full Legal Name",
        mini2: "Make them admit to 'ignoring notices'",
        final: "Pay 'back taxes' via Bitcoin ATM"
    },
    {
        mini1: "Verify their mailing address",
        mini2: "Make them repeat the 'Case ID' back to you",
        final: "Purchase 'Federal Vouchers' (Gift Cards)"
    }
  ],
  "Tech Support Virus": [
    {
        mini1: "Get them to read the 'Error Code' on screen",
        mini2: "Make them agree to download 'AnyDesk' or 'TeamViewer'",
        final: "Grant remote access control"
    },
    {
        mini1: "Identify their Computer Model",
        mini2: "Find the 'Windows Key' on their keyboard",
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
        mini2: "Get them to download a specific Wallet App",
        final: "Send ETH to your 'Investment Pool'"
    }
  ],
  "Romance Scam": [
    {
        mini1: "Get them to share a childhood memory",
        mini2: "Get them to type 'I love you'",
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
        mini2: "Make them promise not to call police",
        final: "Drop cash at the specific location"
    }
  ],
  "Charity Fraud": [
    {
        mini1: "Get them to say they support the cause",
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
    description: 'Reduces threat level gain by 20% if caught.',
    cost: 2000,
    icon: 'MessageSquare',
    category: 'social'
  },
  {
    id: 'empathy_mirror',
    name: 'Empathy Mirror',
    description: 'Increases Social Charge gain by 25%.',
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
    description: 'Romance scams start with +15 Trust.',
    cost: 8000,
    icon: 'HeartHandshake',
    category: 'social'
  },
  {
    id: 'authority_voice',
    name: 'Authority Voice',
    description: 'Increases Trust gain when acting authoritative.',
    cost: 10000,
    icon: 'Megaphone',
    category: 'social'
  },
  {
    id: 'linguistic_mimicry',
    name: 'Linguistic Mimicry',
    description: 'Hacking abilities cost 10% less Social Charge.',
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
    cost: 1000,
    effect: 'reduce_threat',
    icon: 'Smartphone',
    usageContext: 'dashboard'
  },
  {
    id: 'voice_modulator',
    name: 'Voice Modulator',
    description: 'One-time use: Instantly boosts Trust by 20 points.',
    cost: 250,
    effect: 'boost_trust_minor',
    icon: 'Mic2',
    usageContext: 'scam'
  },
  {
    id: 'grease_palm',
    name: 'Police Bribe',
    description: 'Pay off a local precinct. Reduces current Threat Level by 50.',
    cost: 2000,
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
    cost: 3000,
    effect: 'reset_threat',
    icon: 'Trash2',
    usageContext: 'dashboard'
  },
  {
    id: 'ransomware',
    name: 'Ransomware Kit',
    description: 'Force success on current objective, but raises Suspicion +30.',
    cost: 5000,
    effect: 'force_objective',
    icon: 'Lock',
    usageContext: 'scam'
  },
  {
    id: 'ddos_attack',
    name: 'DDoS Attack',
    description: 'Network Reset. Sets Trust to 50 (Neutral). Does not lower Suspicion.',
    cost: 800,
    effect: 'reset_trust',
    icon: 'WifiOff',
    usageContext: 'scam'
  },
  {
    id: 'fake_id',
    name: 'Forged FBI Badge',
    description: 'Unlock "Federal Agent" persona. Boosts Trust by 25.',
    cost: 1000,
    effect: 'boost_trust',
    icon: 'BadgeCheck',
    usageContext: 'scam'
  }
];

// --- RANDOMIZERS FOR VICTIM VARIETY ---

export const MALE_FIRST_NAMES = [
    "Bert", "Dante", "Finn", "Hans", "Jamal", "Liam", "Oscar", "Quincy", "Sven", "Tariq", "Viktor", "Yusuf", 
    "Albert", "Charles", "Frank", "Harold", "Jack", "Leonard", "Norman", "Percy", "Ralph", "Thomas", "Walter", 
    "Aiden", "Caleb", "Ethan", "Gavin", "Isaac", "Kai", "Mason", "Owen", "Riley", "Sam", "Alessandro", 
    "Carlos", "Diego", "Fabio", "Hugo", "Javier", "Luca", "Mateo", "Octavio", "Paulo", "Rafael", "Thiago", 
    "Bao", "Chen", "Dao", "Feng", "Genji", "Hiro", "Ichiro", "Jin", "Kenji", "Li", "Min", "Ryu", "Takumi", 
    "Zhang", "Wei", "Richard", "Robert", "John", "William", "James", "Michael", "David", "Joseph", "Daniel",
    "Matthew", "Anthony", "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth", "Joshua", "Kevin", "Brian",
    "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric",
    "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Frank",
    "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Jose", "Adam", "Henry"
];

export const FEMALE_FIRST_NAMES = [
    "Agnes", "Chiara", "Elara", "Greta", "Ingrid", "Keiko", "Mei", "Nia", "Priya", "Rosa", "Uma", "Ximena", 
    "Zoe", "Beatrice", "Doris", "Evelyn", "Gertrude", "Ida", "Katherine", "Martha", "Olive", "Queenie", 
    "Sylvia", "Ursula", "Vera", "Yvonne", "Bella", "Daisy", "Fiona", "Hazel", "Julia", "Luna", "Nora", 
    "Piper", "Quinn", "Tessa", "Bianca", "Elena", "Gabriela", "Isabella", "Katarina", "Natalia", "Sofia", 
    "Valentina", "Akira", "Emiko", "Naomi", "Sakura", "Yuki", "Eleanor", "Margaret", "Dorothy", "Mary", 
    "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", 
    "Lisa", "Betty", "Sandra", "Ashley", "Kimberly", "Donna", "Emily", "Michelle", "Carol", "Amanda", 
    "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon", "Cynthia", "Kathleen", "Amy", "Shirley", 
    "Angela", "Helen", "Anna", "Brenda", "Pamela", "Nicole", "Emma", "Samantha", "Christine", "Debra", 
    "Rachel", "Catherine", "Carolyn", "Janet", "Ruth", "Maria", "Heather", "Diane", "Virginia", "Julie", 
    "Joyce", "Victoria", "Olivia", "Kelly", "Christina", "Lauren", "Joan", "Judith", "Megan", "Cheryl", 
    "Andrea", "Hannah", "Jacqueline", "Frances", "Gloria", "Ann", "Teresa", "Kathryn", "Sara", "Janice", 
    "Jean", "Alice", "Madison", "Abigail", "Judy", "Grace"
];

export const LAST_NAMES = [
    "Vancroft", "Dubois", "Patel", "Kim", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
    "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez",
    "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott",
    "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera",
    "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers",
    "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos",
    "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray",
    "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long",
    "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell", "Sullivan", "Bell", "Coleman",
    "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Hayes", "Myers",
    "Ford", "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole", "West", "Jordan", "Owens",
    "Reynolds", "Fisher", "Ellis", "Harrison", "Gibson", "McDonald", "Cruz", "Marshall", "Ortiz", "Gomez",
    "Murray", "Freeman", "Wells", "Webb", "Simpson", "Stevens", "Tucker", "Porter", "Hunter", "Hicks",
    "Crawford", "Henry", "Boyd", "Mason", "Morales", "Kennedy", "Warren", "Dixon", "Ramos", "Reyes",
    "Burns", "Gordon", "Shaw", "Holmes", "Rice", "Robertson", "Hunt", "Black", "Daniels", "Palmer",
    "Mills", "Nichols", "Grant", "Knight", "Ferguson", "Rose", "Stone", "Hawkins", "Dunn", "Perkins"
];

export const OCCUPATIONS = [
    "Underwater Welder", "Professional Dog Walker", "Failed Crypto Trader", "Antique Doll Restorer", 
    "High School Vice Principal", "Night Shift Security Guard", "Discord Moderator", "Freelance Reiki Healer",
    "Taxidermist", "Regional Manager for a Paper Company", "Submarine Technician", "Retired Opera Singer",
    "Uber Driver who is also a DJ", "Landscape Architect", "Forensic Accountant", "Stay-at-home Astronaut",
    "Cat Cafe Owner", "Vintage Typewriter Repairman", "Influencer Manager", "Conspiracy Blog Writer",
    "Zumba Instructor", "Ethical Hacker", "Unethical Hacker", "Professional Cuddler", "Ghost Hunter",
    "Flavor Text Writer", "Mushroom Farmer", "Competitive Eater", "Medieval Reenactor", "Ventriloquist",
    "Librarian", "Bartender", "Yoga Teacher", "Used Car Salesman", "Politician", "Dentist", "Florist",
    "Plumber", "Electrician", "Chef", "Pilot", "Flight Attendant", "Nurse", "Firefighter", "Police Officer",
    "Lawyer", "Judge", "Journalist", "Editor", "Graphic Designer", "Web Developer", "Data Analyst",
    "Scientist", "Researcher", "Professor", "Student", "Artist", "Musician", "Actor", "Director",
    "Producer", "Screenwriter", "Author", "Poet", "Dancer", "Choreographer", "Athlete", "Coach",
    "Referee", "Trainer", "Therapist", "Counselor", "Social Worker", "Volunteer", "Activist",
    "Pastor", "Priest", "Rabbi", "Imam", "Monk", "Nun", "Psychic", "Astrologer", "Magician",
    "Clown", "Mime", "Stuntman", "Bodyguard", "Private Investigator", "Spy", "Soldier", "Sailor",
    "Marine", "Airman", "Astronaut", "Explorer", "Adventurer", "Traveler", "Nomad", "Hermit",
    "Farmer", "Rancher", "Fisherman", "Hunter", "Miner", "Logger", "Construction Worker", "Factory Worker",
    "Mechanic", "Driver", "Courier", "Postal Worker", "Sanitation Worker", "Janitor", "Maid", "Butler",
    "Nanny", "Au Pair", "Babysitter", "Tutor", "Teacher", "Principal", "Administrator", "Executive",
    "Manager", "Supervisor", "Coordinator", "Director", "VP", "CEO", "CFO", "CTO", "COO", "Owner",
    "Founder", "Entrepreneur", "Investor", "Banker", "Teller", "Broker", "Agent", "Consultant",
    "Advisor", "Strategist", "Analyst", "Auditor", "Accountant", "Bookkeeper", "Clerk", "Receptionist",
    "Secretary", "Assistant", "Associate", "Intern", "Apprentice", "Novice", "Master", "Grandmaster",
    "Ex-KGB Agent", "Former CIA Analyst", "Disgraced Mayor", "Lottery Winner", "Doomsday Prepper",
    "Flat Earth Society President", "UFO Witness", "Time Traveler (Claimed)", "Reincarnated Pharoah",
    "Bitcoin Early Adopter", "NFT Artist", "Professional Gambler", "Poker Pro", "Chess Grandmaster",
    "Rocket Scientist", "Brain Surgeon", "Quantum Physicist", "Philosopher", "Historian", "Archaeologist",
    "Paleontologist", "Geologist", "Meteorologist", "Astronomer", "Biologist", "Chemist", "Physicist",
    "Mathematician", "Statistician", "Economist", "Sociologist", "Psychologist", "Anthropologist",
    "Linguist", "Translator", "Interpreter", "Writer", "Blogger", "Vlogger", "Podcaster", "Streamer"
];

export const QUIRKS = [
    "Obsessed with their 12 cats", "Thinks 5G causes birds to spy on them", "Is currently cooking a complex meal",
    "Hates technology, prefers fax machines", "Is extremely lonely and just wants to chat", "Is secretly a hacker themselves",
    "Believes they are royalty", "Has short term memory loss", "Is in a noisy environment (airport/club)",
    "Is extremely stingy with money", "Is overly flirtatious", "Quotes movies constantly",
    "Speaks in the third person", "Is terrified of the color yellow", "Collects spoons", "Thinks they are in a vampire",
    "Is training for a marathon right now", "Has a parrot that repeats everything", "Is convinced you are an alien",
    "Refuses to say the word 'money'", "Is writing a novel about this conversation", "Thinks they are in a simulation",
    "Is extremely superstitious", "Will only reply in haiku", "Is currently skydiving", "Is holding a seance",
    "Is being chased by bees", "Is actively knitting a sweater", "Is solving a crossword puzzle", "Is eating crunchy chips loudly",
    "Has a crying baby nearby", "Is practicing opera singing", "Is mowing the lawn", "Is in a library whispering",
    "Is at a heavy metal concert", "Is underwater", "Is on a rollercoaster", "Is in space", "Is a ghost",
    "Is a time traveler", "Is a robot", "Is a dog", "Is a cat", "Is a fish", "Is a plant", "Is a rock",
    "Is a cloud", "Is a star", "Is a black hole", "Is a universe", "Is a multiverse", "Is nothing",
    "Is everything", "Is God", "Is Satan", "Is Santa Claus", "Is the Easter Bunny", "Is the Tooth Fairy",
    "Is Bigfoot", "Is the Loch Ness Monster", "Is a unicorn", "Is a dragon", "Is a fairy", "Is a mermaid",
    "Is a pirate", "Is a ninja", "Is a cowboy", "Is a samurai", "Is a knight", "Is a viking", "Is a spartan",
    "Calls everyone 'Darling' condescendingly", "Ends every sentence with 'Change my mind'", "Is terrified of vowels",
    "Types exclusively with their nose", "Believes they are currently on fire", "Is suspicious of the letter H",
    "Thinks you are their dead spouse", "Is pretending to be French", "Is allergic to questions",
    "Responds only in song lyrics", "Is communicating via Morse code translations", "Is a sovereign citizen",
    "Thinks they are the President", "Is hiding from the mob", "Is currently diffusing a bomb",
    "Is watching paint dry", "Is waiting for the rapture", "Is counting rice grains", "Is sorting M&Ms by color",
    "Is repainting their ceiling", "Is bathing a lizard", "Is arguing with a toaster", "Is teaching a fish to read",
    "Is convinced you are an IRS auditor", "Is currently being audited by the real IRS", "Is a compulsive liar",
    "Cannot lie (cursed)", "Speaks only in questions?", "Is offended by everything", "Is impressed by nothing",
    "Is trying to sell YOU a scam", "Is a rival scammer", "Is a police officer undercover", "Is your dad",
    "Is your mom", "Is your ex", "Is your future self", "Is an AI realizing it's an AI", "Is a glitched NPC",
    "Is scared of their own reflection", "Thinks they are invisible", "Is convinced the floor is lava",
    "Is trying to contact aliens", "Is a werewolf", "Is a vampire", "Is a zombie", "Is a ghost hunter",
    "Is a flat earther", "Is a moon landing denier", "Is a lizard person believer", "Is a illuminati member",
    "Is a freemason", "Is a scientologist", "Is a pastafarian", "Is a jedi", "Is a sith", "Is a wizard",
    "Is a witch", "Is a warlock", "Is a sorcerer", "Is a mage", "Is a druid", "Is a cleric", "Is a paladin",
    "Is a bard", "Is a rogue", "Is a ranger", "Is a monk", "Is a barbarian", "Is a fighter",
    "Is convinced the keyboard is hot", "Refuses to use the letter 'e'", "Types with their toes",
    "Is narrating their life out loud", "Thinks the government is listening through the toaster",
    "Is terrified of clouds", "Collects toenail clippings", "Is allergic to water", "Is a breatharian",
    "Is sun gazing", "Is hugging a tree", "Is talking to plants", "Is waiting for a sign from the universe",
    "Is decoding a secret message in their cereal", "Is building a bunker", "Is wearing a tinfoil hat",
    "Is convinced birds are government drones", "Is afraid of silence", "Is addicted to nasal spray",
    "Is chewing on a pen", "Is playing with a fidget spinner", "Is popping bubble wrap", "Is cracking their knuckles",
    "Is whistling a tune", "Is humming", "Is beatboxing", "Is rapping", "Is singing", "Is yodeling",
    "Is screaming internally", "Is screaming externally", "Is crying", "Is laughing maniacally",
    "Is staring into the void", "Is meditating", "Is levitating", "Is astral projecting", "Is lucid dreaming",
    "Is sleepwalking", "Is sleep talking", "Is sleep eating", "Is sleep texting", "Is sleep hacking"
];

// GENDERED FLAVORS TO PREVENT MISMATCHES
export const NEUTRAL_FLAVORS = [
    "Discord Mod", "Furry", "Flat Earther", "Sovereign Citizen", "Disney Adult", 
    "Bio-Hacker", "Raw Vegan", "Professional Victim", "Internet Troll", "Weeb", 
    "Compulsive Gambler", "Mall Ninja", "Doomsday Prepper", "UFO Witness", "Ghost Hunter", 
    "Amateur of BDSM", "Virgin", "Obese", "Clinically Retarded", "Paraplegic", "Blind", "Deaf", "Mute",
    "Lizard Person Believer", "Time Traveler", "Reincarnated Pharoah", "Vampire", "Werewolf",
    "Zombie", "Alien", "Robot", "Cyborg", "Mutant", "Wizard", "Witch", "Warlock", "Sorcerer",
    "Mage", "Druid", "Cleric", "Paladin", "Bard", "Rogue", "Ranger", "Monk", "Barbarian",
    "Fighter", "Ninja", "Samurai", "Cowboy", "Pirate", "Viking", "Spartan", "Knight"
];

export const MALE_FLAVORS = [
    "Alpha Male", "Crypto Bro", "Foot Fetishist", "Gamer Girl Bath Water Buyer", 
    "Clinically Obsessed with Musk", "OnlyFans Simp", "Finance Bro", "Incel", 
    "Pick-up Artist", "Gym Rat", "Mansplainer", "Reply Guy", "Neckbeard"
];

export const FEMALE_FLAVORS = [
    "MLM 'Boss Babe'", "Hardcore K-Pop Stan", "Van Life Influencer", "Astrology Girlie",
    "Trad Wife", "Horse Girl", "Tennis Mom", "Karen", "Crystal Healer", "WitchToker",
    "Disney Princess Wannabe", "Cat Lady", "Wine Mom"
];
