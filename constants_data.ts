
import { CountryStats, Achievement } from './types';

// --- COUNTRY DATA ---
// SKILL IDs:
// Social: social_1 (Charisma), social_2 (Cold Read), social_3 (Silver Tongue)
// Tech: tech_1 (Script Opt), tech_2 (Doxxing), tech_3 (Toolkit)
// Ops: ops_1 (VPN), ops_2 (Botnet), ops_3 (Cleaner)

export const COUNTRY_DATA: Record<string, CountryStats> = {
  'North Korea': {
    id: 'North Korea', name: 'North Korea',
    description: 'State-sponsored hacking operations.',
    perkName: 'Bureau 121', perkDescription: 'Start with Botnet Miner (Passive Income).',
    weaknessName: 'Sanctioned', weaknessDescription: '20% fee on all earnings.',
    startingMoney: 200, startingThreat: 10, startingItems: [], 
    startingSkills: ['ops_1', 'ops_2'], // VPN Lvl 1, Botnet Lvl 1
    modifiers: { payoutMultiplier: 0.8 }
  },
  'Iran': {
    id: 'Iran', name: 'Iran',
    description: 'Cyber warfare specialists.',
    perkName: 'Cyber Army', perkDescription: 'Start with Level 3 VPN Tunneling.',
    weaknessName: 'Watchlist', weaknessDescription: 'Start with 20% Threat.',
    startingMoney: 800, startingThreat: 20, startingItems: [], 
    startingSkills: ['ops_1', 'ops_1', 'ops_1'], // VPN Lvl 3
    modifiers: { threatMultiplier: 1.1 }
  },
  'Bangladesh': {
    id: 'Bangladesh', name: 'Bangladesh',
    description: 'Volume-based clickfarm operations.',
    perkName: 'Clickfarm Funding', perkDescription: 'Start with $3,000 cash.',
    weaknessName: 'Latency', weaknessDescription: 'Hacks cost 10% more power.',
    startingMoney: 3000, startingThreat: 0, startingItems: [], startingSkills: [],
    modifiers: { trustStartBonus: -5 }
  },
  'India': {
    id: 'India', name: 'India',
    description: 'Social engineering infrastructure.',
    perkName: 'Call Center', perkDescription: 'Start with Voice Modulator item.',
    weaknessName: 'Saturated', weaknessDescription: 'Victims start with -10 Trust.',
    startingMoney: 1000, startingThreat: 0, startingItems: ['voice_modulator'], 
    startingSkills: ['social_1', 'social_1'], // Charisma Lvl 2
    modifiers: { trustStartBonus: -10 }
  },
  'Russia': {
    id: 'Russia', name: 'Russia',
    description: 'Hardline technical exploits.',
    perkName: 'FSB Intel', perkDescription: 'Start with Doxxing Suite (Tech Tier 2).',
    weaknessName: 'Notorious', weaknessDescription: 'Global Heat increases 25% faster.',
    startingMoney: 1200, startingThreat: 10, startingItems: [], 
    startingSkills: ['tech_1', 'tech_1', 'tech_1', 'tech_1', 'tech_1', 'tech_2'], // Tech 1 Maxed + Doxxing
    modifiers: { threatMultiplier: 1.25 }
  },
  'USA': {
    id: 'USA', name: 'USA',
    description: 'Corporate espionage.',
    perkName: 'Trust Fund', perkDescription: 'Start with high Social Standing (+15 Trust).',
    weaknessName: 'FBI Jurisdiction', weaknessDescription: 'Police = Game Over instantly (No escape chance).',
    startingMoney: 500, startingThreat: 0, startingItems: [], 
    startingSkills: ['social_1', 'social_1', 'social_1'], // Charisma Lvl 3
    modifiers: { trustStartBonus: 15 }
  },
  'Nigeria': {
    id: 'Nigeria', name: 'Nigeria',
    description: 'The origins of the trade.',
    perkName: 'Legacy', perkDescription: 'Start with Level 2 Silver Tongue.',
    weaknessName: 'Meme Status', weaknessDescription: 'Scams start with -20 Trust.',
    startingMoney: 600, startingThreat: 0, startingItems: [], 
    startingSkills: ['social_3', 'social_3'], // Silver Tongue Lvl 2
    modifiers: { trustStartBonus: -20 }
  },
  'China': {
    id: 'China', name: 'China',
    description: 'Industrial scale data harvesting.',
    perkName: 'Ministry of State Security', perkDescription: 'Start with Script Optimization Lvl 3.',
    weaknessName: 'Strict Quotas', weaknessDescription: 'Black Market items cost 20% more.',
    startingMoney: 1500, startingThreat: 0, startingItems: [], 
    startingSkills: ['tech_1', 'tech_1', 'tech_1'], // Script Opt Lvl 3
    modifiers: {} 
  }
};

export const COUNTRIES = Object.keys(COUNTRY_DATA);

// --- RANDOMIZERS (Restored & Expanded) ---
export const CLOTHING_STYLES = ['Business Suit', 'Hoodie & Jeans', 'Tactical Gear', 'Vintage Sweater', 'Designer Streetwear', 'Lab Coat', 'Leather Jacket', 'Tracksuit', 'Turtleneck & Blazer', 'Hawaiian Shirt', 'Hospital Scrubs', 'Military Uniform', 'Bathrobe', 'Tuxedo'];
export const FACIAL_FEATURES = ['Clean Shaven', 'Full Beard', 'Scarred', 'Piercings', 'Heavy Makeup', 'Glasses', 'Tattooed', 'Weathered', 'Gold Teeth', 'Eye Patch', 'Double Chin', 'Acne Scars', 'Freckles', 'Burn Marks', 'Cleft Lip'];
export const ACCESSORIES = ['Headphones', 'Gold Chain', 'VR Headset', 'Sunglasses', 'Fedora', 'Medical Mask', 'Smart Watch', 'Cybernetic Implant (Fake)', 'None', 'Neck Brace', 'Oxygen Tube', 'Face Tattoo'];
export const AGES = ['18-25', '26-35', '36-50', '50+', '70+'];

export const MALE_FIRST_NAMES = ["Bert", "Dante", "Finn", "Hans", "Jamal", "Liam", "Oscar", "Quincy", "Sven", "Tariq", "Viktor", "Yusuf", "Albert", "Charles", "Frank", "Harold", "Jack", "Leonard", "Norman", "Percy", "Ralph", "Thomas", "Walter", "Aiden", "Caleb", "Ethan", "Gavin", "Isaac", "Kai", "Mason", "Owen", "Riley", "Sam", "Alessandro", "Carlos", "Diego", "Fabio", "Hugo", "Javier", "Luca", "Mateo", "Octavio", "Paulo", "Rafael", "Thiago", "Bao", "Chen", "Dao", "Feng", "Genji", "Hiro", "Ichiro", "Jin", "Kenji", "Li", "Min", "Ryu", "Takumi", "Zhang", "Wei", "Richard", "Robert", "John", "William", "James", "Michael", "David", "Joseph", "Daniel", "Matthew", "Anthony", "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth", "Joshua", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Jose", "Adam", "Henry", "Kyle", "Chad", "Brad", "Hunter", "Connor", "Wyatt", "Cody", "Tanner", "Travis"];
export const FEMALE_FIRST_NAMES = ["Agnes", "Chiara", "Elara", "Greta", "Ingrid", "Keiko", "Mei", "Nia", "Priya", "Rosa", "Uma", "Ximena", "Zoe", "Beatrice", "Doris", "Evelyn", "Gertrude", "Ida", "Katherine", "Martha", "Olive", "Queenie", "Sylvia", "Ursula", "Vera", "Yvonne", "Bella", "Daisy", "Fiona", "Hazel", "Julia", "Luna", "Nora", "Piper", "Quinn", "Tessa", "Bianca", "Elena", "Gabriela", "Isabella", "Katarina", "Natalia", "Sofia", "Valentina", "Akira", "Emiko", "Naomi", "Sakura", "Yuki", "Eleanor", "Margaret", "Dorothy", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Sandra", "Ashley", "Kimberly", "Donna", "Emily", "Michelle", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon", "Cynthia", "Kathleen", "Amy", "Shirley", "Angela", "Helen", "Anna", "Brenda", "Pamela", "Nicole", "Emma", "Samantha", "Christine", "Debra", "Rachel", "Catherine", "Carolyn", "Janet", "Ruth", "Maria", "Heather", "Diane", "Virginia", "Julie", "Joyce", "Victoria", "Olivia", "Kelly", "Christina", "Lauren", "Joan", "Judith", "Megan", "Cheryl", "Andrea", "Hannah", "Jacqueline", "Frances", "Gloria", "Ann", "Teresa", "Kathryn", "Sara", "Janice", "Jean", "Alice", "Madison", "Abigail", "Judy", "Grace", "Tiffany", "Amber", "Crystal", "Brittany"];
export const LAST_NAMES = ["Vancroft", "Dubois", "Patel", "Kim", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell", "Sullivan", "Bell", "Coleman", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Hayes", "Myers", "Ford", "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole", "West", "Jordan", "Owens", "Reynolds", "Fisher", "Ellis", "Harrison", "Gibson", "McDonald", "Cruz", "Marshall", "Ortiz", "Gomez", "Murray", "Freeman", "Wells", "Webb", "Simpson", "Stevens", "Tucker", "Porter", "Hunter", "Hicks", "Crawford", "Henry", "Boyd", "Mason", "Morales", "Kennedy", "Warren", "Dixon", "Ramos", "Reyes", "Burns", "Gordon", "Shaw", "Holmes", "Rice", "Robertson", "Hunt", "Black", "Daniels", "Palmer", "Mills", "Nichols", "Grant", "Knight", "Ferguson", "Rose", "Stone", "Hawkins", "Dunn", "Perkins", "Trump", "Musk", "Bezos", "Zuckerberg", "Gates"];

export const OCCUPATIONS = [
    "Underwater Welder", "Professional Dog Walker", "Failed Crypto Trader", "Antique Doll Restorer", "High School Vice Principal", "Night Shift Security Guard", "Discord Moderator", "Freelance Reiki Healer", "Taxidermist", "Regional Manager for a Paper Company", "Submarine Technician", "Retired Opera Singer", "Uber Driver who is also a DJ", "Landscape Architect", "Forensic Accountant", "Stay-at-home Astronaut", "Cat Cafe Owner", "Vintage Typewriter Repairman", "Influencer Manager", "Conspiracy Blog Writer", "Zumba Instructor", "Ethical Hacker", "Unethical Hacker", "Professional Cuddler", "Ghost Hunter", "Flavor Text Writer", "Mushroom Farmer", "Competitive Eater", "Medieval Reenactor", "Ventriloquist", "Librarian", "Bartender", "Yoga Teacher", "Used Car Salesman", "Politician", "Dentist", "Florist", "Plumber", "Electrician", "Chef", "Pilot", "Flight Attendant", "Nurse", "Firefighter", "Police Officer", "Lawyer", "Judge", "Journalist", "Editor", "Graphic Designer", "Web Developer", "Data Analyst", "Scientist", "Researcher", "Professor", "Student", "Artist", "Musician", "Actor", "Director", "Producer", "Screenwriter", "Author", "Poet", "Dancer", "Choreographer", "Athlete", "Coach", "Referee", "Trainer", "Therapist", "Counselor", "Social Worker", "Volunteer", "Activist", "Pastor", "Priest", "Rabbi", "Imam", "Monk", "Nun", "Psychic", "Astrologer", "Magician", "Clown", "Mime", "Stuntman", "Bodyguard", "Private Investigator", "Spy", "Soldier", "Sailor", "Marine", "Airman", "Astronaut", "Explorer", "Adventurer", "Traveler", "Nomad", "Hermit", "Farmer", "Rancher", "Fisherman", "Hunter", "Miner", "Logger", "Construction Worker", "Factory Worker", "Mechanic", "Driver", "Courier", "Postal Worker", "Sanitation Worker", "Janitor", "Maid", "Butler", "Nanny", "Au Pair", "Babysitter", "Tutor", "Teacher", "Principal", "Administrator", "Executive", "Manager", "Supervisor", "Coordinator", "Director", "VP", "CEO", "CFO", "CTO", "COO", "Owner", "Founder", "Entrepreneur", "Investor", "Banker", "Teller", "Broker", "Agent", "Consultant", "Advisor", "Strategist", "Analyst", "Auditor", "Accountant", "Bookkeeper", "Clerk", "Receptionist", "Secretary", "Assistant", "Associate", "Intern", "Apprentice", "Novice", "Master", "Grandmaster", "Ex-KGB Agent", "Former CIA Analyst", "Disgraced Mayor", "Lottery Winner", "Doomsday Prepper", "Flat Earth Society President", "UFO Witness", "Time Traveler (Claimed)", "Reincarnated Pharoah", "Bitcoin Early Adopter", "NFT Artist", "Professional Gambler", "Poker Pro", "Chess Grandmaster", "Rocket Scientist", "Brain Surgeon", "Quantum Physicist", "Philosopher", "Historian", "Archaeologist", "Paleontologist", "Geologist", "Meteorologist", "Astronomer", "Biologist", "Chemist", "Physicist", "Mathematician", "Statistician", "Economist", "Sociologist", "Psychologist", "Anthropologist", "Linguist", "Translator", "Interpreter", "Writer", "Blogger", "Vlogger", "Podcaster", "Streamer", "Pet Psychic", "Vape Shop Owner"
];

export const QUIRKS = [
    "Obsessed with their 12 cats", "Thinks 5G causes birds to spy on them", "Is currently cooking a complex meal", "Hates technology, prefers fax machines", "Is extremely lonely and just wants to chat", "Is secretly a hacker themselves", "Believes they are royalty", "Has short term memory loss", "Is in a noisy environment (airport/club)", "Is extremely stingy with money", "Is overly flirtatious", "Quotes movies constantly", "Speaks in the third person", "Is terrified of the color yellow", "Collects spoons", "Thinks they are in a vampire", "Is training for a marathon right now", "Has a parrot that repeats everything", "Is convinced you are an alien", "Refuses to say the word 'money'", "Is writing a novel about this conversation", "Thinks they are in a simulation", "Is extremely superstitious", "Will only reply in haiku", "Is currently skydiving", "Is holding a seance", "Is being chased by bees", "Is actively knitting a sweater", "Is solving a crossword puzzle", "Is eating crunchy chips loudly", "Has a crying baby nearby", "Is practicing opera singing", "Is mowing the lawn", "Is in a library whispering", "Is at a heavy metal concert", "Is underwater", "Is on a rollercoaster", "Is in space", "Is a ghost", "Is a time traveler", "Is a robot", "Is a dog", "Is a cat", "Is a fish", "Is a plant", "Is a rock", "Is a cloud", "Is a star", "Is a black hole", "Is a universe", "Is a multiverse", "Is nothing", "Is everything", "Is God", "Is Satan", "Is Santa Claus", "Is the Easter Bunny", "Is the Tooth Fairy", "Is Bigfoot", "Is the Loch Ness Monster", "Is a unicorn", "Is a dragon", "Is a fairy", "Is a mermaid", "Is a pirate", "Is a ninja", "Is a cowboy", "Is a samurai", "Is a knight", "Is a viking", "Is a spartan", "Calls everyone 'Darling' condescendingly", "Ends every sentence with 'Change my mind'", "Is terrified of vowels", "Types exclusively with their nose", "Believes they are currently on fire", "Is suspicious of the letter H", "Thinks you are their dead spouse", "Is pretending to be French", "Is allergic to questions", "Responds only in song lyrics", "Is communicating via Morse code translations", "Is a sovereign citizen", "Thinks they are the President", "Is hiding from the mob", "Is currently diffusing a bomb", "Is watching paint dry", "Is waiting for the rapture", "Is counting rice grains", "Is sorting M&Ms by color", "Is repainting their ceiling", "Is bathing a lizard", "Is arguing with a toaster", "Is teaching a fish to read", "Is convinced you are an IRS auditor", "Is currently being audited by the real IRS", "Is a compulsive liar", "Cannot lie (cursed)", "Speaks only in questions?", "Is offended by everything", "Is impressed by nothing", "Is trying to sell YOU a scam", "Is a rival scammer", "Is a police officer undercover", "Is your dad", "Is your mom", "Is your ex", "Is your future self", "Is an AI realizing it's an AI", "Is a glitched NPC", "Is scared of their own reflection", "Thinks they are invisible", "Is convinced the floor is lava", "Is trying to contact aliens", "Is a werewolf", "Is a vampire", "Is a zombie", "Is a ghost hunter", "Is a flat earther", "Is a moon landing denier", "Is a lizard person believer", "Is a illuminati member", "Is a freemason", "Is a scientologist", "Is a pastafarian", "Is a jedi", "Is a sith", "Is a wizard", "Is a witch", "Is a warlock", "Is a sorcerer", "Is a mage", "Is a druid", "Is a cleric", "Is a paladin", "Is a bard", "Is a rogue", "Is a ranger", "Is a monk", "Is a barbarian", "Is a fighter", "Is convinced the keyboard is hot", "Refuses to use the letter 'e'", "Types with their toes", "Is narrating their life out loud", "Thinks the government is listening through the toaster", "Is terrified of clouds", "Collects toenail clippings", "Is allergic to water", "Is a breatharian", "Is sun gazing", "Is hugging a tree", "Is talking to plants", "Is waiting for a sign from the universe", "Is decoding a secret message in their cereal", "Is building a bunker", "Is wearing a tinfoil hat", "Is convinced birds are government drones", "Is afraid of silence", "Is addicted to nasal spray", "Is chewing on a pen", "Is playing with a fidget spinner", "Is popping bubble wrap", "Is cracking their knuckles", "Is whistling a tune", "Is humming", "Is beatboxing", "Is rapping", "Is singing", "Is yodeling", "Is screaming internally", "Is screaming externally", "Is crying", "Is laughing maniacally", "Is staring into the void", "Is meditating", "Is levitating", "Is astral projecting", "Is lucid dreaming", "Is sleepwalking", "Is sleep talking", "Is sleep eating", "Is sleep texting", "Is sleep hacking", "Uses *asterisk actions*", "Thinks you are FBI", "Typing like a boomer...", "Writes in ALL CAPS", "Uses excessive emojis 😂😂😂", "Types lyk dis", "Confuses you with their grandson", "Is incredibly horny", "Is incredibly pure and innocent", "Is drunk", "Is high", "Is sleep deprived", "Is hyped on caffeine"
];

export const NEUTRAL_FLAVORS = [
    "Discord Mod", "Furry", "Flat Earther", "Sovereign Citizen", "Disney Adult", 
    "Bio-Hacker", "Raw Vegan", "Professional Victim", "Internet Troll", "Weeb", 
    "Compulsive Gambler", "Mall Ninja", "Doomsday Prepper", "UFO Witness", "Ghost Hunter", 
    "Amateur of BDSM", "Virgin", "Obese", "Clinically Retarded", "Paraplegic", "Blind", "Deaf", "Mute",
    "Lizard Person Believer", "Time Traveler", "Reincarnated Pharoah", "NFT Artist",
    "Crypto Scammer", "Ex-convict", "Down Syndrome", "Sexist", "4Chan Enthousiast", "IPad addict",
    "PC Master Race Elitist", "CrossFitter", "Ancient Aliens Theorist", "Dropshipper",
    "Alpha Male Podcaster", "Boomer", "Bath Salts Connoisseur", "Gas Station Knife Collector",
    "Public Masturbator", "Serial Arsonist", "Goon Cave Dweller", "Simp Lord", "Urine Therapy Advocate",
    "Cult Leader", "Prophet of Doom", "Human Pet", "Neckbeard", "Hoarder", "Stoner", "Currently in jail"
];

export const MALE_FLAVORS = [
    "Alpha Male", "Crypto Bro", "Foot Fetishist", "Gamer Girl Bath Water Buyer", 
    "Clinically Obsessed with Musk", "OnlyFans Simp", "Finance Bro", "Incel", 
    "Pick-up Artist", "Gym Rat", "Mansplainer", "Reply Guy", "Neckbeard", "Finance Bro",
    "Florida Man", "Simp"
];

export const FEMALE_FLAVORS = [
    "MLM 'Boss Babe'", "Hardcore K-Pop Stan", "Van Life Influencer", "Astrology Girlie",
    "Trad Wife", "Horse Girl", "Tennis Mom", "Karen", "Crystal Healer", "WitchToker",
    "Disney Princess Wannabe", "Cat Lady", "Wine Mom", "E-Girl", "Astrology Girl", "Trad Wife",
    "MLM Boss Babe", "Karen", "Reddit Feminist", "Swiftie", "Crazy Cat Lady", "Horse girl"
];

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
    { id: 'ach_nft', title: 'Right Click Save', description: 'Success: NFT Art Commission', icon: 'Image' },
    { id: 'ach_rental', title: 'Landlord', description: 'Success: Apartment Rental', icon: 'Home' },
    { id: 'ach_refund', title: 'Refunds Dept', description: 'Success: Subscription Refund', icon: 'RefreshCcw' },
];
