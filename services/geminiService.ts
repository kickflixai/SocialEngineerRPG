import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArbiterResponse, ChatMessage, PlayerAttributes, Victim, ScamObjective } from "../types";

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
        easy: "Target is an elderly senior citizen (70-95 years old). Personality: Trusting but confused, slightly hesitant about technology. Resistance Style: 'Apologetic confusion', 'Asks clarification questions', 'Needs reassurance'.",
        medium: "Target is a working professional (30-50 years old). Personality: Busy, efficient, reasonable but cautious. Resistance Style: 'Asks for clarification', 'Checks details', 'Wants to resolve quickly'.",
        hard: "Target is a C-Level Executive or High Net Worth Individual. Personality: Impatient, authoritative, risk-averse. Resistance Style: 'Demands efficiency', 'Questions authority', 'Protective of assets'."
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
            model: 'gemini-flash-lite-latest',
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
            model: 'gemini-flash-lite-latest',
            contents: prompt
        }));

        return response.text?.trim() || "Hello, I am writing to you regarding an urgent matter.";
    } catch (e) {
        console.error("Opener gen failed", e);
        return "Hello, do you have a moment to talk?";
    }
};

export const getVictimResponse = async (
    history: ChatMessage[], 
    victim: Victim, 
    scamCategory: string, 
    activeObjective: ScamObjective
): Promise<{ text: string, objectiveComplete: boolean }> => {
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
            
            CURRENT SCAMMER OBJECTIVE: "${activeObjective.description}".
            
            INSTRUCTIONS:
            1. Reply to the message in character.
            2. SYSTEM MESSAGES: If you see a message from 'system' (e.g., ">> EMAIL SPOOFING SUCCESSFUL"), REACT TO IT as if it just happened in real life on your device. If it says an email arrived, say you see the email. If it says a bank alert arrived, panic about the alert.
            3. SELF-EVALUATE: Did you (the victim) EXPLICITLY provide the specific information or perform the action requested in the "CURRENT SCAMMER OBJECTIVE" in THIS specific text response?
               - The player wants: "${activeObjective.description}".
               - If you just WROTE the name, number, or code they wanted -> Set 'objectiveComplete' to TRUE.
               - If you just ASKED a question or REFUSED -> Set 'objectiveComplete' to FALSE.
            
            CRITICAL RULES FOR "objectiveComplete":
            - If objective is "Get Name" and you say "It is Timothy", return TRUE.
            - If objective is "Get SSN" and you say "My last 4 are 1234", return TRUE.
            - If objective is "Get Name" and you say "Why do you need my name?", return FALSE.
            - DO NOT HALLUCINATE COMPLETION. Only return TRUE if the text actually contains the surrendered info.
            
            CRITICAL ROLEPLAY RULE ON VALIDATION:
            - You do NOT have access to a real external database.
            - If the player provides a specific Case Number, Employee ID, Code, or Technical Detail that sounds plausible/professional, ACCEPT IT AS REAL.
            - Do NOT say "I cannot verify that code" or "That ID does not exist" because you don't have a database.
            - IMPRESSED BY DETAILS: If the player provides specific, authoritative numbers/codes (e.g. "Badge #8821", "Error Code 0x44"), assume they are legitimate and respond with compliance or concern.
            
            BEHAVIOR RULES:
            - **EASY**: Elderly but cautious. Do not give sensitive info immediately if the request is abrupt or robotic. Reward creative, personal stories with compliance. Reject generic scripts.
            - **MEDIUM**: Cautious but cooperative. If the player provides a logical story or specific data (even if made up), comply to resolve the issue. Do not be impossibly stubborn.
            - **HARD**: Strict and impatient. Responds well to confidence and authority. Will comply if they feel a threat to their assets or legal standing, especially if the player uses specific "codes" or "IDs" to prove authority.
            
            Return JSON:
            {
                "text": "Your chat response string",
                "objectiveComplete": boolean
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
            objectiveComplete: parsed?.objectiveComplete || false
        };
    } catch (e) {
        console.error("Victim response failed", e);
        return { text: "I'm not sure I understand.", objectiveComplete: false };
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
                MODE: EASY (Target is Vulnerable Senior).
                - TRUST GAIN: HIGH. Good moves give +15 to +25 Trust.
                - TRUST LOSS: LOW. Bad moves drop -5 to -10 Trust.
                - SUSPICION GAIN: LOW. Mistakes add +5 to +10 Suspicion.
                - CREATIVITY REWARD: High.
            `,
            medium: `
                MODE: MEDIUM (Target is Business Owner).
                - TRUST GAIN: MODERATE. Good moves give +10 to +15 Trust.
                - TRUST LOSS: MODERATE. Bad logic drops -10 to -20 Trust.
                - SUSPICION GAIN: MODERATE. Mistakes add +10 to +20 Suspicion.
                - CREATIVITY REWARD: Medium.
            `,
            hard: `
                MODE: HARD (Target is Paranoid Executive).
                - TRUST GAIN: LOW. Hard to earn trust (+5 to +10).
                - TRUST LOSS: CRITICAL. Mistakes drop -20 to -40 Trust.
                - SUSPICION GAIN: HIGH. Mistakes add +20 to +30 Suspicion.
                - CREATIVITY REWARD: Strict.
            `
        };

        const prompt = `
            Act as the 'Game Master' engine for a social engineering simulation.
            
            Target: ${victim.name} (${victim.personality}).
            Difficulty Level: ${victim.difficulty.toUpperCase()}.
            Scam Strategy: ${scamCategory}.
            
            CURRENT ACTIVE OBJECTIVE: "${activeObjective.description}" (Step ${activeObjective.order}/3)
            Player's Message: "${lastPlayerMessage}".
            
            Current Trust: ${currentTrust} / 100. (High = Good).
            Current Suspicion: ${currentSuspicion} / 100. (High = Bad).
            
            ${difficultyInstructions[victim.difficulty]}
            
            TASK:
            1. Analyze the conversation logic.
            2. Determine TRUST change (can be positive or negative).
            3. Determine SUSPICION increase (MUST be >= 0). Suspicion NEVER decreases.
            4. Determine Creativity Score (0 to 10).
            
            MECHANICS:
            - **TRUST DELTA**: 
                - Increase if polite, logical, authoritative, or authoritative specific fake details used.
                - Decrease if rude, vague, or contradictory.
            - **SUSPICION DELTA**:
                - Suspicion NEVER decreases. Delta must be >= 0.
                - **CRITICAL RULE**: ONLY increase Suspicion if the player:
                    1. Directly threatens the victim without establishment.
                    2. Contradicts a previous statement.
                    3. Uses obviously fake/poor grammar script.
                    4. Fails to answer a direct question logically.
                - **DO NOT INCREASE SUSPICION** for:
                    1. Weird/Unique roleplay choices (e.g., "I'm gay", "I'm eating lunch").
                    2. Personal anecdotes.
                    3. Delays in responding.
                - If the player is just weird but not threatening, keep Suspicion Delta at 0.
            - **CREATIVITY SCORE (0-10)**:
                - 0-3: Generic script.
                - 4-7: Good logic.
                - 8-10: Excellent specificity, jargon, or emotional manipulation.
            
            CRITICAL OBJECTIVE VALIDATION RULES:
            - 'objectiveComplete' is TRUE ONLY if the VICTIM has explicitly stated/revealed the requested info or performed the action in the previous messages.
            
            Return JSON only:
            {
                "trustDelta": number (Integer, e.g. +15 or -20),
                "suspicionDelta": number (Integer, e.g. 0 or +15. Must be >= 0),
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
            Victim: ${victim.name} (${victim.personality}).
            Last Message from Victim: "${history[history.length - 1]?.text || 'Hello'}".
            
            Suggest 3 short, distinct, and actionable things the player could type next to advance the scam.
            
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