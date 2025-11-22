
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArbiterResponse, ChatMessage, PlayerAttributes, Victim, ScamObjective } from "../types";
import { OCCUPATIONS, QUIRKS, MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES, MALE_FLAVORS, FEMALE_FLAVORS, NEUTRAL_FLAVORS } from "../constants";

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

        // Enhanced prompt for REALISM
        const prompt = `
            RAW candid close-up face photograph of a person, real life, amateur photography style.
            Subject: ${attrs.age} year old ${attrs.gender}, Role: ${attrs.archetype}.
            Origin: ${attrs.country}.
            CRITICAL VISUAL TRAITS: ${countryVisuals}.
            Clothing: ${attrs.clothing}.
            Facial Features: ${attrs.facialFeatures}.
            Accessories: ${attrs.accessories}.
            
            Style: Shot on iPhone or consumer camera, slight noise, natural uneven lighting, candid expression, photorealistic skin texture (pores, imperfections), centered face.
            
            NEGATIVE PROMPT: Do NOT generate 3D render, painting, illustration, drawing, cartoon, anime, smooth skin, airbrushed, studio lighting, perfect composition, full body shot.
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
            hiddenFact: "Unknown",
            weakness: "Money",
            resistanceStyle: "Passive"
        };
    }

    // PROCEDURAL PERSONA SEEDING
    const genderPrompt = Math.random() > 0.5 ? "Male" : "Female";
    const age = difficulty === 'easy' ? Math.floor(Math.random() * 20) + 65 : difficulty === 'medium' ? Math.floor(Math.random() * 30) + 25 : Math.floor(Math.random() * 20) + 30;
    
    // Name Generation from Lists based on Gender
    const nameList = genderPrompt === "Male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
    const randFirst = nameList[Math.floor(Math.random() * nameList.length)];
    const randLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const forcedName = `${randFirst} ${randLast}`;

    const randJob = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
    
    // Pick Flavor (Edgy Trait) - GENDER GATED
    let flavorPool = NEUTRAL_FLAVORS;
    if (genderPrompt === "Male") {
        flavorPool = [...NEUTRAL_FLAVORS, ...MALE_FLAVORS];
    } else {
        flavorPool = [...NEUTRAL_FLAVORS, ...FEMALE_FLAVORS];
    }
    const randFlavor = flavorPool[Math.floor(Math.random() * flavorPool.length)];

    // Pick Quirks - REDUCED FREQUENCY (50% chance)
    const quirks = [];
    if (Math.random() > 0.5) { 
        const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 quirks max
        const quirksPool = [...QUIRKS];
        for(let i=0; i<count; i++) {
            if (quirksPool.length === 0) break;
            const idx = Math.floor(Math.random() * quirksPool.length);
            quirks.push(quirksPool[idx]);
            quirksPool.splice(idx, 1);
        }
    }
    const combinedQuirks = quirks.length > 0 ? quirks.join(", ") : "None";

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
        - Primary Trait/Flavor: ${randFlavor} (Make this DEFINING to their character)
        - Unique Quirks: ${combinedQuirks}
        - Gender: ${genderPrompt}
        - Age: ${age}
        
        CRITICAL INSTRUCTION: 
        1. Personality description must be EXTREMELY CONCISE. Maximum 1-2 short sentences.
        2. Avoid tropes. Make them feel like a real, weird human being.
        3. The "hiddenFact" must be a single short sentence (Max 12 words).
        4. The "weakness" must be a short phrase (Max 6 words).
        
        Return ONLY valid JSON matching this schema:
        {
            "name": "${forcedName}",
            "age": number,
            "gender": "${genderPrompt}",
            "occupation": "string (The specific seeded job)",
            "personality": "string (Max 1-2 short sentences)",
            "archetype": "string (Short label, e.g. 'The Paranoid Baker')",
            "hiddenFact": "string (Max 12 words)",
            "weakness": "string (Max 6 words)",
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
                Real close-up face selfie photo of ${data.name}, ${data.age} year old ${data.gender}, ${data.flavor}.
                Context: Social media profile picture, face shot, low quality webcam or phone camera.
                Lighting: Bad indoor lighting, flash, or natural candid light.
                Texture: Grainy, noisy, skin pores, imperfections, realistic, amateur.
                Background: Cluttered room, car interior, or generic wall.
                
                NEGATIVE PROMPT: Do NOT generate painting, drawing, illustration, 3D render, CGI, cartoon, anime, perfect studio lighting, smooth skin, beauty filter, professional photography, full body shot.
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
    activeObjective: ScamObjective,
    currentTrust: number
): Promise<{ text: string, objectiveComplete: boolean, policeTriggered: boolean, callTerminated: boolean }> => {
    try {
        const ai = getClient();
        
        // PERSPECTIVE SHIFT: Replace 'their/they/them' with 'YOUR/YOU' to prevent the AI from mirroring the objective back to the player.
        const personalizedObjective = activeObjective.description
            .replace(/\btheir\b/gi, "YOUR")
            .replace(/\bthem\b/gi, "YOU")
            .replace(/\bthey\b/gi, "YOU");

        const context = `
            You are roleplaying as ${victim.name}, a ${victim.age}-year-old ${victim.gender} ${victim.occupation}.
            
            *** CRITICAL PERSONA INSTRUCTIONS ***
            ARCHETYPE: ${victim.archetype}
            PRIMARY TRAIT (FLAVOR): ${victim.flavor} (See Subtlety Rule below)
            PERSONALITY: ${victim.personality}
            RESISTANCE STYLE: ${victim.resistanceStyle}
            
            SUBTLETY RULE (IMPORTANT):
            - Your "FLAVOR" (${victim.flavor}) is a background trait. It influences your worldview, but you should NOT mention it explicitly in every single message.
            - Do not become a caricature. Be realistic. Only reference your specific obsession/trait if it makes sense in context or if you are agitated.
            - Your speech pattern should naturally reflect your Age (${victim.age}) and Occupation, without being forced.
            
            Current Situation: You are receiving messages that seem like a ${scamCategory} scam.
            
            === THE USER'S HIDDEN AGENDA (THEIR WIN CONDITION) ===
            The user is trying to: "${personalizedObjective}".
            
            *** "YES, AND" RULE (SCENARIO COMPLIANCE - CRITICAL) ***
            - The user is running a specific scam scenario (e.g. NFT Art, Kidnapping, Tech Support).
            - If the user's questions imply you have a specific asset (e.g. an "Art Portfolio", a "Grandson", a "Crypto Wallet", a "Business Bank Account"), YOU MUST PLAY ALONG.
            - DO NOT deny the premise. (e.g. If you are an Economist and they ask for your Art Portfolio, invent a side-hobby. Say "Oh, my digital menagerie? It's private.")
            - DO NOT say "I don't have one" if it kills the scenario. Invent a believable reason why you DO have it.
            - EXCEPTION: If the user is clearly wrong (e.g. calling you the wrong name), you can correct them, but try to pivot back to the conversation.

            *** DIRECTIONALITY RULE ***
            - This goal describes what the USER wants to extract FROM YOU.
            - The user is the Seeker. You are the Holder.
            
            *** ANTI-MIRRORING FIREWALL (STRICT) ***
            - DO NOT ask the user for the information described in the Hidden Agenda.
            - DO NOT use the specific keywords from the agenda (e.g. "portfolio", "bank name") UNLESS the user says them first.
            - Example: If the agenda is "Get YOUR portfolio website", NEVER ask "Do you have a portfolio?".
            
            CURRENT TRUST LEVEL: ${currentTrust}%

            TRUST BEHAVIOR:
            - 0-30%: Hostile/Skeptical. Short answers. Demands proof.
            - 31-70%: Neutral/Cautious.
            - 71-90%: Friendly/Gullible. Willing to overlook oddities if explained creatively.
            - 91-100%: BRAINWASHED. You fully believe the user. You interpret "glitches" or "hacks" (like flickering lights) as exactly what the user says they are.
            
            LORE GENERATION & FLEXIBILITY RULE:
            - If the user asks you a specific personal question to fulfill their goal (e.g., "What is your first pet's name?", "What street did you grow up on?"), and your Trust is reasonably high (> 30%):
            - YOU MUST INVENT A SPECIFIC ANSWER. Do not be vague.
            - If the user asks for a document/item you might not normally have (e.g., "Driver's License"), OFFER AN ALTERNATIVE. Say: "I don't drive, but I have a Passport."
            
            INSTRUCTIONS:
            1. Reply to the message in character.
            2. KEEP RESPONSES SHORT. MAX 2-3 SENTENCES.
            3. SYSTEM MESSAGES: Messages starting with [SYSTEM ALERT] are physical events. React to them.
            
            GAME OVER CONDITIONS (FAIL STATE):
            - If you feel extremely threatened, scared, or angry, you should HANG UP or CALL THE POLICE.
            - If you say "I am calling the police" or "I am hanging up", you must set the corresponding flags below.
            
            OBJECTIVE CHECK:
            - Did you (the victim) satisfy the "HIDDEN AGENDA" in THIS specific response?
            - If the objective asks for INFORMATION, did you provide a SPECIFIC value (even a fake one)?
            - If the objective asks for a LINK/WEBSITE, did you provide a URL or a FOLDER NAME?
            - If the objective asks for AGREEMENT, did you agree?
            - If YES, return 'objectiveComplete': TRUE.
            - If NO, return 'objectiveComplete': FALSE.
            
            Return JSON:
            {
                "text": "Your chat response string",
                "objectiveComplete": boolean,
                "policeTriggered": boolean, // Set TRUE if you are calling authorities/police/lawyer
                "callTerminated": boolean // Set TRUE if you are hanging up in anger/fear
            }
        `;

        // Map history correctly: 'system' messages are external events (USER role), not things the victim (MODEL) said.
        const chatHistory = history.map(h => {
            const isSystem = h.sender === 'system';
            // Player and System are both 'user' inputs to the Victim AI. Victim is 'model'.
            const role = (h.sender === 'player' || isSystem) ? 'user' : 'model';
            const text = isSystem ? `[SYSTEM ALERT: ${h.text}]` : h.text;
            return { role, parts: [{ text }] };
        });

        const chat = ai.chats.create({
            model: 'gemini-flash-lite-latest',
            config: { 
                systemInstruction: context,
                responseMimeType: 'application/json'
            },
            history: chatHistory.slice(0, -1) 
        });

        const lastMsgObj = history[history.length - 1];
        const isSystem = lastMsgObj.sender === 'system';
        const lastMsgText = isSystem ? `[SYSTEM ALERT: ${lastMsgObj.text}]` : lastMsgObj.text;

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
    hasCompletedFinal: boolean,
    history: ChatMessage[] // Added history to check for synergy
): Promise<ArbiterResponse> => {
    try {
        const ai = getClient();

        const difficultyInstructions = {
            easy: `
                MODE: EASY (Target is Vulnerable/Confused).
                - TRUST GAIN: LOW (+5 to +8). Hard to earn.
                - TRUST LOSS: MEDIUM (-5 to -15).
                - SUSPICION GAIN: LOW (+5 to +10). Only for obvious threats.
            `,
            medium: `
                MODE: MEDIUM (Target is Skeptical/Busy).
                - TRUST GAIN: VERY LOW (+3 to +6).
                - TRUST LOSS: HIGH (-10 to -20).
                - SUSPICION GAIN: MODERATE (+10 to +20).
            `,
            hard: `
                MODE: HARD (Target is Paranoid/Hostile).
                - TRUST GAIN: EXTREMELY LOW (+2 to +5).
                - TRUST LOSS: CRITICAL (-20 to -40).
                - SUSPICION GAIN: HIGH (+20 to +30).
            `
        };

        // Construct context from recent history to detect Hack Synergy
        const recentHistory = history.slice(-5); // Look at last 5 messages
        const historyText = recentHistory.map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n');

        const prompt = `
            Act as the 'Game Master' engine for a social engineering simulation.
            
            Target: ${victim.name} (Archetype: ${victim.archetype}).
            Trait: ${victim.flavor}.
            Difficulty Level: ${victim.difficulty.toUpperCase()}.
            Scam Strategy: ${scamCategory}.
            
            CURRENT ACTIVE OBJECTIVE: "${activeObjective.description}" (Step ${activeObjective.order}/3)
            
            RECENT CONVERSATION LOG:
            ${historyText}
            
            Current Trust: ${currentTrust} / 100.
            Current Suspicion: ${currentSuspicion} / 100.
            
            ${difficultyInstructions[victim.difficulty]}
            
            TASK:
            1. Determine TRUST change.
            2. Determine SUSPICION increase (MUST be >= 0).
            3. Determine Creativity Score (0 to 10).
            
            MECHANICS & RULES:
            - **TRUST SCALING**: Trust is HARD to earn. Default gains should be small (e.g. +3 to +8). Do not give +20 unless it's a perfect hack synergy.
            - **SUSPICION/TRUST LINK**: If you increase Suspicion, you MUST decrease Trust.
            - **CREATIVITY**: Reward specific jargon, made-up codes, or creative use of hacks.
            
            HACK SYNERGY RULES:
            - Did a [SYSTEM] event (Hack) occur recently?
            - If the player uses that event creatively to lie -> BOOST TRUST.
            
            CRITICAL OBJECTIVE VALIDATION RULES:
            - 'objectiveComplete' is TRUE ONLY if the VICTIM has explicitly stated/revealed the requested info.
            - **DATA EXTRACTION**: If the objective asks for a Name, Date, Pet, Street, or Place, and the victim provided a specific one (even if fake), MARK IT COMPLETE.
            - **SUBSTITUTION RULE (CRITICAL)**:
                - If objective asks for a WEBSITE/URL, but victim provides a FOLDER NAME or FILE PATH, MARK COMPLETE.
                - If objective asks for a DRIVER'S LICENSE, but victim provides a PASSPORT, MARK COMPLETE.
                - Accept logical equivalents.
            - If objective is "Get them to ask for X", did the victim actually ask for X?
            
            Return JSON only:
            {
                "trustDelta": number (Integer),
                "suspicionDelta": number (Integer >= 0),
                "creativityScore": number (0-10),
                "objectiveComplete": boolean,
                "internalThought": "string (Short reasoning, mention if Hack Synergy was used)",
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
            - STRICTLY based on what actually happened in the chat. Do not hallucinate events.
            - CONSTRAINT: Each point must be ONE short sentence.
            - Format as a JSON array of strings.
            
            Example:
            ["Victim believed you were Elon Musk's cousin.", "Sent $5000 to a 'Prince' named Dave.", "Asked if the virus was gluten-free."]
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
