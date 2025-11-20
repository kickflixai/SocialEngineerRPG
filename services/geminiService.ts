
import { GoogleGenAI, Modality } from "@google/genai";
import { ArbiterResponse, ChatMessage, PlayerAttributes, Victim } from "../types";

const getClient = () => {
    // API Key must be obtained exclusively from process.env.API_KEY
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
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

export const generatePlayerAvatar = async (attrs: PlayerAttributes): Promise<string> => {
    const ai = getClient();
    // Enhanced prompt for photorealism
    const prompt = `
        RAW candid photograph of a person, 8k resolution, highly detailed.
        Subject: ${attrs.age} year old ${attrs.gender}, ${attrs.archetype} archetype.
        Origin: ${attrs.country}.
        Clothing: ${attrs.clothing}.
        Facial Features: ${attrs.facialFeatures}.
        Accessories: ${attrs.accessories}.
        
        Style: Shot on Sony A7R IV, 85mm lens, f/1.8. Realistic skin texture, pores visible, natural lighting, slightly gritty cyber-noir atmosphere.
        
        Constraint: The image must look like a real photograph. 
        Do NOT generate: 3D render, CGI, illustration, cartoon, anime, painting, plastic skin, smooth skin, doll-like.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1',
                    imageSize: '1K'
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
    const ai = getClient();
    const difficultyPrompts = {
        easy: "Senior citizen, elderly, perhaps lonely or not tech-savvy.",
        medium: "Middle-aged working professional, small business owner.",
        hard: "High-net-worth individual, executive, tech-savvy, cynical."
    };

    // FORCE 50/50 Gender Split in prompt logic
    const genderPrompt = Math.random() > 0.5 ? "Male" : "Female";

    const prompt = `
        Generate a fictional JSON profile for a 'victim' character in a roleplay social engineering defense game.
        Difficulty Level: ${difficulty} (${difficultyPrompts[difficulty]}).
        Required Gender: ${genderPrompt}.
        
        Crucial: Ensure this character feels distinct and unique. Vary the "resistanceStyle" significantly.
        
        Return ONLY valid JSON matching this schema:
        {
            "name": "string",
            "age": number,
            "gender": "${genderPrompt}",
            "occupation": "string",
            "personality": "string (e.g., 'Overly polite but confused', 'Short-tempered and busy', 'Suspicious conspiracy theorist')",
            "hiddenFact": "string (a specific detail like pet name, medical issue, secret hobby)",
            "weakness": "string (what makes them vulnerable, e.g., 'fear of authority', 'greed', 'love for family')",
            "resistanceStyle": "string (How they push back: e.g., 'Asks circular technical questions', 'Demands to speak to a supervisor', 'Feigns ignorance', 'Aggressive counter-questioning', 'Passive-aggressive silence')"
        }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    const data = parseJSON(response.text || "{}") || {
        name: "Unknown Target",
        age: 45,
        gender: genderPrompt.toLowerCase(),
        occupation: "Unknown",
        personality: "Generic",
        hiddenFact: "Has a cat",
        weakness: "Money",
        resistanceStyle: "Asks questions"
    };
    
    // Generate avatar for victim with photorealism focus
    let avatarUrl = "https://picsum.photos/400/400";
    try {
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: `
                Raw, photorealistic portrait of ${data.name}, a ${data.age} year old ${data.gender} ${data.occupation}.
                Expression: ${data.personality}, candid shot, natural lighting.
                Style: National Geographic portrait style, shallow depth of field, real skin texture, imperfections.
                Do NOT generate: CGI, 3D, cartoon, illustration, smooth skin.
            ` }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1',
                    imageSize: '1K'
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
};

export const getVictimResponse = async (history: ChatMessage[], victim: Victim, scamCategory: string): Promise<string> => {
    const ai = getClient();
    
    const context = `
        You are roleplaying as ${victim.name}, a ${victim.age}-year-old ${victim.gender} ${victim.occupation}.
        
        Core Personality: ${victim.personality}.
        Weakness: ${victim.weakness}.
        Hidden Fact: ${victim.hiddenFact}.
        Resistance Style: ${victim.resistanceStyle} (This is HOW you act difficult).
        
        Current Situation: You are receiving messages that seem like a ${scamCategory} scam.
        
        INSTRUCTIONS FOR AI:
        1. **BE UNIQUE**: Do NOT follow a generic script. Act specifically according to your Resistance Style.
        2. **RESIST**: If the user uses generic copy-paste scam lines, be skeptical. They must be creative to win you over.
        3. **ADAPT**: If they mention your specific Weakness or Hidden Fact, you crumble/trust them. If they are vague, you block/resist.
        4. **QUIRKS**: Use speech patterns matching your age and personality (e.g., typing errors for seniors, jargon for pros).
        5. Do NOT break character. You are the victim.
        6. Keep responses concise (1-3 sentences).
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
};

export const arbitrateChat = async (
    lastPlayerMessage: string, 
    victim: Victim, 
    currentTrust: number, 
    currentSuspicion: number,
    currentProgress: number,
    scamCategory: string
): Promise<ArbiterResponse> => {
    const ai = getClient();

    const prompt = `
        Act as the 'Game Master' engine for a social engineering simulation.
        
        Target: ${victim.name} (${victim.personality}, Weakness: ${victim.weakness}).
        Resistance Style: ${victim.resistanceStyle}.
        Scam Strategy: ${scamCategory}.
        Player's Message: "${lastPlayerMessage}".
        Current Stats: Trust: ${currentTrust}%, Suspicion: ${currentSuspicion}%, Progress: ${currentProgress}%.
        
        GOAL: The player must convince the target to perform a SPECIFIC ACTION relevant to the '${scamCategory}' (e.g., send money, buy gift cards, click a link, give password, download file).
        
        Analyze:
        1. Creativity: Is the player being creative or using a generic script? (Generic scripts should increase Suspicion).
        2. Action Driven: Did the player ask for the specific scam action?
        3. Personality Match: Did the player adapt to the victim's '${victim.resistanceStyle}'?
        
        Determine Stats:
        - Trust Delta: High if they used the victim's weakness. Low/Negative if generic.
        - Suspicion Delta: Increases if logic fails or player is too pushy too soon.
        - Progress Delta: 
            - Small increase for good relationship building.
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
            "internalThought": "string (Short reasoning for the player. Mention if they were creative or generic.)",
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
};

export const generateSpeech = async (text: string, gender: 'male' | 'female'): Promise<ArrayBuffer | null> => {
    const ai = getClient();
    // Select voice based on victim gender
    const voiceName = gender === 'male' ? 'Puck' : 'Kore'; 
    
    try {
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
        if (!base64Audio) return null;

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
