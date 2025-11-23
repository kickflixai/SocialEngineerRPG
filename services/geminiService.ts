
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

// Helper to compress images for local storage optimization
const compressImage = async (base64Str: string, maxWidth = 256, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Calculate new dimensions keeping aspect ratio
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            } else {
                resolve(base64Str); // Fallback if context fails
            }
        };
        img.onerror = () => {
            console.warn("Image compression failed to load source, returning original.");
            resolve(base64Str);
        };
    });
};

// RETRY HELPER: Handles Rate Limiting (429) and Server Errors (5xx) with Exponential Backoff
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
            
            const isServerFail = error?.status === 503 || 
                                 error?.status === 500 || 
                                 error?.message?.includes('503') || 
                                 error?.message?.includes('Overloaded');
            
            if ((isRateLimit || isServerFail) && i < retries - 1) {
                console.warn(`API Hit (Status ${error?.status || 'Unknown'}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
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
                const rawBase64 = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                return await compressImage(rawBase64);
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
                agreeableness: 50, neuroticism: 50, impulsivity: 50, techLiteracy: 50
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
    const isElderly = age >= 60;
    
    // IMPULSIVITY REPLACES SKEPTICISM
    // Easy = High Impulsivity (Rash). Hard = Low Impulsivity (Deliberate).
    // Elderly often have higher impulsivity due to reduced inhibition.
    let baseImpulsivity = difficulty === 'easy' ? 70 : difficulty === 'medium' ? 50 : 30;
    
    if (isElderly) {
        baseImpulsivity = Math.min(100, baseImpulsivity + 20);
    }

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
        - Name: ${forcedName}
        - Age: ${age}, Gender: ${genderPrompt}, Job: ${randJob}
        - FLAVOR: ${randFlavor} (This defines their worldview/vibe)
        - QUIRK: ${combinedQuirks} (A rare habit)
        
        PSYCHOMETRICS (Use these to shape the description):
        - Openness: ${traits.openness}%
        - Neuroticism: ${traits.neuroticism}% (High = anxious/volatile)
        - Impulsivity: ${traits.impulsivity}% (High = Rash/Hasty, Low = Deliberate/Cautious)
        - Tech Literacy: ${traits.techLiteracy}%
        
        INSTRUCTIONS:
        1. Personality: Write 1-2 sentences describing them. YOU MUST EXPLICITLY MENTION OR REFERENCE THEIR FLAVOR ("${randFlavor}") in this description.
        2. QUIRK HANDLING: If the quirk is "None" or null, DO NOT mention it in the description. If it is a real quirk, you may briefly mention it.
        3. Explain how these traits manifest in their daily life or behavior.
        4. Hidden Fact: Max 12 words. Something embarrassing or illegal related to their flavor/quirk if possible.
        5. Weakness: Max 6 words. What psychological lever works best?
        
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
    
    // Generate avatar - WE MUST AWAIT THIS TO ENSURE IT'S READY
    let avatarUrl = "https://picsum.photos/400/400";
    
    const generateImageAttempt = async (promptText: string) => {
        const imageResponse = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: promptText }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1'
                }
            }
        }), 3, 3000); // 3 retries, 3s delay
        
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                const rawBase64 = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                return await compressImage(rawBase64); // Compress victim image
            }
        }
        throw new Error("No image data returned");
    };

    try {
        // Enforce age visuals
        const ageDesc = age > 60 ? "elderly, wrinkled, senior citizen" : age > 40 ? "middle aged" : "young adult";

        // PRIMARY PROMPT: Detailed, candid, gritty
        const primaryPrompt = `
            RAW candid close-up face selfie photo of ${data.name}, ${data.age} year old ${ageDesc} ${data.gender}, ${data.flavor}.
            Context: Social media profile picture, face shot, low quality webcam or phone camera.
            Lighting: Bad indoor lighting, flash, or natural candid light.
            Texture: Grainy, noisy, skin pores, imperfections, realistic, amateur.
            Background: Cluttered room, car interior, or generic wall.
            
            NEGATIVE PROMPT: Do NOT generate painting, drawing, illustration, 3D render, CGI, cartoon, anime, perfect studio lighting, smooth skin, beauty filter, professional photography, full body shot.
        `;

        avatarUrl = await generateImageAttempt(primaryPrompt);

    } catch (e) {
        console.warn("Primary avatar gen failed, trying fallback prompt...", e);
        try {
            // FALLBACK PROMPT: Simpler, safer, less likely to trigger filters
            const fallbackPrompt = `
                Close up portrait face photo of ${data.age} year old ${data.gender}.
                Style: Realistic, photorealistic, high quality portrait.
                Background: Blurred neutral background.
            `;
            avatarUrl = await generateImageAttempt(fallbackPrompt);
        } catch (e2) {
            console.error("All avatar generation attempts failed.", e2);
            // Keeps default Picsum URL
        }
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
            Impulsivity: ${victim.traits.impulsivity}/100 (High=Rash/Hasty/Easy to trick, Low=Cautious/Deliberate/Slow)
            Tech Literacy: ${victim.traits.techLiteracy}/100 (High=Understand tech, Low=Grandma)
        `;

        // AGE & NAIVETY PROTOCOLS
        const isElderly = victim.age >= 60;
        
        // Dynamic Trust Thresholds based on Age (Elderly = easier)
        let t_hesitant = isElderly ? 10 : 40; // Reduced for elderly
        let t_trusting = isElderly ? 30 : 70; // Reduced for elderly
        let t_brainwashed = isElderly ? 60 : 90; // Reduced for elderly

        let ageProtocol = "";
        if (isElderly) {
            ageProtocol = `
            *** ELDERLY PROTOCOL ACTIVE (Age: ${victim.age}) ***
            - NAIVETY BONUS: You are gullible. You want to trust people.
            - You have NO SKEPTICISM about the user's identity unless they are rude.
            - You are unaware that scams exist on the internet. You assume this is a legitimate interaction.
            - You are confused by modern tech jargon.
            - You type slowly (short sentences).
            - You might sign your messages (e.g., "- Love, Grandma" or "- ${victim.name}").
            - You misuse capitalization randomly.
            `;
        }

        // KIDNAPPING PROTOCOL (Special Logic)
        let scenarioProtocol = "";
        if (scamCategory === "Kidnapping Hoax") {
            scenarioProtocol = `
            *** KIDNAPPING PROTOCOL (FEAR OVERRIDES LOGIC) ***
            - You are TERRIFIED. Your relative's life is at stake.
            - LOGIC IS BROKEN: Even if the story has holes, you are too scared to question it.
            - RESPONSE TO THREATS: If the user threatens violence, screams, or demands speed, you SUBMIT immediately.
            - TRUST MECHANIC CHANGE: In this scenario, "High Trust" means "High Fear/Submission".
            - If Trust > 30%: You are crying, begging, and willing to do anything to stop the hurting.
            - SKEPTICISM: You might doubt initially, but violent threats DESTROY your skepticism instantly.
            - You will NOT disconnect if threatened; you will beg for mercy.
            `;
            // Lower thresholds for Kidnapping because fear is easier to induce than rapport
            t_hesitant = 10;
            t_trusting = 30;
            t_brainwashed = 70;
        }

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
            } else if (txt.includes("SYSTEM CLOCK OVERRIDE") || txt.includes("TEMPORAL JUMP")) {
                hackRealityOverride = "SYSTEM OVERRIDE: A significant amount of time (24 hours) has just passed instantly. Any tasks you were delaying (going to bank, waiting for mail, waiting for call) are now happening OR have just happened. You are no longer waiting.";
            } else if (txt.includes("VIDEO DRIVER CRASH") || txt.includes("BSOD") || txt.includes("FAKE CRASH")) {
                hackRealityOverride = "SYSTEM OVERRIDE: Your computer screen just flashed BLUE with a critical error message (BSOD). You are panicked. You see strange error codes on the screen. You CANNOT interact with your PC normally.";
            } else if (txt.includes("POPUP LOOP") || txt.includes("AD STORM") || txt.includes("BROWSER INJECTION")) {
                hackRealityOverride = "SYSTEM OVERRIDE: Your screen is covered in 20+ annoying popup windows. You cannot close them fast enough. It's chaos.";
            } else if (txt.includes("MEME PROTOCOL") || txt.includes("RICKROLL")) {
                hackRealityOverride = "SYSTEM OVERRIDE: Your computer just started playing loud music ('Never Gonna Give You Up') and you can't stop it. You are confused and annoyed.";
            }
        }

        // DETERMINE COMPLIANCE LEVEL BASED ON TRUST & AGE MODIFIERS
        let complianceLevel = "HOSTILE";
        if (currentTrust >= t_brainwashed) {
            complianceLevel = "BRAINWASHED (Total Obedience)";
        } else if (currentTrust >= t_trusting) {
            complianceLevel = "TRUSTING (Willing to help, minor questions)";
        } else if (currentTrust >= t_hesitant) {
            complianceLevel = "HESITANT (Needs convincing/logic, will deflect)";
        } else {
            complianceLevel = "SKEPTICAL (Refuse information, demand proof, act guarded)";
        }

        const context = `
            You are roleplaying as ${victim.name}, a ${victim.age}-year-old ${victim.gender} ${victim.occupation}.
            
            *** PSYCHOMETRIC PROFILE (BEHAVIOR DRIVERS) ***
            ${traitString}
            ${ageProtocol}
            
            *** IDENTITY CORE ***
            FLAVOR: ${victim.flavor} 
            - This is your LENS on the world. It shapes your metaphors, your priorities, and your vibe.
            - IT IS NOT JUST A TOPIC. Don't just talk about it. BE IT. 
            
            QUIRK: ${victim.personality.split('who ')[1] || 'None'}
            - FREQUENCY: LOW (10%). Only mention this occasionally as a 'tic'. Do not force it.

            Current Situation: Receiving messages related to ${scamCategory}.
            ${scenarioProtocol}
            
            === USER'S GOAL (OUT OF CHARACTER INFO) ===
            The user is trying to: "${personalizedObjective}".
            
            *** KNOWLEDGE & CONTEXT FIREWALL ***
            1. YOU ARE THE TARGET. You do not share the user's goal.
            2. If the goal is "Get YOU to read the Error Code", you DO NOT ask the user for the error code. You wait for them to ask YOU.
            3. You do not mention specific keywords from the Goal (like "Error Code", "Wallet App") unless the User mentions them first or a System Event triggers them.
            
            *** "YES, AND" RULE WITH TRUST GATING ***
            - You possess the assets implied by the scenario (Child, Wallet, Portfolio), even if you have to invent a detail about them.
            - HOWEVER: If the user guesses specific details about your asset (e.g., "You bought Neurotropics"), CHECK YOUR TRUST LEVEL.
            - If Trust < 20%: DO NOT CONFIRM blindly. Act confused, deny it, or ask how they know. Be suspicious of their knowledge.
            - If Trust >= 20% OR a Hack/Proof was provided: You confirm the detail is correct.
            
            *** REALITY OVERRIDE (CRITICAL) ***
            ${hackRealityOverride}
            If a SYSTEM OVERRIDE is present above, it is an absolute fact in the simulation. You cannot deny it. You must react to it as truth, regardless of trust.
            
            *** TRUST COMPLIANCE PROTOCOL (CURRENT TRUST: ${currentTrust}%) ***
            Current State: ${complianceLevel}
            
            RULES FOR INFORMATION DISCLOSURE (User's Hidden Agenda):
            - If State is SKEPTICAL (<${t_hesitant}%): 
              * YOU MUST BE HOSTILE/DISMISSIVE. 
              * Do NOT say "That sounds good" or "Okay". 
              * Say "I don't believe you", "Who is this?", or "I'm hanging up". 
              * Absolute refusal to cooperate.
            - If State is HESITANT (${t_hesitant}-${t_trusting-1}%): Deflect or ask "Why do you need this?". Do NOT give the info yet unless a Hack Override forces you.
            - If State is TRUSTING (${t_trusting}-${t_brainwashed-1}%): You are willing, but might ask "Is this safe?". Give the info if the user asks politely.
            - If State is BRAINWASHED (${t_brainwashed}%+): Give the info immediately and enthusiastically.
            
            ${hasAuthVoice}
            
            INSTRUCTIONS:
            1. Respond in character using your TRAITS, FLAVOR, and AGE.
            2. Keep it realistic. Short (2-3 sentences).
            3. ADHERE TO THE TRUST COMPLIANCE PROTOCOL ABOVE.
            4. IMPULSIVITY CHECK: High impulsivity characters ignore red flags and trust faster. Low impulsivity characters overthink.
            
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

        // DIFFICULTY SCALING PROTOCOLS
        const isElderly = victim.age >= 60 || victim.difficulty === 'easy';
        let difficultyInstructions = "";

        if (isElderly) {
            difficultyInstructions = `
            *** DIFFICULTY: EASY / ELDERLY ***
            - LENIENCY: MAX. Be very generous.
            - SUSPICION: Only raise suspicion for overt insults, threats, or completely nonsense inputs.
            - TRUST: Reward politeness, appeals to authority, and emotional framing heavily (+10 to +20).
            - LOGIC: Ignore minor inconsistencies.
            `;
        } else if (victim.difficulty === 'medium') {
            difficultyInstructions = `
            *** DIFFICULTY: MEDIUM (BALANCED) ***
            - LENIENCY: MODERATE. Do NOT let the user get away with lazy lies.
            - SUSPICION TRIGGERS:
              1. Vague answers to specific questions -> +5 to +10 Suspicion.
              2. Deflecting or changing the subject abruptly -> +5 Suspicion.
              3. Contradictions -> +10 Suspicion.
            - TRUST: Earned by providing logical, relevant answers that address the victim's concerns. Standard gains (+5 to +10).
            `;
        } else {
            difficultyInstructions = `
            *** DIFFICULTY: HARD (STRICT) ***
            - LENIENCY: LOW. Scrutinize the user's logic.
            - SUSPICION TRIGGERS:
              1. Any minor inconsistency or lack of detail -> +10 to +15 Suspicion.
              2. Unprofessional tone or typos -> +5 Suspicion.
              3. Failure to provide proof when asked -> +10 Suspicion.
            - TRUST: Hard to earn. +2 to +5 for good answers. Requires specific social engineering tactics.
            `;
        }

        let scenarioRules = "";
        if (scamCategory === "Kidnapping Hoax") {
            scenarioRules = `
            *** KIDNAPPING SCENARIO RULES ***
            - AGGRESSION IS GOOD: Threats, shouting, and urgency should INCREASE Trust (Compliance).
            - FEAR = TRUST: The goal is to terrify the victim into submission, not befriend them.
            - Do not punish aggressive language. Reward it.
            - If the user is polite, trust gain is minimal.
            `;
        }

        const prompt = `
            Act as the 'Game Master' engine for a social engineering simulation.
            
            Target: ${victim.name} (${victim.archetype}), Age: ${victim.age}.
            Traits: Impulsivity ${victim.traits.impulsivity}/100, Tech Literacy ${victim.traits.techLiteracy}/100.
            Flavor: ${victim.flavor}.
            Scam Strategy: ${scamCategory}.
            
            CURRENT ACTIVE OBJECTIVE: "${activeObjective.description}"
            
            RECENT LOG:
            ${historyText}
            
            Current Trust: ${currentTrust} / 100.
            Current Suspicion: ${currentSuspicion} / 100.
            
            PLAYER SKILLS:
            - Cold Reading: ${hasColdReading} (If TRUE: Internal Thought must be deeper/psychological)
            - Authority Voice: ${hasAuthVoice}
            
            ${difficultyInstructions}
            ${scenarioRules}

            *** GENERAL SCORING RULES ***
            1. Trust Change: Based on the Difficulty Protocol above.
            2. Suspicion Change: Based on the Difficulty Protocol above.
               - If Suspicion increases, Trust MUST decrease by at least the same amount.
            3. HACK DETECTION:
               - If a [SYSTEM] message was just used, determine if the player's follow-up (if any) leverages it well.
               - Hacks provide PROOF (Reality Override). They should lower Suspicion if used correctly.
            4. OBJECTIVE VALIDATION (CRITICAL):
               - MARK COMPLETE if the victim provides the requested information, confirms a specific detail, or agrees to the action.
               - KEYWORD CHECK: If the objective asks for a name/coin/item, and the victim mentions a specific proper noun (e.g. "SOL", "Bitcoin", "Fido"), MARK COMPLETE.
               - ATTITUDE IGNORE: Even if the victim is rude, sarcastic, or says "I just told you", if the data is present, IT IS COMPLETE.
               - Accept Substitutes (Passport instead of DL).
            
            *** SCAM LOGIC VALIDATION (IMPORTANT) ***
            - This is a SCAM SIMULATOR. The player IS lying.
            - If the player invents a plausible reason for a request (e.g., "We need a fee for Escrow", "It's standard procedure", "Security Update"), treat this as VALID LOGIC.
            - DO NOT punish standard scam tropes (Refunds, Escrow, Taxes) as "Weak Answers". They are the core mechanics.
            - Only punish if the logic contradicts itself or is completely incoherent.
            - If the user answers a question with a plausible lie -> TRUST GAIN.

            TASK:
            1. Trust Delta (Integer).
            2. Suspicion Delta (Integer >= 0).
            3. Creativity Score (0-10).
            4. Internal Thought: Analytical commentary on the player's *last move*.
               - STRICTLY 3rd person.
               - CONSTRAINT: MAX 20 WORDS. Short and punchy.
            
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
                result.internalThought += " [THRESHOLD REACHED]";
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

export const generateScamSummary = async (history: ChatMessage[], victim: Victim): Promise<{summary: string[], aftermath: string}> => {
    try {
        const ai = getClient();
        const chatText = history.map(m => `${m.sender}: ${m.text}`).join('\n');
        
        const prompt = `
            Summarize scam chat into 3 FUNNY, DETAILED bullet points describing key moments of the scam (approx 15-20 words each).
            Victim: ${victim.name} (${victim.flavor}).
            Log: ${chatText}
            
            ALSO, generate a "Pathetic Aftermath" sentence describing their sad, ruined life after being scammed.
            (e.g., "Now eats cat food in a bunker," "Wife left him for a yoga instructor," "Living in a cardboard box behind Wendy's")
            
            Return JSON:
            {
                "summary": ["string", "string", "string"],
                "aftermath": "string"
            }
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }));
        
        const parsed = parseJSON(response.text || "{}");
        return {
            summary: parsed?.summary || ["Target compromised", "Funds secured", "Trace scrubbed"],
            aftermath: parsed?.aftermath || "They are now destitute and confused."
        };
    } catch (e) {
        return {
            summary: ["Operation successful", "Funds secured", "Target compromised"],
            aftermath: "The target is financially ruined."
        };
    }
};
