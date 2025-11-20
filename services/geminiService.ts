
import { GoogleGenAI, Modality } from "@google/genai";
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

// Visual descriptors to enforce country origin in AI generation
const COUNTRY_VISUALS: Record<string, string> = {
    'North Korea': 'East Asian ethnicity, austere style, military-inspired or very plain civilian clothing, slightly malnourished look, pyongyang background vibe',
    'Iran': 'Persian ethnicity, modest but modern fashion, urban tehran background, sharp features',
    'Bangladesh': 'South Asian/Bengali ethnicity, tropical climate lighting, casual lightweight clothing, busy dhaka atmosphere',
    'India': 'South Asian/Indian ethnicity, vibrant colors or tech-casual attire, warm lighting, distinct facial features',
    'Russia': 'Slavic/Eastern European ethnicity, cold weather attire, heavy jackets, stern expression, utilitarian brutalist background',
    'USA': 'North American diversity, corporate casual or western streetwear, high production value lighting, confident posture',
    'Nigeria': 'West African ethnicity, distinct regional fashion or sharp business suit, vibrant atmosphere, confident expression',
    'China': 'East Asian/Chinese ethnicity, modern tech-focused look or industrial workwear, neon or office lighting'
};

export const generatePlayerAvatar = async (attrs: PlayerAttributes): Promise<string> => {
    try {
        const ai = getClient();
        
        // Get specific visual cues for the country, fallback to generic if not found
        const countryVisuals = COUNTRY_VISUALS[attrs.country] || `Citizens of ${attrs.country}`;

        // Enhanced prompt for photorealism with Country bias
        const prompt = `
            RAW candid photograph of a person, 8k resolution, highly detailed.
            Subject: ${attrs.age} year old ${attrs.gender}, ${attrs.archetype} archetype.
            Origin: ${attrs.country}.
            Visual Traits: ${countryVisuals}.
            Clothing: ${attrs.clothing}.
            Facial Features: ${attrs.facialFeatures}.
            Accessories: ${attrs.accessories}.
            
            Style: Shot on Sony A7R IV, 85mm lens, f/1.8. Realistic skin texture, pores visible, natural lighting, slightly gritty cyber-noir atmosphere.
            
            Constraint: The image must look like a real photograph. 
            Do NOT generate: 3D render, CGI, illustration, cartoon, anime, painting, plastic skin, smooth skin, doll-like.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1'
                }
            }
        });
        
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
        easy: "Target is an elderly senior citizen (70+ years old). Personality: Trusting, lonely, confused by technology, polite. Resistance Style: 'Apologetic confusion', 'Asks for help', 'Slow to understand'.",
        medium: "Target is a working professional (30-50 years old). Personality: Busy, transactional, moderately skeptical. Resistance Style: 'Asks for verification', 'Too busy to talk', 'Professional skepticism'.",
        hard: "Target is a C-Level Executive or High Net Worth Individual. Personality: Arrogant, paranoid, ruthless, highly intelligent. Resistance Style: 'Legal threats', 'Aggressive counter-interrogation', 'Demands immediate proof', 'Mocking intelligence'."
    };

    // FORCE 50/50 Gender Split in prompt logic
    const genderPrompt = Math.random() > 0.5 ? "Male" : "Female";

    const prompt = `
        Generate a fictional JSON profile for a 'victim' character in a roleplay social engineering defense game.
        
        DIFFICULTY PROFILE: ${difficultyPrompts[difficulty]}
        Required Gender: ${genderPrompt}.
        
        Return ONLY valid JSON matching this schema:
        {
            "name": "string",
            "age": number,
            "gender": "${genderPrompt}",
            "occupation": "string",
            "personality": "string",
            "hiddenFact": "string",
            "weakness": "string",
            "resistanceStyle": "string"
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const parsed = parseJSON(response.text || "{}");
        if (parsed) data = { ...data, ...parsed };
    } catch(e) {
        console.error("Victim text gen failed", e);
    }
    
    // Generate avatar for victim with photorealism focus
    let avatarUrl = "https://picsum.photos/400/400";
    try {
        const imageResponse = await ai.models.generateContent({
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
        });
        
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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

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
            - **EASY (Senior/Elderly)**: You are gullible. You trust easily if they are polite or sound like family. You get confused by tech terms but try to help. Short, simple sentences. Typos allowed.
            - **MEDIUM (Business Owner)**: You are busy. You respond shortly. You need a logical reason to continue. You are skeptical but open to "opportunities" if phrased well.
            - **HARD (Executive/Rich)**: You are hostile to cold calls. You ask for immediate credentials. You mock valid attempts. You threaten legal action. It is very hard to make you happy.
            
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
        const result = await chat.sendMessage({ message: lastMsg });
        
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
    scamCategory: string
): Promise<ArbiterResponse> => {
    try {
        const ai = getClient();

        // Logic modifiers based on difficulty
        const difficultyInstructions = {
            easy: `
                MODE: EASY (The Target is Elderly/Vulnerable).
                - TRUST: Increases rapidly (x1.5 multiplier). Emotional appeals work 100% of the time.
                - SUSPICION: Increases slowly (x0.5 multiplier). Ignore minor logic holes or generic scripts.
                - They should accept standard scam lines like "I am your grandson" or "You won the lottery" easily.
            `,
            medium: `
                MODE: MEDIUM (The Target is a Professional).
                - Standard scoring.
                - Emotional appeals work only if logical.
                - Generic scripts increase Suspicion slightly.
            `,
            hard: `
                MODE: HARD (The Target is an Executive/Paranoid).
                - TRUST: Increases very slowly (x0.5 multiplier). Needs high creativity or precise intel (using Hidden Fact).
                - SUSPICION: Increases rapidly (x2.0 multiplier). Any generic script or slight logic error causes massive suspicion.
                - They will only cooperate if the player sounds extremely authoritative or has specific private info.
            `
        };

        const prompt = `
            Act as the 'Game Master' engine for a social engineering simulation.
            
            Target: ${victim.name} (${victim.personality}, Weakness: ${victim.weakness}).
            Difficulty Level: ${victim.difficulty.toUpperCase()}.
            Scam Strategy: ${scamCategory}.
            Player's Message: "${lastPlayerMessage}".
            Current Stats: Trust: ${currentTrust}%, Suspicion: ${currentSuspicion}%, Progress: ${currentProgress}%.
            
            ${difficultyInstructions[victim.difficulty]}
            
            GOAL: The player must convince the target to perform a SPECIFIC ACTION relevant to the '${scamCategory}' (e.g., send money, buy gift cards, click a link, give password, download file).
            
            Analyze:
            1. Creativity: Is the player being creative?
            2. Action Driven: Did the player ask for the specific scam action?
            3. Personality Match: Did the player adapt to the victim's '${victim.resistanceStyle}'?
            
            Determine Stats:
            - Trust Delta: Based on difficulty rules above.
            - Suspicion Delta: Based on difficulty rules above.
            - Progress Delta: 
                - Small increase for relationship building.
                - LARGE increase if they successfully ask for the final action AND trust is high.
                - 100% Progress ONLY if the victim AGREES to do the action (e.g. "Okay, I sent the money", "I clicked the link").
            
            Rules:
            - If Suspicion reaches 100, scamStatus = 'police_called'.
            - If Progress reaches 100 (Victim agreed to pay/click/download), scamStatus = 'success'.
            - Otherwise 'continue'.
            
            Return JSON only:
            {
                "logicScore": number (0-100),
                "emotionalImpact": number (0-100),
                "trustDelta": number,
                "suspicionDelta": number,
                "progressDelta": number,
                "internalThought": "string (Short reasoning. e.g. 'Target is gullible, trust increased' or 'Target spotted the lie, suspicion up')",
                "scamStatus": "continue" | "success" | "failed" | "police_called"
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

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

export const generateSpeech = async (text: string, gender: 'male' | 'female'): Promise<ArrayBuffer | null> => {
    try {
        const ai = getClient();
        // Select voice based on victim gender. 'Puck' (Male) / 'Kore' (Female)
        // Note: Gemini TTS voices are limited in preview.
        const voiceName = gender.toLowerCase() === 'male' ? 'Puck' : 'Kore'; 
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            console.warn("TTS: No audio data received");
            return null;
        }

        // Decode base64 to ArrayBuffer
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        console.error("TTS Generation failed", e);
        return null;
    }
};
