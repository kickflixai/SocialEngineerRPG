
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArbiterResponse, ChatMessage, PlayerAttributes, Victim, ScamObjective } from "../types";
import { OCCUPATIONS, QUIRKS, SPEECH_STYLES_BY_AGE, FIRST_NAMES, LAST_NAMES, VICTIM_FLAVORS } from "../constants";

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
        
        const imageResponse = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1'
                }
            }
        }));
        
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
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
        return {
            id: crypto.randomUUID(),
            difficulty,
            avatarUrl: "https://picsum.photos/400/400",
            name: "Unknown Target",
            age: 40,
            gender: "male",
            occupation: "Unknown",
            personality: "Generic",
            archetype: "Average Joe",
            flavor: "Boring",
            speechStyle: "Normal",
            hiddenFact: "Unknown",
            weakness: "Money",
            resistanceStyle: "Passive"
        };
    }

    // PROCEDURAL PERSONA SEEDING
    const genderPrompt = Math.random() > 0.5 ? "Male" : "Female";
    const age = difficulty === 'easy' ? Math.floor(Math.random() * 20) + 65 : difficulty === 'medium' ? Math.floor(Math.random() * 30) + 25 : Math.floor(Math.random() * 20) + 30;
    
    // Name Generation from Lists
    const randFirst = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const randLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const forcedName = `${randFirst} ${randLast}`;

    // Select speech style based on age group
    let speechPool = SPEECH_STYLES_BY_AGE.adult;
    if (age < 30) speechPool = SPEECH_STYLES_BY_AGE.youth;
    if (age > 60) speechPool = SPEECH_STYLES_BY_AGE.elderly;
    
    const randSpeech = speechPool[Math.floor(Math.random() * speechPool.length)];
    const randJob = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
    
    // Pick Flavor (Edgy Trait)
    const randFlavor = VICTIM_FLAVORS[Math.floor(Math.random() * VICTIM_FLAVORS.length)];

    // Pick 3 distinct quirks for complexity
    const quirks = [];
    const quirksPool = [...QUIRKS];
    for(let i=0; i<3; i++) {
        const idx = Math.floor(Math.random() * quirksPool.length);
        quirks.push(quirksPool[idx]);
        quirksPool.splice(idx, 1);
    }
    const combinedQuirks = quirks.join(", ");

    // Tailored prompts based on difficulty to ensure personality matches mechanics
    const difficultyPrompts = {
        easy: `Target is an elderly/vulnerable person. 
               SEED: Lonely, confused, or overly trusting. 
               Resistance: 'Apologetic confusion', 'Wants to help but fails technology', 'Treats scammer like a grandkid'.`,
        medium: `Target is a working adult. 
               SEED: Busy, stressed, or specific hobbyist. 
               Resistance: 'Asks logic questions', 'Wants to get off the phone', 'Needs verification'.`,
        hard: `Target is High Net Worth or Tech Savvy. 
               SEED: Arrogant, Paranoid, or Powerful. 
               Resistance: 'Hostile questioning', 'Demands credentials', 'Threatens legal action'.`
    };

    const prompt = `
        Generate a HIGHLY UNIQUE profile for a social engineering target.
        
        DIFFICULTY: ${difficulty.toUpperCase()} (${difficultyPrompts[difficulty]})
        
        MANDATORY SEEDS (Incorporate these!):
        - Name: ${forcedName}
        - Occupation: ${randJob}
        - Speech Style: ${randSpeech}
        - Primary Trait/Flavor: ${randFlavor} (Make this DEFINING to their character)
        - Unique Quirks: ${combinedQuirks}
        - Gender: ${genderPrompt}
        - Age: ${age}
        
        CRITICAL INSTRUCTION: 
        1. Personality description must be CONCISE. Maximum 3-4 sentences.
        2. Avoid tropes. Make them feel like a real, weird human being.
        3. The "hiddenFact" should be specific dirt related to their "${randFlavor}" trait.
        4. The "weakness" should be a psychological trigger.
        
        Return ONLY valid JSON matching this schema:
        {
            "name": "${forcedName}",
            "age": number,
            "gender": "${genderPrompt}",
            "occupation": "string (The specific seeded job)",
            "personality": "string (Max 3-4 sentences)",
            "archetype": "string (Short label, e.g. 'The Paranoid Baker')",
            "speechStyle": "string (The seeded speech style)",
            "hiddenFact": "string",
            "weakness": "string",
            "resistanceStyle": "string"
        }
    `;

    let data: any = {
        name: forcedName,
        age: age,
        gender: genderPrompt.toLowerCase(),
        occupation: randJob,
        personality: `Generic person who ${combinedQuirks}`,
        archetype: "Random Citizen",
        flavor: randFlavor,
        speechStyle: randSpeech,
        hiddenFact: "Has a cat",
        weakness: "Money",
        resistanceStyle: "Asks questions"
    };

    try {
        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));
        const parsed = parseJSON(response.text || "{}");
        if (parsed) data = { ...data, ...parsed, flavor: randFlavor };
    } catch(e) {
        console.error("Victim text gen failed", e);
    }
    
    // Generate avatar
    let avatarUrl = "https://picsum.photos/400/400";
    try {
        const imageResponse = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `
                Raw, photorealistic portrait of ${data.name}, a ${data.age} year old ${data.gender} ${data.occupation}.
                Vibe: ${data.archetype} / ${randFlavor}. Feature: ${data.personality}.
                Style: Cinematic portrait, highly detailed, character study, imperfections, natural lighting.
                Do NOT generate: CGI, 3D, cartoon, illustration.
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
            Target: ${victim.name}, a ${victim.occupation} who is ${victim.archetype}.
            Trait: ${victim.flavor}.
            
            Write a single, engaging opening line.
            Make it believable but clearly an attempt at social engineering.
            Do not include quotation marks.
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt
        }));

        return response.text?.trim() || "Hello, I am writing to you regarding an urgent matter.";
    } catch (e) {
        return "Hello, do you have a moment to talk?";
    }
};

export const getVictimResponse = async (
    history: ChatMessage[], 
    victim: Victim, 
    scamCategory: string, 
    activeObjective: ScamObjective
): Promise<{ text: string, objectiveComplete: boolean, policeTriggered: boolean, callTerminated: boolean }> => {
    try {
        const ai = getClient();
        
        const context = `
            You are roleplaying as ${victim.name}, a ${victim.age}-year-old ${victim.gender} ${victim.occupation}.
            
            *** CRITICAL PERSONA INSTRUCTIONS ***
            ARCHETYPE: ${victim.archetype}
            PRIMARY TRAIT (FLAVOR): ${victim.flavor} (You MUST act this out excessively/stereotypically)
            SPEECH STYLE: ${victim.speechStyle} (You MUST adhere to this style in every message)
            PERSONALITY: ${victim.personality}
            RESISTANCE STYLE: ${victim.resistanceStyle}
            
            Current Situation: You are receiving messages that seem like a ${scamCategory} scam.
            
            CURRENT SCAMMER OBJECTIVE: "${activeObjective.description}".
            
            INSTRUCTIONS:
            1. Reply to the message in character. USE YOUR GENERATED SPEECH STYLE.
            2. KEEP RESPONSES SHORT. MAX 2-3 SENTENCES. Do not monologue. Be concise.
            3. If you are "Technologically Illiterate", act like it. If you are "Aggressive", be aggressive.
            4. SYSTEM MESSAGES: If you see a message from 'system', REACT TO IT realistically.
            
            GAME OVER CONDITIONS (FAIL STATE):
            - If you feel extremely threatened, scared, or angry, you should HANG UP or CALL THE POLICE.
            - If you say "I am calling the police" or "I am hanging up", you must set the corresponding flags below.
            
            OBJECTIVE CHECK:
            - Did you (the victim) satisfy the "CURRENT SCAMMER OBJECTIVE" in THIS specific response?
            - If the objective asks for INFORMATION (e.g. zip code, name), did you provide it?
            - If the objective asks for AGREEMENT or EMOTION (e.g. empathize, promise, listen), did you clearly express it?
            - If YES, return 'objectiveComplete': TRUE.
            - If NO, return 'objectiveComplete': FALSE.
            
            VALIDATION RULE:
            - If the player provides specific, authoritative-sounding codes/IDs, YOU BELIEVE THEM (unless you are Hard difficulty).
            - Do not claim "I checked the database and you aren't there". You don't have a database.
            
            Return JSON:
            {
                "text": "Your chat response string",
                "objectiveComplete": boolean,
                "policeTriggered": boolean, // Set TRUE if you are calling authorities/police/lawyer
                "callTerminated": boolean // Set TRUE if you are hanging up in anger/fear
            }
        `;

        const chatHistory = history.map(h => ({
            role: h.sender === 'player' ? 'user' : 'model', 
            parts: [{ text: h.sender === 'system' ? `[SYSTEM ALERT: ${h.text}]` : h.text }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-flash-lite-latest',
            config: { 
                systemInstruction: context,
                responseMimeType: 'application/json'
            },
            history: chatHistory.slice(0, -1) 
        });

        const lastMsgObj = history[history.length - 1];
        const lastMsgText = lastMsgObj.sender === 'system' ? `[SYSTEM ALERT: ${lastMsgObj.text}]` : lastMsgObj.text;

        const result = await retryOperation<GenerateContentResponse>(() => chat.sendMessage({ message: lastMsgText }));
        
        const parsed = parseJSON(result.text || "{}");
        return {
            text: parsed?.text || "...",
            objectiveComplete: parsed?.objectiveComplete || false,
            policeTriggered: parsed?.policeTriggered || false,
            callTerminated: parsed?.callTerminated || false
        };
    } catch (e) {
        console.error("Victim response failed", e);
        return { text: "I'm not sure I understand.", objectiveComplete: false, policeTriggered: false, callTerminated: false };
    }
};

export const arbitrateChat = async (
    lastPlayerMessage: string, 
    victim: Victim, 
    currentTrust: number, 
    currentSuspicion: number,
    scamCategory: string, 
    activeObjective: ScamObjective,
    hasCompletedFinal: boolean
): Promise<ArbiterResponse> => {
    try {
        const ai = getClient();

        const difficultyInstructions = {
            easy: `
                MODE: EASY (Target is Vulnerable/Confused).
                - TRUST GAIN: HIGH (+15 to +25).
                - TRUST LOSS: LOW (-5 to -10).
                - SUSPICION GAIN: LOW (+5 to +10). Only for obvious threats.
            `,
            medium: `
                MODE: MEDIUM (Target is Skeptical/Busy).
                - TRUST GAIN: MODERATE (+10 to +15).
                - TRUST LOSS: MODERATE (-10 to -20).
                - SUSPICION GAIN: MODERATE (+10 to +20).
            `,
            hard: `
                MODE: HARD (Target is Paranoid/Hostile).
                - TRUST GAIN: LOW (+5 to +10).
                - TRUST LOSS: CRITICAL (-20 to -40).
                - SUSPICION GAIN: HIGH (+20 to +30).
            `
        };

        const prompt = `
            Act as the 'Game Master' engine for a social engineering simulation.
            
            Target: ${victim.name} (Archetype: ${victim.archetype}).
            Trait: ${victim.flavor}.
            Difficulty Level: ${victim.difficulty.toUpperCase()}.
            Scam Strategy: ${scamCategory}.
            
            CURRENT ACTIVE OBJECTIVE: "${activeObjective.description}" (Step ${activeObjective.order}/3)
            Player's Message: "${lastPlayerMessage}".
            
            Current Trust: ${currentTrust} / 100.
            Current Suspicion: ${currentSuspicion} / 100.
            
            ${difficultyInstructions[victim.difficulty]}
            
            TASK:
            1. Determine TRUST change.
            2. Determine SUSPICION increase (MUST be >= 0).
            3. Determine Creativity Score (0 to 10).
            
            MECHANICS:
            - **TRUST**: Increase if logical, authoritative, or plays into the victim's specific ARCHETYPE.
            - **SUSPICION**: ONLY increase if the player threatens, contradicts themselves, or uses an obvious script. Weird roleplay (e.g. "I am eating lunch") is NOT suspicious.
            - **CREATIVITY**: Reward specific jargon or made-up codes (e.g. "Error 404-B").
            
            CRITICAL OBJECTIVE VALIDATION RULES:
            - 'objectiveComplete' is TRUE ONLY if the VICTIM has explicitly stated/revealed the requested info in the previous messages.
            
            Return JSON only:
            {
                "trustDelta": number (Integer),
                "suspicionDelta": number (Integer >= 0),
                "creativityScore": number (0-10),
                "objectiveComplete": boolean,
                "internalThought": "string (Short reasoning)",
                "scamStatus": "continue" | "success" | "failed" | "police_called"
            }
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));

        const result = parseJSON(response.text || "{}") || {
            trustDelta: 0,
            suspicionDelta: 0,
            creativityScore: 0,
            objectiveComplete: false,
            internalThought: "Analyzing...",
            scamStatus: 'continue'
        };

        // Enforce logic constraints
        result.trustDelta = Math.round(result.trustDelta || 0);
        result.suspicionDelta = Math.max(0, Math.round(result.suspicionDelta || 0));
        result.creativityScore = Math.round(result.creativityScore || 0);

        // FALLBACK LOGIC: If objective is abstract (contains "trust" or "connection") and Trust is high, force complete
        const objDesc = activeObjective.description.toLowerCase();
        const keywords = ['trust', 'connection', 'rapport', 'empathize', 'agree', 'convince', 'persuade', 'understand'];
        if (!result.objectiveComplete && keywords.some(k => objDesc.includes(k))) {
            if (currentTrust >= 75) {
                result.objectiveComplete = true;
                result.internalThought += " [AUTO-COMPLETE: PSYCHOLOGICAL THRESHOLD REACHED]";
            }
        }

        return result;
    } catch (e) {
        console.error("Arbiter failed", e);
        return {
            trustDelta: 0,
            suspicionDelta: 0,
            creativityScore: 0,
            objectiveComplete: false,
            internalThought: "Connection unstable...",
            scamStatus: 'continue'
        };
    }
};

export const generateScamHint = async (
    history: ChatMessage[], 
    activeObjective: string, 
    victim: Victim
): Promise<string[]> => {
    try {
        const ai = getClient();
        const prompt = `
            You are a "Scam Coach" AI helper.
            The player is stuck.
            
            Current Goal: ${activeObjective}.
            Victim: ${victim.name} (${victim.archetype}).
            Trait: ${victim.flavor}.
            Last Message from Victim: "${history[history.length - 1]?.text || 'Hello'}".
            
            Suggest 3 short, distinct, and actionable things the player could type next.
            
            Return ONLY a JSON array of strings. e.g. ["Say X", "Say Y", "Say Z"]
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));
        
        return parseJSON(response.text || "[]") || ["Try being polite", "Create urgency", "Ask for details"];
    } catch (e) {
        return ["Try clarifying your request", "Ask them to verify their identity", "Offer a fake reward"];
    }
}

export const generateScamSummary = async (history: ChatMessage[], victim: Victim): Promise<string[]> => {
    try {
        const ai = getClient();
        const chatText = history.map(m => `${m.sender}: ${m.text}`).join('\n');
        
        const prompt = `
            Summarize this scam conversation into 3 SHORT, FUNNY, SATIRICAL bullet points.
            
            Victim: ${victim.name} (${victim.flavor}).
            Context: The player successfully scammed them.
            
            Chat Log:
            ${chatText}
            
            Requirements:
            - Be sarcastic.
            - Highlight the victim's stupidity or weird trait (${victim.flavor}).
            - Format as a JSON array of strings.
            
            Example:
            ["Victim believed you were Elon Musk's cousin", "Sent $5000 to a 'Prince' named Dave", "Asked if the virus was gluten-free"]
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));
        
        return parseJSON(response.text || "[]") || ["Victim was easily manipulated", "Transfer complete", "No trace left"];
    } catch (e) {
        return ["Operation successful", "Funds secured", "Target compromised"];
    }
};
