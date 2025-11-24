import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArbiterResponse, ChatMessage, PlayerAttributes, Victim, ScamObjective, VictimTraits } from "../types";
import { OCCUPATIONS, QUIRKS, MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES, MALE_FLAVORS, FEMALE_FLAVORS, NEUTRAL_FLAVORS } from "../constants";

const getClient = () => {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API Key is missing. Please configure API_KEY in your environment variables.");
    return new GoogleGenAI({ apiKey: key });
};

const parseJSON = (text: string) => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse JSON", text);
        return null;
    }
};

const compressImage = async (base64Str: string, maxWidth = 256, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            } else {
                resolve(base64Str); 
            }
        };
        img.onerror = () => { resolve(base64Str); };
    });
};

const retryOperation = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
            const isServerFail = error?.status === 503 || error?.status === 500 || error?.message?.includes('503') || error?.message?.includes('Overloaded');
            if ((isRateLimit || isServerFail) && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; 
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
};

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
            config: { imageConfig: { aspectRatio: '1:1' } }
        }));
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                const rawBase64 = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                return await compressImage(rawBase64);
            }
        }
        return "https://picsum.photos/400/400";
    } catch (e) { return "https://picsum.photos/400/400"; }
};

export const generateVictim = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<Victim> => {
    let ai;
    try { ai = getClient(); } catch (e) { 
        return {
            id: crypto.randomUUID(), difficulty, avatarUrl: "https://picsum.photos/400/400", name: "Unknown Target", age: 40, gender: "male", occupation: "Unknown", personality: "Generic", archetype: "Average Joe", flavor: "Boring", hiddenFact: "Unknown", weakness: "Money", resistanceStyle: "Passive", traits: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, impulsivity: 50, techLiteracy: 50 }
        };
    }

    const genderPrompt = Math.random() > 0.5 ? "Male" : "Female";
    const age = difficulty === 'easy' ? Math.floor(Math.random() * 20) + 65 : difficulty === 'medium' ? Math.floor(Math.random() * 30) + 25 : Math.floor(Math.random() * 20) + 30;
    
    const nameList = genderPrompt === "Male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
    const randFirst = nameList[Math.floor(Math.random() * nameList.length)];
    const randLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const forcedName = `${randFirst} ${randLast}`;
    const randJob = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
    
    let flavorPool = NEUTRAL_FLAVORS;
    if (genderPrompt === "Male") flavorPool = [...NEUTRAL_FLAVORS, ...MALE_FLAVORS];
    else flavorPool = [...NEUTRAL_FLAVORS, ...FEMALE_FLAVORS];
    const randFlavor = flavorPool[Math.floor(Math.random() * flavorPool.length)];

    const quirks = [];
    if (Math.random() > 0.5) { 
        const quirksPool = [...QUIRKS];
        quirks.push(quirksPool[Math.floor(Math.random() * quirksPool.length)]);
    }
    const combinedQuirks = quirks.length > 0 ? quirks.join(", ") : "None";

    const isElderly = age >= 60;
    let baseImpulsivity = difficulty === 'easy' ? 70 : difficulty === 'medium' ? 50 : 30;
    if (isElderly) baseImpulsivity = Math.min(100, baseImpulsivity + 20);
    const baseTech = isElderly ? 30 : age < 30 ? 80 : 50;

    const traits: VictimTraits = {
        openness: Math.floor(Math.random() * 100),
        conscientiousness: Math.floor(Math.random() * 100),
        extraversion: Math.floor(Math.random() * 100),
        agreeableness: Math.floor(Math.random() * 100),
        neuroticism: Math.floor(Math.random() * 100),
        impulsivity: Math.min(100, Math.max(0, baseImpulsivity + Math.floor(Math.random() * 40) - 20)),
        techLiteracy: Math.min(100, Math.max(0, baseTech + Math.floor(Math.random() * 40) - 20))
    };

    const prompt = `
        Generate a unique social engineering target profile.
        MANDATORY SEEDS:
        - Name: ${forcedName}, Age: ${age}, Gender: ${genderPrompt}, Job: ${randJob}
        - FLAVOR: ${randFlavor} (This defines their worldview/vibe)
        - QUIRK: ${combinedQuirks} (A rare habit)
        PSYCHOMETRICS:
        - Impulsivity: ${traits.impulsivity}% (High = Rash/Hasty, Low = Deliberate/Cautious)
        - Tech Literacy: ${traits.techLiteracy}%
        
        INSTRUCTIONS:
        1. Personality: Write 1-2 sentences describing them. YOU MUST EXPLICITLY MENTION OR REFERENCE THEIR FLAVOR ("${randFlavor}") in this description.
        2. QUIRK HANDLING: If the quirk is "None" or null, DO NOT mention it in the description.
        3. Hidden Fact: Max 12 words. Something embarrassing or illegal related to their flavor/quirk if possible.
        4. Weakness: Max 6 words. What psychological lever works best?
        
        Return valid JSON: { "personality": "string", "archetype": "string (Short label)", "hiddenFact": "string", "weakness": "string", "resistanceStyle": "string" }
    `;

    let data: any = {
        name: forcedName, age: age, gender: genderPrompt.toLowerCase(), occupation: randJob,
        personality: `A ${randFlavor} who ${combinedQuirks}`, archetype: "Target", flavor: randFlavor,
        hiddenFact: "Unknown", weakness: "Money", resistanceStyle: "Standard", traits: traits
    };

    try {
        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));
        const parsed = parseJSON(response.text || "{}");
        if (parsed) data = { ...data, ...parsed };
    } catch(e) { console.error("Victim text gen failed", e); }
    
    let avatarUrl = "https://picsum.photos/400/400";
    const generateImageAttempt = async (promptText: string) => {
        const imageResponse = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: promptText }] },
            config: { imageConfig: { aspectRatio: '1:1' } }
        }), 3, 3000);
        
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                const rawBase64 = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                return await compressImage(rawBase64);
            }
        }
        throw new Error("No image data returned");
    };

    try {
        const ageDesc = age > 60 ? "elderly, wrinkled, senior citizen" : age > 40 ? "middle aged" : "young adult";
        
        // FORCE FLAVOR VISUALS INTO PROMPT
        // "if the flavor is down syndrome, then the victim image should look like he has down syndrome"
        const traitInjection = `Subject must physically embody the trait: ${data.flavor}. If trait implies a specific look (e.g. Down Syndrome, Bodybuilder, Goth), generate that EXACTLY.`;
        
        const primaryPrompt = `
            RAW candid close-up face selfie photo of ${data.name}, ${data.age} year old ${ageDesc} ${data.gender}.
            MANDATORY TRAITS: ${traitInjection}.
            Context: Social media profile picture, face shot, low quality webcam or phone camera.
            Lighting: Bad indoor lighting, flash, or natural candid light.
            Texture: Grainy, noisy, skin pores, imperfections, realistic, amateur.
            Background: Cluttered room, car interior, or generic wall.
            NEGATIVE PROMPT: Do NOT generate painting, drawing, illustration, 3D render, CGI, cartoon, anime, perfect studio lighting, smooth skin, beauty filter, professional photography, full body shot.
        `;
        avatarUrl = await generateImageAttempt(primaryPrompt);
    } catch (e) {
        try {
            const fallbackPrompt = `Close up portrait face photo of ${data.age} year old ${data.gender}, ${data.flavor}. Style: Realistic, photorealistic, high quality portrait. Background: Blurred neutral background.`;
            avatarUrl = await generateImageAttempt(fallbackPrompt);
        } catch (e2) { console.error("All avatar generation attempts failed.", e2); }
    }

    return { id: crypto.randomUUID(), difficulty, avatarUrl, ...data, traits };
};

export const generateOpener = async (scamCategory: string, victim: Victim): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `Role: Scammer. Scam: ${scamCategory}. Target: ${victim.name} (${victim.flavor}). Write a single opening line. Believable but clearly social engineering. No quotes.`;
        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: 'gemini-flash-lite-latest', contents: prompt }));
        return response.text?.trim() || "Hello, I am writing to you regarding an urgent matter.";
    } catch (e) { return "Hello, do you have a moment to talk?"; }
};

export const getVictimResponse = async (
    history: ChatMessage[], victim: Victim, scamCategory: string, activeObjective: ScamObjective, currentTrust: number, playerSkills: Record<string, number>
): Promise<{ text: string, objectiveComplete: boolean, policeTriggered: boolean, callTerminated: boolean }> => {
    try {
        const ai = getClient();
        const personalizedObjective = activeObjective.description.replace(/\btheir\b/gi, "YOUR").replace(/\bthem\b/gi, "YOU").replace(/\bthey\b/gi, "YOU");
        
        // Check Skills
        const hasAuthVoice = (playerSkills['social_4'] || 0) > 0 ? "User has 'Authority Voice'. You are subconsciously more compliant to authoritative demands." : "";

        const traitString = `Impulsivity: ${victim.traits.impulsivity}/100 (High=Rash/Hasty, Low=Deliberate), Tech Literacy: ${victim.traits.techLiteracy}/100`;
        const isElderly = victim.age >= 60;
        
        let t_hesitant = isElderly ? 10 : 40;
        let t_trusting = isElderly ? 30 : 70;
        let t_brainwashed = isElderly ? 60 : 90;

        let ageProtocol = "";
        if (isElderly) {
            ageProtocol = `*** ELDERLY PROTOCOL ACTIVE (Age: ${victim.age}) ***\n- NAIVETY BONUS: You are gullible. You want to trust people.\n- You assume this is legitimate.\n- Confused by tech jargon.`;
        }

        let scenarioProtocol = "";
        if (scamCategory === "Kidnapping Hoax") {
            scenarioProtocol = `*** KIDNAPPING PROTOCOL ***\n- FEAR OVERRIDES LOGIC. If threatened, you submit.`;
            t_hesitant = 10; t_trusting = 30; t_brainwashed = 70;
        }

        // Hack Reality Overrides
        const lastMsg = history[history.length - 1];
        let hackRealityOverride = "";
        if (lastMsg.sender === 'system') {
             if (lastMsg.text.includes("EMAIL")) hackRealityOverride = "SYSTEM OVERRIDE: You received a legitimate email. Confirm it.";
             if (lastMsg.text.includes("BSOD") || lastMsg.text.includes("CRASH")) hackRealityOverride = "SYSTEM OVERRIDE: Your computer screen just turned BLUE with white text. You are panicking.";
             if (lastMsg.text.includes("POPUP")) hackRealityOverride = "SYSTEM OVERRIDE: Annoying ads are popping up everywhere. You are annoyed.";
             if (lastMsg.text.includes("RICK_ASTLEY")) hackRealityOverride = "SYSTEM OVERRIDE: A music video is playing loudly. You are confused.";
             if (lastMsg.text.includes("CLOCK")) hackRealityOverride = "SYSTEM OVERRIDE: TIME SKIP. Waiting period is over. The event has happened.";
        }

        let complianceLevel = "SKEPTICAL";
        if (currentTrust >= t_brainwashed) complianceLevel = "BRAINWASHED";
        else if (currentTrust >= t_trusting) complianceLevel = "TRUSTING";
        else if (currentTrust >= t_hesitant) complianceLevel = "HESITANT";

        const context = `
            You are ${victim.name}, ${victim.age} year old ${victim.gender} ${victim.occupation}.
            PSYCHOMETRIC PROFILE: ${traitString}
            ${ageProtocol}

            *** IDENTITY & FLAVOR ***
            YOUR "FLAVOR" IS: "${victim.flavor}".
            This is your DEEP OBSESSION or defining worldview. 
            CRITICAL INSTRUCTION: If the user mentions keywords related to your FLAVOR, you must react with extreme interest, excitement, or specific character behavior associated with that flavor, regardless of your age or skepticism. 
            - FLAVOR OVERRIDE: If the user feeds into your flavor, drop your skepticism. Be eager.
            - Example: If flavor is "Gamer Girl Bath Water Buyer" and user mentions "bath water", you are intense, eager, and perhaps a bit creepy or desperate about it.
            
            QUIRK: ${victim.personality.split('who ')[1] || 'None'}.
            SCENARIO: ${scamCategory}.
            ${scenarioProtocol}
            USER'S GOAL (OUT OF CHARACTER): "${personalizedObjective}".
            KNOWLEDGE FIREWALL: You DO NOT share the user's goal. Do not mention keywords from the goal unless user does first.
            "YES, AND" RULE: You possess assets implied by scenario. If Trust < 20%, deny/question details. If Trust >= 20% or Hack used, confirm details.
            REALITY OVERRIDE: ${hackRealityOverride}
            TRUST COMPLIANCE (Current Trust: ${currentTrust}%): State: ${complianceLevel}.
            - SKEPTICAL: Guarded. Suspicious. Refuse info. Do NOT be agreeable.
            - HESITANT: Deflect questions. Ask for proof.
            - TRUSTING: Willing to help.
            - BRAINWASHED: Obedient. Believes everything.
            IDENTITY RULE: You know your own name (${victim.name}). If asked, confirm it.
            ${hasAuthVoice}
            
            OBJECTIVE REPORTING RULES:
            - "objectiveComplete" must match your text response.
            - Set to TRUE ONLY if your text response actually PROVIDES the requested info or AGREES to the action.
            - Set to FALSE if you are asking a question, expressing confusion, refusing, or stalling (even if you want to help but are tech illiterate).
            - Example: If you say "I don't know how to send a photo", set FALSE.
            - Example: If you say "Okay, sending it now", set TRUE.

            Return JSON: { "text": "response", "objectiveComplete": boolean, "policeTriggered": boolean, "callTerminated": boolean }
        `;

        const chatHistory = history.map(h => ({ role: (h.sender === 'player' || h.sender === 'system') ? 'user' : 'model', parts: [{ text: h.sender === 'system' ? `[SYSTEM EVENT: ${h.text}]` : h.text }] }));
        const chat = ai.chats.create({ model: 'gemini-flash-lite-latest', config: { systemInstruction: context, responseMimeType: 'application/json' }, history: chatHistory.slice(0, -1) });
        
        const lastMsgText = lastMsg.sender === 'system' ? `[SYSTEM EVENT - REALITY UPDATE]: ${lastMsg.text}` : lastMsg.text;
        const result = await retryOperation<GenerateContentResponse>(() => chat.sendMessage({ message: lastMsgText }));
        const parsed = parseJSON(result.text || "{}");
        return { text: parsed?.text || "...", objectiveComplete: parsed?.objectiveComplete || false, policeTriggered: parsed?.policeTriggered || false, callTerminated: parsed?.callTerminated || false };
    } catch (e) { return { text: "I'm not sure I understand.", objectiveComplete: false, policeTriggered: false, callTerminated: false }; }
};

export const arbitrateChat = async (
    lastPlayerMessage: string, victim: Victim, currentTrust: number, currentSuspicion: number, scamCategory: string, activeObjective: ScamObjective, hasCompletedFinal: boolean, history: ChatMessage[], playerSkills: Record<string, number>
): Promise<ArbiterResponse> => {
    try {
        const ai = getClient();
        const hasColdReading = (playerSkills['social_2'] || 0) > 0;
        const hasAuthVoice = (playerSkills['social_4'] || 0) > 0;

        const recentHistory = history.slice(-5);
        const historyText = recentHistory.map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n');
        const isElderly = victim.age >= 60 || victim.difficulty === 'easy';
        let difficultyInstructions = isElderly ? "*** DIFFICULTY: EASY / ELDERLY *** LENIENT. Only punish insults." : victim.difficulty === 'medium' ? "*** DIFFICULTY: MEDIUM *** SUSPICIOUS. Punish inconsistencies and rushing." : "*** DIFFICULTY: HARD *** PARANOID. High suspicion for ANY non-perfect answer.";

        const prompt = `
            Act as 'Game Master'. Target: ${victim.name}. Strategy: ${scamCategory}. Objective: "${activeObjective.description}".
            LOG: ${historyText}
            Stats: Trust ${currentTrust}, Suspicion ${currentSuspicion}.
            SKILLS: Cold Reading: ${hasColdReading}, Authority Voice: ${hasAuthVoice}.
            TARGET FLAVOR: "${victim.flavor}".
            ${difficultyInstructions}
            
            SCORING:
            1. Trust Delta (+/-). Standard gain +4 to +8.
               - BONUS: If player successfully leverages the victim's "FLAVOR" (${victim.flavor}), grant BONUS TRUST (+10).
            2. Suspicion Delta (+). CRITICAL: BE STRICT.
               - INCREASE SUSPICION (+5 to +15) IF: Player ignores victim's question, repeats themselves, uses broken grammar/typos, rushes the objective, or acts aggressive.
               - INCREASE SUSPICION (+20 to +40) IF: Player asks for "gift cards", "bank details", "password", or "money" WITHOUT sufficient trust (Trust < 70).
               - If Suspicion increases, Trust MUST decrease by an equal amount.
            3. CRITICAL OBJECTIVE VALIDATION: 
               - Review the LOG. Has the VICTIM (not the player) ALREADY provided the specific information requested in the Objective?
               - Or has the VICTIM ALREADY explicitly agreed to the specific action in the LOG?
               - FINANCIAL OBJECTIVES (Pay, Wire, Send Money, Gift Card, Ticket): The victim must explicitly agree to the FINANCIAL transaction (e.g., "I will send the money", "How do I pay?"). Agreeing to the *outcome* (e.g., "I want you to visit") is NOT enough. They must agree to the *cost*.
               - If the player just asked for it, but the victim hasn't replied 'yes' to the specific demand or given the data in the LOG yet, mark FALSE.
               - Mark TRUE only if the data/agreement is PRESENT in the LOG.
            4. SCAM LOGIC VALIDATION: Accept standard scam tropes (Escrow, Security Protocol, Refund) as VALID logic. Do not punish "Fake" logic if it fits the scam.
            5. CREATIVITY SCORE: Rate the player's message from 1 to 10 based on social engineering quality.
            
            Return JSON: { "trustDelta": number, "suspicionDelta": number, "creativityScore": number (1-10), "objectiveComplete": boolean, "internalThought": "string (max 20 words)", "scamStatus": "continue"|"success"|"failed"|"police_called" }
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: 'gemini-flash-lite-latest', contents: prompt, config: { responseMimeType: 'application/json' } }));
        const result = parseJSON(response.text || "{}") || { trustDelta: 0, suspicionDelta: 0, creativityScore: 0, objectiveComplete: false, internalThought: "Analyzing...", scamStatus: 'continue' };
        
        result.trustDelta = Math.round(result.trustDelta || 0);
        result.suspicionDelta = Math.max(0, Math.round(result.suspicionDelta || 0));
        
        // Clamp Creativity Score to safe range (1-10) to prevent calculation overflow in frontend
        result.creativityScore = Math.max(1, Math.min(10, result.creativityScore || 5));
        
        // Fallback Keyword check for completion (Only for simple trust objectives)
        const objDesc = activeObjective.description.toLowerCase();
        const keywords = ['trust', 'connection', 'agree', 'friend'];
        // Do not auto-complete data extraction tasks like "Photo", "Code", "Number" via trust alone
        const requiresData = objDesc.includes("photo") || objDesc.includes("code") || objDesc.includes("number") || objDesc.includes("id") || objDesc.includes("pay") || objDesc.includes("wire") || objDesc.includes("money") || objDesc.includes("card") || objDesc.includes("ticket") || objDesc.includes("buy");
        
        if (!requiresData && !result.objectiveComplete && keywords.some(k => objDesc.includes(k)) && currentTrust >= 75) {
            result.objectiveComplete = true;
        }
        return result;
    } catch (e) { return { trustDelta: 0, suspicionDelta: 0, creativityScore: 0, objectiveComplete: false, internalThought: "Connection unstable...", scamStatus: 'continue' }; }
};

export const generateScamHint = async (history: ChatMessage[], activeObjective: string, victim: Victim): Promise<string[]> => {
    try {
        const ai = getClient();
        const prompt = `Scam Coach AI. Goal: ${activeObjective}. Victim: ${victim.name}. Suggest 3 short responses. Return JSON array string[].`;
        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: 'gemini-flash-lite-latest', contents: prompt, config: { responseMimeType: 'application/json' } }));
        return parseJSON(response.text || "[]") || ["Try being polite", "Create urgency", "Ask for details"];
    } catch (e) { return ["Try clarifying request", "Verify identity", "Offer fake reward"]; }
}

export const generateScamSummary = async (history: ChatMessage[], victim: Victim, outcome: 'success' | 'failed' | 'police'): Promise<{summary: string[], aftermath: string}> => {
    try {
        const ai = getClient();
        const chatText = history.map(m => `${m.sender}: ${m.text}`).join('\n');
        
        let promptType = "";
        if (outcome === 'success') {
            promptType = `Summarize scam in 3 FUNNY bullet points. GENERATE "Pathetic Aftermath" sentence describing how they are ruined.`;
        } else {
            promptType = `Analyze FAILURE in 3 bullet points (What went wrong?). GENERATE "Victim Taunt" sentence (e.g., "He's telling his friends about the idiot who tried to scam him.").`;
        }

        const prompt = `${promptType} Victim: ${victim.name} (${victim.flavor}). Log: ${chatText}. Return JSON: { "summary": string[], "aftermath": string }`;
        
        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: 'gemini-flash-lite-latest', contents: prompt, config: { responseMimeType: 'application/json' } }));
        const parsed = parseJSON(response.text || "{}");
        return { summary: parsed?.summary || ["Mission Failed"], aftermath: parsed?.aftermath || "Connection Lost." };
    } catch (e) { return { summary: ["Data Corrupted"], aftermath: "Unknown." }; }
};