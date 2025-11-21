
import { HACKING_MUSIC_URL, DASHBOARD_MUSIC_URL } from '../constants';

class AudioService {
  private ctx: AudioContext | null = null;
  private bgmNodes: AudioNode[] = [];
  private hackingNodes: AudioNode[] = [];
  private scanNodes: AudioNode[] = [];
  
  // External File Elements
  private hackingAudio: HTMLAudioElement | null = null;
  private dashboardAudio: HTMLAudioElement | null = null;

  private isMuted: boolean = false;
  private currentTheme: 'dashboard' | 'hacking' | 'none' = 'none';
  
  // For melody sequencing
  private scanInterval: number | null = null;
  private hackingInterval: number | null = null;
  private dashboardInterval: number | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.ctx) {
        if (mute) this.ctx.suspend();
        else this.ctx.resume();
    }
    // Handle HTML5 Audio Elements
    if (this.hackingAudio) this.hackingAudio.muted = mute;
    if (this.dashboardAudio) this.dashboardAudio.muted = mute;
  }

  public toggleMute() {
      this.setMute(!this.isMuted);
      return this.isMuted;
  }

  public startDashboardTheme() {
      if (this.currentTheme === 'dashboard') return;
      
      // Stop Hacking Theme if playing
      this.stopHackingTheme();

      // External URL logic
      if (DASHBOARD_MUSIC_URL) {
          if (!this.dashboardAudio) {
              this.dashboardAudio = new Audio(DASHBOARD_MUSIC_URL);
              this.dashboardAudio.loop = true;
              this.dashboardAudio.volume = 0.2;
          }
          this.dashboardAudio.muted = this.isMuted;
          this.dashboardAudio.play().catch(e => console.error("Dashboard audio play failed:", e));
          this.currentTheme = 'dashboard';
          return;
      }

      // Fallback Generative Dashboard Synth (Dark Ambient Drone)
      this.init();
      if (!this.ctx) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.value = 0.03;
      masterGain.connect(this.ctx.destination);

      // 1. Low Drone
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 55; // A1
      osc1.start();

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 110; // A2
      osc2.detune.value = 5; // Slight detune for warmth
      osc2.start();

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      // 2. Occasional High Blips (Menu sounds)
      const playBlip = () => {
          if (!this.ctx || this.currentTheme !== 'dashboard') return;
          const blipOsc = this.ctx.createOscillator();
          const blipGain = this.ctx.createGain();
          
          blipOsc.type = 'sine';
          blipOsc.frequency.setValueAtTime(880, this.ctx.currentTime);
          blipOsc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1);
          
          blipGain.gain.setValueAtTime(0, this.ctx.currentTime);
          blipGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.05);
          blipGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
          
          blipOsc.connect(blipGain);
          blipGain.connect(masterGain);
          
          blipOsc.start();
          blipOsc.stop(this.ctx.currentTime + 0.4);
          
          this.dashboardInterval = window.setTimeout(playBlip, 4000 + Math.random() * 4000);
      };
      playBlip();

      this.bgmNodes = [osc1, osc2, masterGain];
      this.currentTheme = 'dashboard';
  }

  public stopDashboardTheme() {
      if (this.dashboardAudio) {
          this.dashboardAudio.pause();
          this.dashboardAudio.currentTime = 0;
      }
      if (this.dashboardInterval) clearTimeout(this.dashboardInterval);
      this.bgmNodes.forEach(node => {
          if (node instanceof OscillatorNode) node.stop();
          node.disconnect();
      });
      this.bgmNodes = [];
      if (this.currentTheme === 'dashboard') this.currentTheme = 'none';
  }

  public startHackingTheme() {
      if (this.currentTheme === 'hacking') return;
      
      // Stop Dashboard Theme if playing
      this.stopDashboardTheme();

      // If external URL is provided in constants, play that instead
      if (HACKING_MUSIC_URL) {
          if (!this.hackingAudio) {
              this.hackingAudio = new Audio(HACKING_MUSIC_URL);
              this.hackingAudio.loop = true;
              this.hackingAudio.volume = 0.3; 
          }
          this.hackingAudio.muted = this.isMuted;
          this.hackingAudio.play().catch(e => console.error("Hacking audio play failed:", e));
          this.currentTheme = 'hacking';
          return;
      }

      // Fallback to Generative Synth
      this.init();
      if (!this.ctx) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.value = 0.02; // Soft Background
      masterGain.connect(this.ctx.destination);

      // 1. Deep Bass Drone (D Minor)
      const bass = this.ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.value = 73.42; // D2
      const bassGain = this.ctx.createGain();
      bassGain.gain.value = 0.4;
      bass.connect(bassGain);
      bassGain.connect(masterGain);
      bass.start();

      // 2. Melodic Generator
      // Scale: D Minor (D, E, F, G, A, Bb, C)
      const scale = [293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25]; 
      
      const playNote = () => {
          if (!this.ctx || this.currentTheme !== 'hacking') return;
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          
          osc.type = 'triangle';
          // Pick random note from scale, favoring lower notes for mood
          const note = scale[Math.floor(Math.random() * 5)]; 
          osc.frequency.value = note;
          
          // Soft attack and release
          const now = this.ctx.currentTime;
          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 4);
          
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          
          osc.start();
          osc.stop(now + 4.5);
      };

      // Play a note every 3-5 seconds randomly
      const loop = () => {
           playNote();
           this.hackingInterval = window.setTimeout(loop, 2000 + Math.random() * 3000);
      };
      loop();

      this.hackingNodes = [bass, bassGain, masterGain];
      this.currentTheme = 'hacking';
  }

  public stopHackingTheme() {
      if (this.hackingAudio) {
          this.hackingAudio.pause();
          this.hackingAudio.currentTime = 0;
      }

      if (this.hackingInterval) clearTimeout(this.hackingInterval);
      this.hackingNodes.forEach(node => {
          if (node instanceof OscillatorNode) node.stop();
          node.disconnect();
      });
      this.hackingNodes = [];
      if (this.currentTheme === 'hacking') this.currentTheme = 'none';
  }

  public startScanLoop() {
      if (this.scanNodes.length > 0 || this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.value = 0.05; // Increased volume for scan
      masterGain.connect(this.ctx.destination);

      // New Sound: Rapid Data Stream Processing (Square wave blips)
      const playScanNote = () => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          
          osc.type = 'square'; // Digital sound
          
          // Random high frequency to sound like data calculation
          osc.frequency.value = 800 + Math.random() * 1000;

          const now = this.ctx.currentTime;
          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(0.1, now + 0.01);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(oscGain);
          oscGain.connect(masterGain);

          osc.start();
          osc.stop(now + 0.1);
      };

      playScanNote();
      // Fast interval for rapid data sound
      const interval = window.setInterval(playScanNote, 100); 
      this.scanInterval = interval;

      this.scanNodes = [masterGain]; 
  }

  public stopScanLoop() {
      if (this.scanInterval) clearInterval(this.scanInterval);
      this.scanNodes.forEach(node => node.disconnect());
      this.scanNodes = [];
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
  }

  public playClick() {
      this.playTone(800, 'square', 0.05, 0.005); // Quieter
  }

  public playMessageSent() {
      this.playTone(400, 'sine', 0.1, 0.03);
  }

  public playMessageReceived() {
      this.playTone(800, 'sine', 0.1, 0.02);
  }

  public playSuccess() {
      this.playTone(440, 'triangle', 0.1, 0.05);
      setTimeout(() => this.playTone(554, 'triangle', 0.1, 0.05), 100); 
      setTimeout(() => this.playTone(659, 'triangle', 0.4, 0.05), 200); 
  }

  public playFailure() {
      this.playTone(150, 'sawtooth', 0.3, 0.02);
      setTimeout(() => this.playTone(100, 'sawtooth', 0.5, 0.02), 150);
  }
}

export const audioManager = new AudioService();
