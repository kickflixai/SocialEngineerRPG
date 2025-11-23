
import { HackAbility, ShopItem } from './types';

// --- HACKING ABILITIES ---
export const HACK_ABILITIES: HackAbility[] = [
    // TIER 1
    { id: 'spoof_email', name: 'Forge Email', description: 'Simulate an email from a known contact.', cost: 35, icon: 'Mail', systemMessage: '>> EMAIL SPOOFING SUCCESSFUL. FAKE AUTHORIZATION DELIVERED TO TARGET INBOX.' },
    { id: 'fake_notification', name: 'Bank Alert', description: 'Trigger a fake security notification.', cost: 45, icon: 'Bell', systemMessage: '>> SMS INJECTION COMPLETE. TARGET RECEIVED "UNAUTHORIZED LOGIN" ALERT.' },
    { id: 'noise_generator', name: 'Office Ambience', description: 'Play busy office sounds to boost credibility.', cost: 25, icon: 'Speaker', systemMessage: '>> AUDIO MIXER ACTIVE. BACKGROUND: "BUSY_CALL_CENTER_V4.MP3" LOOPING.' },
    
    // TIER 2
    { id: 'time_skip', name: 'Time Skip', description: 'Advance simulation clock by 24h.', cost: 50, icon: 'Clock', systemMessage: '>> SYSTEM CLOCK OVERRIDE. TEMPORAL JUMP: +24 HOURS. SCHEDULED EVENTS TRIGGERED.' },
    { id: 'delay_packet', name: 'Lag Switch', description: 'Simulate connection issues.', cost: 30, icon: 'WifiOff', systemMessage: '>> NETWORK THROTTLED. ARTIFICIAL LATENCY INTRODUCED.' },
    { id: 'ip_scramble', name: 'Trace Scrubber', description: 'Bounce signal to confuse origin.', cost: 40, icon: 'Shuffle', systemMessage: '>> PROXY CHAIN ROTATED. IP ADDRESS OBFUSCATED.' },
    { id: 'fake_receipt', name: 'Wire Receipt', description: 'Send a forged transaction confirmation.', cost: 50, icon: 'FileCheck', systemMessage: '>> DOCUMENT FORGED. "TRANSACTION_SUCCESS.PDF" SENT TO TARGET DEVICE.' },

    // TIER 3
    { id: 'voice_changer', name: 'Deepfake Audio', description: 'Play a snippet of a relative\'s voice.', cost: 60, icon: 'Mic', systemMessage: '>> AUDIO DEEPFAKE STREAMED. VOICE MATCH: 98% ACCURACY.' },
    { id: 'gov_database', name: 'Fed Database', description: 'Flash fake government credentials.', cost: 65, icon: 'BadgeCheck', systemMessage: '>> DATABASE INJECTION. AGENT CREDENTIALS PUSHED TO TARGET SCREEN.' },
    { id: 'background_check', name: 'Quick Dox', description: 'Reveal a hidden fact immediately.', cost: 75, icon: 'Search', systemMessage: '>> DATABASE LEAK DECRYPTED. NEW INTEL ACQUIRED.' },
    { id: 'credential_dump', name: 'Password Leak', description: 'Show target their own passwords.', cost: 85, icon: 'Key', systemMessage: '>> PASSWORD HASH CRACKED. DISPLAYING PLAIN TEXT CREDENTIALS TO TARGET.' },

    // TIER 4
    { id: 'printer_demon', name: 'Printer Demon', description: 'Force printer to print binary.', cost: 40, icon: 'Printer', systemMessage: '>> IOT EXPLOIT. PRINTER SPOOLER OVERLOADED. PRINTING: "WATCHING_YOU.BIN".' },
    { id: 'smart_lights', name: 'Poltergeist', description: 'Flicker lights rapidly.', cost: 30, icon: 'Lightbulb', systemMessage: '>> HOME AUTOMATION BREACHED. LIGHTS SET TO STROBE MODE.' },
    { id: 'bsod_sim', name: 'Fake Crash', description: 'Flash BSOD on their monitor.', cost: 55, icon: 'MonitorX', systemMessage: '>> VIDEO DRIVER CRASH SIMULATED. BSOD DISPLAYED ON MAIN MONITOR.' },
    { id: 'browser_popup', name: 'Ad Storm', description: 'Open 20 pop-up windows.', cost: 20, icon: 'AppWindow', systemMessage: '>> BROWSER INJECTION. POPUP LOOP INITIATED.' },
    { id: 'rickroll', name: 'Meme Protocol', description: 'Force open YouTube.', cost: 15, icon: 'Music', systemMessage: '>> URL INJECTION. PLAYING: "RICK_ASTLEY_OPUS.MP4".' },
    { id: 'cd_eject', name: 'Ghost Tray', description: 'Eject CD tray repeatedly.', cost: 10, icon: 'Disc', systemMessage: '>> HARDWARE INTERRUPT. OPTICAL DRIVE: EJECT/CLOSE LOOP.' },
    { id: 'thermostat_hack', name: 'Heat Wave', description: 'Set thermostat to 99°F.', cost: 35, icon: 'Thermometer', systemMessage: '>> IOT THERMOSTAT BRIDGE BYPASSED. SET TEMP: 99°F.' },
    { id: 'tts_ghost', name: 'Phantom TTS', description: 'Make computer whisper "I see you".', cost: 50, icon: 'Ghost', systemMessage: '>> TEXT-TO-SPEECH INJECTION. VOL: 10%. MSG: "I see you".' },
    { id: 'mouse_jitter', name: 'Cursor Glitch', description: 'Shake mouse cursor.', cost: 25, icon: 'MousePointer2', systemMessage: '>> INPUT DRIVER HIJACKED. RANDOMIZING X/Y COORDINATES.' },
    { id: 'webcam_led', name: 'Paranoia LED', description: 'Turn on webcam light.', cost: 45, icon: 'Video', systemMessage: '>> PERIPHERAL CONTROL. WEBCAM INDICATOR: TOGGLE ON.' }
];

// --- SHOP ITEMS ---
// Adjusted costs for lower payout economy ($800 - $6000 range)
export const SHOP_ITEMS: ShopItem[] = [
  { id: 'burner_phone', name: 'Burner Phone', description: 'Switch devices. Reduces Threat Level by 20.', cost: 800, effect: 'reduce_threat', icon: 'Smartphone', usageContext: 'dashboard' },
  { id: 'voice_modulator', name: 'Voice Modulator', description: 'Instantly boosts Trust by 20 points.', cost: 400, effect: 'boost_trust_minor', icon: 'Mic2', usageContext: 'scam' },
  { id: 'grease_palm', name: 'Police Bribe', description: 'Pay off a precinct. Reduces Threat Level by 50.', cost: 1500, effect: 'reduce_threat_major', icon: 'Briefcase', usageContext: 'dashboard' },
  { id: 'cleaner', name: 'The Cleaner', description: 'Wipe digital footprint. Resets Threat to 0.', cost: 2500, effect: 'reset_threat', icon: 'Trash2', usageContext: 'dashboard' },
  { id: 'ransomware', name: 'Ransomware Kit', description: 'Force success on current objective. +30 Suspicion.', cost: 3500, effect: 'force_objective', icon: 'Lock', usageContext: 'scam' },
  { id: 'ddos_attack', name: 'DDoS Attack', description: 'Network Reset. Sets Trust to 50. No Suspicion drop.', cost: 600, effect: 'reset_trust', icon: 'WifiOff', usageContext: 'scam' },
  { id: 'fake_id', name: 'Forged FBI Badge', description: 'Unlock "Federal Agent" persona. +25 Trust.', cost: 900, effect: 'boost_trust', icon: 'BadgeCheck', usageContext: 'scam' }
];
