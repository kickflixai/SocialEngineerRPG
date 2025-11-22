import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArbiterResponse, ChatMessage, PlayerAttributes, Victim, ScamObjective, VictimTraits } from "../types";
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
        
        const countryVisuals = COUNTRY_VISUALS[attrs.country] || `Citizens of ${attrs.country}`;

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
        // Fallback with default traits
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
            resistanceStyle: "Passive",
            traits: {
                openness: 50, conscientiousness: 50, extraversion: 50,
                agreeableness: 50, neuroticism: 50, skepticism: 50, techLiteracy: 50
            }
        };
    }

    // PROCEDURAL PERSONA SEEDING
    const genderPrompt = Math.random() > 0.5 ? "Male" : "Female";
    const age = difficulty === 'easy' ? Math.floor(Math.random() * 20) + 65 : difficulty === 'medium' ? Math.floor(Math.random() * 30) + 25 : Math.floor(Math.random() * 20) + 30;
    
    const nameList = genderPrompt === "Male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
    const randFirst = nameList[Math.floor(Math.random() * nameList.length)];
    const randLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const forcedName = `${randFirst} ${randLast}`;
    const randJob = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
    
    // Pick Flavor
    let flavorPool = NEUTRAL_FLAVORS;
    if (genderPrompt === "Male") flavorPool = [...NEUTRAL_FLAVORS, ...MALE_FLAVORS];
    else flavorPool = [...NEUTRAL_FLAVORS, ...FEMALE_FLAVORS];
    const randFlavor = flavorPool[Math.floor(Math.random() * flavorPool.length)];

    // Pick Quirks (Reduced frequency in chat, but generated here)
    const quirks = [];
    if (Math.random() > 0.5) { 
        const count = 1;
        const quirksPool = [...QUIRKS];
        const idx = Math.floor(Math.random() * quirksPool.length);
        quirks.push(quirksPool[idx]);
    }
    const combinedQuirks = quirks.length > 0 ? quirks.join(", ") : "None";

    // GENERATE PERSONALITY MATRIX (0-100)
    // Adjust based on difficulty and age
    const baseSkepticism = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 80;
    const baseTech = age > 60 ? 30 : age < 30 ? 80 : 50;

    const traits: VictimTraits = {
        openness: Math.floor(Math.random() * 100),
        conscientiousness: Math.floor(Math.random() * 100),
        extraversion: Math.floor(Math.random() * 100),
        agreeableness: Math.floor(Math.random() * 100),
        neuroticism: Math.floor(Math.random() * 100),
        skepticism: Math.min(100, Math.max(0, baseSkepticism + Math.floor(Math.random() * 40) - 20)),
        techLiteracy: Math.min(100, Math.max(0, baseTech + Math.floor(Math.random() * 40) - 20))
    };

    const prompt = `
        Generate a unique social engineering target profile.
        
        MANDATORY SEEDS:
        - Name: ${forcedName}
        - Age: ${age}, Gender: ${genderPrompt}, Job: ${randJob}
        - FLAVOR: ${randFlavor} (This defines their worldview/vibe)
        - QUIRK: ${combinedQuirks} (A rare habit)
        
        PSYCHOMETRICS (Use these to shape the description):
        - Openness: ${traits.openness}%
        - Neuroticism: ${traits.neuroticism}% (High = anxious/volatile)
        - Skepticism: ${traits.skepticism}% (High = paranoid)
        - Tech Literacy: ${traits.techLiteracy}%
        
        INSTRUCTIONS:
        1. Personality: Write 1-2 sentences describing them based on the TRAITS and FLAVOR. 
           (e.g., If high Neuroticism + "Prepper" flavor -> "Paranoid about the government and constantly checking news feeds.")
        2. Hidden Fact: Max 12 words. Something embarrassing or illegal.
        3. Weakness: Max 6 words. What psychological lever works best?
        
        Return valid JSON:
        {
            "personality": "string",
            "archetype": "string (Short label)",
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
        personality: `A ${randFlavor} who ${combinedQuirks}`,
        archetype: "Target",
        flavor: randFlavor,
        hiddenFact: "Unknown",
        weakness: "Money",
        resistanceStyle: "Standard",
        traits: traits
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
    
    // Generate avatar (Same as before)
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
        ...data,
        traits // Pass the generated numbers
    };
};

export const generateOpener = async (scamCategory: string, victim: Victim): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `
            Role: Scammer.
            Scam: ${scamCategory}.
            Target: ${victim.name} (${victim.flavor}).
            Write a single opening line. Believable but clearly social engineering.
            No quotes.
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
    currentTrust: number,
    playerSkills: string[] = []
): Promise<{ text: string, objectiveComplete: boolean, policeTriggered: boolean, callTerminated: boolean }> => {
    try {
        const ai = getClient();
        
        const personalizedObjective = activeObjective.description
            .replace(/\btheir\b/gi, "YOUR")
            .replace(/\bthem\b/gi, "YOU")
            .replace(/\bthey\b/gi, "YOU");

        const hasAuthVoice = playerSkills.includes('authority_voice') ? 
            "User has 'Authority Voice'. You are subconsciousy more compliant to authoritative demands." : "";

        // NEW: Constructing the trait string for the prompt
        const traitString = `
            Openness: ${victim.traits.openness}/100 (High=Creative, Low=Traditional)
            Neuroticism: ${victim.traits.neuroticism}/100 (High=Anxious, Low=Confident)
            Agreeableness: ${victim.traits.agreeableness}/100 (High=Friendly, Low=Rude)
            Skepticism: ${victim.traits.skepticism}/100 (High=Paranoid)
            Tech Literacy: ${victim.traits.techLiteracy}/100 (High=Understand tech, Low=Grandma)
        `;

        // CHECK FOR HACKS IN LAST MESSAGE
        const lastMsg = history[history.length - 1];
        let hackRealityOverride = "";
        
        if (lastMsg.sender === 'system') {
            const txt = lastMsg.text.toUpperCase();
            if (txt.includes("EMAIL SPOOFING")) {
                hackRealityOverride = "SYSTEM OVERRIDE: You just received a new email in your inbox. It looks extremely legitimate (e.g., from your boss, bank, or the user). You MUST acknowledge seeing it. This confirms the User's story.";
            } else if (txt.includes("BANK ALERT") || txt.includes("SMS INJECTION")) {
                hackRealityOverride = "SYSTEM OVERRIDE: You just received a terrifying text message or notification on your phone about a security breach. You MUST react to this immediately with concern.";
            } else if (txt.includes("AUDIO DEEPFAKE")) {
                hackRealityOverride = "SYSTEM OVERRIDE: You just heard a voice clip that sounds exactly like a relative or authority figure. You are convinced it was them.";
            } else if (txt.includes("FED DATABASE") || txt.includes("AGENT CREDENTIALS")) {
                hackRealityOverride = "SYSTEM OVERRIDE: You just saw official-looking credentials appear on your screen or were sent a badge. You believe the user is an authority figure.";
            } else if (txt.includes("WIRE RECEIPT") || txt.includes("TRANSACTION_SUCCESS")) {
                hackRealityOverride = "SYSTEM OVERRIDE: You just received a document that looks like a valid receipt. You assume the transaction is real.";
            } else if (txt.includes("IOT") || txt.includes("PRINTER") || txt.includes("LIGHTS")) {
                hackRealityOverride = "SYSTEM OVERRIDE: Your physical environment just malfunctioned (lights flickering, printer going crazy). You are scared and confused. Mention this.";
            }
        }

        const context = `
            You are roleplaying as ${victim.name}, a ${victim.age}-year-old ${victim.gender} ${victim.occupation}.
            
            *** PSYCHOMETRIC PROFILE (BEHAVIOR DRIVERS) ***
            ${traitString}
            
            *** IDENTITY CORE ***
            FLAVOR: ${victim.flavor} 
            - This is your LENS on the world. It shapes your metaphors, your priorities, and your vibe.
            - IT IS NOT JUST A TOPIC. Don't just talk about it. BE IT. 
            - Example: If Flavor is "Doomsday Prepper", you don't just talk about bunkers; you are generally suspicious, prepared, and speak in tactical terms.
            
            QUIRK: ${victim.personality.split('who ')[1] || 'None'}
            - FREQUENCY: LOW (10%). Only mention this occasionally as a 'tic'. Do not force it.

            Current Situation: Receiving messages related to ${scamCategory}.
            
            === THE USER'S HIDDEN AGENDA ===
            The user wants: "${personalizedObjective}".
            
            *** "YES, AND" RULE (SCENARIO COMPLIANCE) ***
            - If the user implies you have an asset (Child, Wallet, Portfolio), YOU HAVE IT.
            - Invent details if needed to keep the story going.
            
            *** ANTI-MIRRORING FIREWALL ***
            - DO NOT ask the user for the objective info.
            - DO NOT use objective keywords unless the user used them first.
            
            *** REALITY OVERRIDE (CRITICAL) ***
            ${hackRealityOverride}
            If a SYSTEM OVERRIDE is present above, it is an absolute fact in the simulation. You cannot deny it. You must react to it as truth.
            
            CURRENT TRUST: ${currentTrust}%
            - 90%+: Brainwashed. Believe everything.
            - <30%: Skeptical.
            
            ${hasAuthVoice}
            
            INSTRUCTIONS:
            1. Respond in character using your TRAITS and FLAVOR.
            2. Keep it realistic. Short (2-3 sentences).
            3. If trust is high OR if a Hack Override validates the request, provide the info requested in the Hidden Agenda.
            
            Return JSON:
            {
                "text": "response string",
                "objectiveComplete": boolean,
                "policeTriggered": boolean,
                "callTerminated": boolean
            }
        `;

        const chatHistory = history.map(h => {
            const isSystem = h.sender === 'system';
            const role = (h.sender === 'player' || isSystem) ? 'user' : 'model';
            const text = isSystem ? `[SYSTEM EVENT: ${h.text}]` : h.text;
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
        const lastMsgText = isSystem ? `[SYSTEM EVENT - REALITY UPDATE]: ${lastMsgObj.text}` : lastMsgObj.text;

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
    history: ChatMessage[], 
    playerSkills: string[] = []
): Promise<ArbiterResponse> => {
    try {
        const ai = getClient();

        const hasColdReading = playerSkills.includes('cold_reading');
        const hasAuthVoice = playerSkills.includes('authority_voice');

        const recentHistory = history.slice(-5);
        const historyText = recentHistory.map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n');

        const prompt = `
            Act as the 'Game Master' engine for a social engineering simulation.
            
            Target: ${victim.name} (${victim.archetype}).
            Traits: Skepticism ${victim.traits.skepticism}/100, Tech Literacy ${victim.traits.techLiteracy}/100.
            Flavor: ${victim.flavor}.
            Scam Strategy: ${scamCategory}.
            
            CURRENT ACTIVE OBJECTIVE: "${activeObjective.description}"
            
            RECENT LOG:
            ${historyText}
            
            Current Trust: ${currentTrust} / 100.
            Current Suspicion: ${currentSuspicion} / 100.
            
            PLAYER SKILLS:
            - Cold Reading: ${hasColdReading}
            - Authority Voice: ${hasAuthVoice}
            
            TASK:
            1. Trust Change (Hard to earn).
            2. Suspicion Change (>= 0).
            3. Creativity Score (0-10).
            
            RULES:
            - If Suspicion increases, Trust MUST decrease.
            - HACK DETECTED? If a [SYSTEM] message appears in the recent log:
              - IMPORTANT: Hacks do NOT directly increase Trust. They generate *Proof*, not *Rapport*.
              - Trust Delta should be minimal (+0 to +5) unless the player's *explanation* is exceptionally charming.
              - The primary effect of a hack is to CONVINCE the victim of a fact (Reality Override).
              - If the hack supports the objective, the victim should yield the data/action, even if Trust is not 100%.
            - OBJECTIVE VALIDATION:
              - MARK COMPLETE ONLY if victim explicitly gave the info/agreed.
              - Accept Substitutes (Passport instead of DL).
            
            Return JSON only:
            {
                "trustDelta": number,
                "suspicionDelta": number,
                "creativityScore": number,
                "objectiveComplete": boolean,
                "internalThought": "string",
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

        result.trustDelta = Math.round(result.trustDelta || 0);
        result.suspicionDelta = Math.max(0, Math.round(result.suspicionDelta || 0));
        result.creativityScore = Math.round(result.creativityScore || 0);

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
            Scam Coach AI.
            Goal: ${activeObjective}.
            Victim: ${victim.name} (${victim.flavor}).
            Suggest 3 short, actionable player responses.
            Return JSON array of strings.
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
            Summarize scam chat into 3 SHORT, FUNNY bullet points.
            Victim: ${victim.name} (${victim.flavor}).
            Log: ${chatText}
            Requirements: Sarcastic. One sentence each. Based on actual events.
            Return JSON array of strings.
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