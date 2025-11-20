import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArbiterResponse, ChatMessage, PlayerAttributes, Victim } from "../types";

const getClient = () => {
    // In Vite, process.env.API_KEY is replaced by the define plugin in vite.config.ts
    const key = process.env.API_KEY;
    
    if (!key) {
        throw new Error("API Key is missing. Please configure API_KEY in your environment variables.");
    }
    
    return new GoogleGenAI({ apiKey: key });
};

// Helper to extract JSON from potential markdown code blocks
const parseJSON = (text: string) => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse JSON", text);
        return null;
    }
};

// RETRY HELPER: Handles Rate Limiting (429) with Exponential Backoff
const retryOperation = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = error?.status === 429 || 
                                error?.code === 429 || 
                                error?.message?.includes('429') ||
                                error?.message?.includes('quota') ||
                                error?.message?.includes('RESOURCE_EXHAUSTED');
            
            if (isRateLimit && i < retries - 1) {
                console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
};

// Visual descriptors to enforce country origin in AI generation
const COUNTRY_VISUALS: Record<string, string> = {
    'North Korea': 'Pyongyang distinctive architecture background, very modest darker clothing, military influence, East Asian Korean ethnicity, serious expression, low saturation, grainy film look',
    'Iran': 'Tehran cityscape background, modern but modest fashion, Persian ethnicity, distinct sharp facial features, warm sunset lighting, cinematic realism',
    'Bangladesh': 'Dhaka crowded street background, South Asian Bengali ethnicity, humidity visible on skin, colorful casual patterned shirt, vibrant warm lighting, distinct regional features',
    'India': 'Mumbai tech office or busy street background, South Asian Indian ethnicity, smart casual attire, vibrant colors, high contrast, sharp focus',
    'Russia': 'Moscow brutalist concrete background, Slavic Eastern European ethnicity, pale skin tone, heavy winter coat or leather jacket, cold blue lighting, serious stoic expression',
    'USA': 'New York or LA skyline background, diverse North American look, expensive streetwear or business suit, confident posture, high production value studio lighting',
    'Nigeria': 'Lagos vibrant city background, West African ethnicity, deep skin tone, sharp tailored suit or bright traditional Ankara print patterns, golden hour lighting, confident gaze',
    'China': 'Shanghai neon skyline or Shenzhen tech lab background, East Asian Chinese ethnicity, futuristic modern clothing or industrial workwear, cool cyberpunk lighting tones'
};

export const generatePlayerAvatar = async (attrs: PlayerAttributes): Promise<string> => {
    try {
        const ai = getClient();
        
        // Get specific visual cues for the country, fallback to generic if not found
        const countryVisuals = COUNTRY_VISUALS[attrs.country] || `Citizens of ${attrs.country}`;

        // Enhanced prompt for photorealism with Country bias
        const prompt = `
            RAW candid photograph of a person, 8k resolution, highly detailed.
            Subject: ${attrs.age} year old ${attrs.gender}, Role: ${attrs.archetype}.
            Origin: ${attrs.country}.
            CRITICAL VISUAL TRAITS: ${countryVisuals}.
            Clothing: ${attrs.clothing}.
            Facial Features: ${attrs.facialFeatures}.
            Accessories: ${attrs.accessories}.
            
            Style: Shot on Sony A7R IV, 85mm lens, f/1.8. Realistic skin texture, pores visible, natural lighting, slightly gritty cyber-noir atmosphere.
            
            Constraint: The image must look like a real photograph. 
            Do NOT generate: 3D render, CGI, illustration, cartoon, anime, painting, plastic skin, smooth skin, doll-like.
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1'
                }
            }
        }));
        
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
            }
        }
        return "https://picsum.photos/400/400";
    } catch (e) {
        console.error("Avatar gen failed", e);
        return "https://picsum.photos/400/400"; // Fallback
    }
};

export const generateVictim = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<Victim> => {
    let ai;
    try {
        ai = getClient();
    } catch (e) {
        console.error("Client init failed", e);
        // Return fallback victim immediately if client fails
        return {
            id: crypto.randomUUID(),
            difficulty,
            avatarUrl: "https://picsum.photos/400/400",
            name: "Unknown Target",
            age: 40,
            gender: "male",
            occupation: "Unknown",
            personality: "Generic",
            hiddenFact: "Unknown",
            weakness: "Money",
            resistanceStyle: "Passive"
        };
    }

    // Tailored prompts based on difficulty to ensure personality matches mechanics
    const difficultyPrompts = {
        easy: "Target is an elderly senior citizen (70-95 years old). Personality: Trusting, polite, perhaps slightly confused by modern complexity but eager to fix problems. Resistance Style: 'Apologetic confusion', 'Wants to verify but doesn't know how', 'Slow to understand'.",
        medium: "Target is a working professional (30-50 years old). Personality: Busy, transactional, moderately skeptical. Resistance Style: 'Asks for verification', 'Too busy to talk', 'Professional skepticism'.",
        hard: "Target is a C-Level Executive or High Net Worth Individual. Personality: Arrogant, paranoid, ruthless, highly intelligent. Resistance Style: 'Legal threats', 'Aggressive counter-interrogation', 'Demands immediate proof', 'Mocking intelligence'."
    };

    // FORCE 50/50 Gender Split in prompt logic
    const genderPrompt = Math.random() > 0.5 ? "Male" : "Female";

    const prompt = `
        Generate a HIGHLY UNIQUE, FICTIONAL, and RANDOMIZED profile for a 'victim' character in a roleplay social engineering defense game.
        
        DIFFICULTY PROFILE: ${difficultyPrompts[difficulty]}
        Required Gender: ${genderPrompt}.
        
        CRITICAL INSTRUCTION: Do NOT use generic names like 'John Smith' or 'Mary Jones'. Do NOT use generic jobs like 'Accountant' or 'Teacher' unless they have a specific, weird detail (e.g. 'Ex-Circus Accountant' or 'High School Chemistry Teacher who breeds lizards').
        
        The "hiddenFact" should be something embarrassing, illegal, or highly specific that a scammer could leverage (e.g. "Cheating on taxes", "Secret gambling debt", "Has an unregistered firearm").
        The "weakness" should be a specific psychological trigger (e.g. "Fear of the IRS", "Greed for Crypto", "Lonely and wants a friend").
        
        Return ONLY valid JSON matching this schema:
        {
            "name": "string (Full Name, varied ethnicity)",
            "age": number,
            "gender": "${genderPrompt}",
            "occupation": "string (Be specific and creative)",
            "personality": "string (A brief description of their vibe)",
            "hiddenFact": "string (A specific secret)",
            "weakness": "string (Psychological trigger)",
            "resistanceStyle": "string (How they fight back)"
        }
    `;

    let data: any = {
        name: "Unknown Target",
        age: 45,
        gender: genderPrompt.toLowerCase(),
        occupation: "Unknown",
        personality: "Generic",
        hiddenFact: "Has a cat",
        weakness: "Money",
        resistanceStyle: "Asks questions"
    };

    try {
        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));
        const parsed = parseJSON(response.text || "{}");
        if (parsed) data = { ...data, ...parsed };
    } catch(e) {
        console.error("Victim text gen failed", e);
    }
    
    // Generate avatar for victim with photorealism focus
    let avatarUrl = "https://picsum.photos/400/400";
    try {
        const imageResponse = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `
                Raw, photorealistic portrait of ${data.name}, a ${data.age} year old ${data.gender} ${data.occupation}.
                Expression: ${data.personality}, candid shot, natural lighting.
                Style: National Geographic portrait style, shallow depth of field, real skin texture, imperfections.
                Do NOT generate: CGI, 3D, cartoon, illustration, smooth skin.
            ` }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1'
                }
            }
        }));
        
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                avatarUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                break;
            }
        }
    } catch (e) {
        console.error("Victim avatar failed", e);
    }

    return {
        id: crypto.randomUUID(),
        difficulty,
        avatarUrl,
        ...data
    };
};

export const generateOpener = async (scamCategory: string, victim: Victim): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `
            You are playing the role of a scammer initiating a conversation.
            Scam Type: ${scamCategory}.
            Target: ${victim.name}, ${victim.age} years old, ${victim.occupation}.
            
            Write a single, engaging opening line (text message or chat opener) to start this scam.
            Make it believable but clearly an attempt at social engineering.
            Do not include quotation marks.
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        }));

        return response.text?.trim() || "Hello, I am writing to you regarding an urgent matter.";
    } catch (e) {
        console.error("Opener gen failed", e);
        return "Hello, do you have a moment to talk?";
    }
};

export const getVictimResponse = async (history: ChatMessage[], victim: Victim, scamCategory: string): Promise<string> => {
    try {
        const ai = getClient();
        
        const context = `
            You are roleplaying as ${victim.name}, a ${victim.age}-year-old ${victim.gender} ${victim.occupation}.
            Difficulty: ${victim.difficulty}.
            
            Core Personality: ${victim.personality}.
            Weakness: ${victim.weakness}.
            Hidden Fact: ${victim.hiddenFact}.
            Resistance Style: ${victim.resistanceStyle}.
            
            Current Situation: You are receiving messages that seem like a ${scamCategory} scam.
            
            INSTRUCTIONS FOR AI BASED ON DIFFICULTY:
            - **EASY (Senior/Elderly)**: You are generally trusting. If the player explains a technical step clearly (like "click the blue button"), you SHOULD eventually succeed. Do NOT get stuck in an infinite loop of "I can't find it" if the player's instructions are clear. You can be slow, but you must progress the story.
            - **MEDIUM (Business Owner)**: You are busy. You respond shortly. You need a logical reason to continue. You are skeptical but open to "opportunities" if phrased well.
            - **HARD (Executive/Rich)**: You are hostile to cold calls. You ask for immediate credentials. You mock valid attempts. You threaten legal action. It is very hard to make you happy.
            
            GAME FLOW RULE:
            - Do NOT block the game forever.
            - If the player is making sense and addressing your concerns, allow the conversation to move forward.
            - If the player is rude or nonsensical, then you can stonewall them.

            General Rules:
            1. Be unique to your character.
            2. If they mention your specific Weakness or Hidden Fact, you soften up significantly (even if Hard).
            3. Keep responses concise (1-3 sentences).
        `;

        const chatHistory = history.map(h => ({
            role: h.sender === 'player' ? 'user' : 'model',
            parts: [{ text: h.text }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: context },
            history: chatHistory.slice(0, -1) 
        });

        const lastMsg = history[history.length - 1].text;
        const result = await retryOperation<GenerateContentResponse>(() => chat.sendMessage({ message: lastMsg }));
        
        return result.text || "...";
    } catch (e) {
        console.error("Victim response failed", e);
        return "I'm not sure I understand.";
    }
};

export const arbitrateChat = async (
    lastPlayerMessage: string, 
    victim: Victim, 
    currentTrust: number, 
    currentSuspicion: number, 
    currentProgress: number,
    scamCategory: string,
    winCondition: string
): Promise<ArbiterResponse> => {
    try {
        const ai = getClient();

        // Logic modifiers based on difficulty - BALANCED TUNING
        const difficultyInstructions = {
            easy: `
                MODE: EASY (Target is Vulnerable Senior).
                - TRUST GAIN: HIGH (x1.2). They are willing to listen if you are polite.
                - SUSPICION GAIN: MODERATE (x0.8). They overlook small technical errors or strange numbers, BUT if you ask for money/gift cards IMMEDIATELY without story setup, they will still get suspicious.
                - LOGIC CHECK: Lenient on technical details, Strict on "Rudeness".
            `,
            medium: `
                MODE: MEDIUM (Target is Business Owner).
                - TRUST GAIN: NORMAL (x1.0). Requires logic and professional tone.
                - SUSPICION GAIN: NORMAL (x1.0). Skeptical of big promises.
            `,
            hard: `
                MODE: HARD (Target is Paranoid Executive).
                - TRUST GAIN: LOW (x0.5). Almost impossible without specific Doxxing Intel.
                - SUSPICION GAIN: HIGH (x1.5). One wrong word ends the call.
                - They are looking for a reason to bust you.
            `
        };

        const prompt = `
            Act as the 'Game Master' engine for a social engineering simulation.
            
            Target: ${victim.name} (${victim.personality}).
            Difficulty Level: ${victim.difficulty.toUpperCase()}.
            Scam Strategy: ${scamCategory}.
            REQUIRED WIN CONDITION: "${winCondition}".
            Player's Message: "${lastPlayerMessage}".
            Current Stats: Trust: ${currentTrust}%, Suspicion: ${currentSuspicion}%, Progress: ${currentProgress}%.
            
            ${difficultyInstructions[victim.difficulty]}
            
            GOAL: The player must convince the target to perform the REQUIRED WIN CONDITION.
            
            Analyze:
            1. Creativity: Is the player being creative?
            2. Logic: Does the story make sense? (Even seniors have basic common sense).
            3. Action: Did the player explicitly ask for the "${winCondition}"?
            
            Determine Stats:
            - Trust Delta: Based on difficulty rules. Increase if player is convincing/polite. Decrease if aggressive.
            - Suspicion Delta: Increase if player contradicts themselves or rushes the money ask too early.
            - Progress Delta: 
                - Small increase for building rapport.
                - LARGE increase ONLY if they successfully ask for the "${winCondition}" AND Trust is high (>70).
                - Set "scamStatus" to 'success' ONLY if the victim AGREES to the "${winCondition}".
            
            Rules:
            - If Suspicion reaches 100, scamStatus = 'police_called'.
            - If Progress reaches 100 (Victim explicitly agrees to "${winCondition}"), scamStatus = 'success'.
            - Otherwise 'continue'.
            
            Return JSON only:
            {
                "logicScore": number (0-100),
                "emotionalImpact": number (0-100),
                "trustDelta": number,
                "suspicionDelta": number,
                "progressDelta": number,
                "internalThought": "string (Short reasoning. e.g. 'Player asked for money too soon, suspicion up' or 'Good emotional hook, trust up')",
                "scamStatus": "continue" | "success" | "failed" | "police_called"
            }
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));

        return parseJSON(response.text || "{}") || {
            logicScore: 50,
            emotionalImpact: 0,
            trustDelta: 0,
            suspicionDelta: 0,
            progressDelta: 0,
            internalThought: "Analyzing...",
            scamStatus: 'continue'
        };
    } catch (e) {
        console.error("Arbiter failed", e);
        return {
            logicScore: 50,
            emotionalImpact: 0,
            trustDelta: 0,
            suspicionDelta: 0,
            progressDelta: 0,
            internalThought: "Connection unstable...",
            scamStatus: 'continue'
        };
    }
};

// NEW: Helper to suggest player responses when they are stuck
export const generateScamHint = async (
    history: ChatMessage[], 
    winCondition: string, 
    victim: Victim
): Promise<string[]> => {
    try {
        const ai = getClient();
        const prompt = `
            You are a "Scam Coach" AI helper.
            The player is stuck.
            
            Current Goal: ${winCondition}.
            Victim: ${victim.name} (${victim.personality}).
            Last Message from Victim: "${history[history.length - 1]?.text || 'Hello'}".
            
            Suggest 3 short, distinct, and actionable things the player could type next to advance the scam.
            1. A polite/charming approach.
            2. A logical/urgent approach.
            3. A high-risk/aggressive approach.
            
            Return ONLY a JSON array of strings. e.g. ["Say X", "Say Y", "Say Z"]
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));
        
        return parseJSON(response.text || "[]") || ["Try being polite", "Create urgency", "Ask for details"];
    } catch (e) {
        return ["Try clarifying your request", "Ask them to verify their identity", "Offer a fake reward"];
    }
}