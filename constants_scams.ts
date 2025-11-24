
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
  "Employment Mule Scam",
  "NFT Art Commission",
  "Apartment Rental",
  "Subscription Refund",
  "Influencer Brand Deal",
  "Fake Scholarship",
  "Lost Pet Return"
];

interface ScamScenario {
    mini1: string;
    mini2: string;
    final: string;
}

// UPDATED SCENARIOS: Massive Variety Expansion & Concrete Verification
export const SCAM_SCENARIOS: Record<string, ScamScenario[]> = {
  "Grandson in Trouble": [
    { mini1: "Get them to say your name", mini2: "Get them to promise secrecy", final: "Secure bail money" },
    { mini1: "Convince them you are in Mexico", mini2: "Get them to ask for Lawyer", final: "Get Gift Card codes" },
    { mini1: "Confirm they are alone", mini2: "Make them say 'I will help'", final: "Pay for Emergency Surgery" }
  ],
  "IRS Tax Audit": [
    { mini1: "Confirm Full Legal Name", mini2: "Admit to ignoring notices", final: "Pay back taxes via Bitcoin" },
    { mini1: "Verify mailing address", mini2: "Repeat Case ID", final: "Purchase Federal Vouchers" },
    { mini1: "Get SSN last 4 digits", mini2: "Apologize for error", final: "Wire transfer to Treasury" }
  ],
  "Tech Support Virus": [
    { mini1: "Read Error Code", mini2: "Download AnyDesk", final: "Grant remote access" },
    { mini1: "Identify Computer Model", mini2: "Find Windows Key", final: "Pay Firewall Fee" },
    { mini1: "Restart router", mini2: "Read IP address", final: "Buy Anti-Hacker sub" }
  ],
  "Lottery Winner": [
    { mini1: "Confirm Date of Birth", mini2: "Confirm email", final: "Pay Customs Duty" },
    { mini1: "Shout 'I Won!'", mini2: "Choose Lump Sum", final: "Pay Processing Fee" },
    { mini1: "Name desired car", mini2: "Confirm home address", final: "Pay State Tax" }
  ],
  "Crypto Investment Opportunity": [
    { mini1: "Find annual income", mini2: "Download Wallet App", final: "Send ETH to Pool" },
    { mini1: "Name owned coin", mini2: "Admit past losses", final: "Share Seed Phrase" },
    { mini1: "Say 'I want freedom'", mini2: "Join VIP Telegram", final: "Connect wallet to dApp" }
  ],
  "Romance Scam": [
    { mini1: "Get first pet name", mini2: "Type 'I love you'", final: "Pay for Plane Ticket" },
    { mini1: "Find childhood street", mini2: "Admit loneliness", final: "Send Surgery Money" },
    { mini1: "Name favorite teacher", mini2: "Promise marriage", final: "Pay Ring Customs Fee" }
  ],
  "Business Email Compromise": [
    { mini1: "Name Accounting Manager", mini2: "Get Invoice Number", final: "Change bank details" },
    { mini1: "Get phone extension", mini2: "Agree to confidentiality", final: "Approve CEO Wire" },
    { mini1: "Confirm bank name", mini2: "Forward Overdue Invoice", final: "Pay Auditor" }
  ],
  "Kidnapping Hoax": [
    { mini1: "Confirm child name", mini2: "Promise no police", final: "Drop cash at location" },
    { mini1: "Describe child clothing", mini2: "Beg for mercy", final: "Wire ransom money" },
    { mini1: "Verify phone number", mini2: "Drive to Safe Point", final: "Purchase ransom Crypto" }
  ],
  "Charity Fraud": [
    { mini1: "Support the cause", mini2: "Get zip code", final: "Setup recurring donation" },
    { mini1: "Name lost relative", mini2: "Become Gold Member", final: "Donate to Foundation" },
    { mini1: "Confirm Voter Status", mini2: "Get email", final: "Buy Gala ticket" }
  ],
  "Inheritance Advance Fee": [
    { mini1: "Get ID photo", mini2: "Get bank name", final: "Pay Legal Fees" },
    { mini1: "Confirm father middle name", mini2: "Sign NDA", final: "Pay Transfer Tax" },
    { mini1: "State citizenship", mini2: "Say 'I accept'", final: "Pay Notary Fee" }
  ],
  "Employment Mule Scam": [
    { mini1: "Confirm employment status", mini2: "Get ID photo", final: "Buy Office Equipment" },
    { mini1: "Name last boss", mini2: "Sign Contract", final: "Cash check return diff" },
    { mini1: "Confirm home office", mini2: "Get routing number", final: "Pay Software License" }
  ],
  "NFT Art Commission": [
    { mini1: "Describe art style", mini2: "Admit need exposure", final: "Pay Minting Fee" },
    { mini1: "Name portfolio site", mini2: "Setup MetaMask", final: "Authorize smart contract" },
    { mini1: "Say 'WAGMI'", mini2: "Download Collab Tool", final: "Drain wallet" }
  ],
  "Apartment Rental": [
    { mini1: "Confirm move-in date", mini2: "Say love photos", final: "Send Security Deposit" },
    { mini1: "Name current landlord", mini2: "Agree sight-unseen", final: "Pay Application Fee" },
    { mini1: "Confirm no pets", mini2: "Get ID photo", final: "Wire First Month Rent" }
  ],
  "Subscription Refund": [
    { mini1: "Confirm Amazon/Norton use", mini2: "Log into bank", final: "Return over-refund" },
    { mini1: "Type Refund Code", mini2: "Open TeamViewer", final: "Buy Gift Cards" },
    { mini1: "Confirm last purchase", mini2: "Check Spam Folder", final: "Approve transaction" }
  ],
  "Influencer Brand Deal": [
    { mini1: "Get social handle", mini2: "Agree to Post Story", final: "Pay Shipping" },
    { mini1: "Confirm follower count", mini2: "Get clothing size", final: "Pay Agent Fee" },
    { mini1: "Say 'I love brand'", mini2: "Get shipping address", final: "Pay Customs Duty" }
  ],
  "Fake Scholarship": [
    { mini1: "Confirm GPA", mini2: "Write 1-sentence Essay", final: "Pay Registration Fee" },
    { mini1: "Name University", mini2: "Confirm financial need", final: "Pay Processing Tax" },
    { mini1: "State Major", mini2: "Get Student ID", final: "Wire Disbursement Fee" }
  ],
  "Lost Pet Return": [
    { mini1: "Name lost pet", mini2: "Describe collar", final: "Pay Airline Crating" },
    { mini1: "Confirm missing date", mini2: "Cry or say Thanks", final: "Pay Vet Bill" },
    { mini1: "Confirm home address", mini2: "Promise Reward", final: "Send Gas Money" }
  ]
};
