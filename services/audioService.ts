
class AudioService {
  private ctx: AudioContext | null = null;
  private bgmNodes: { osc1: OscillatorNode, osc2: OscillatorNode, gain: GainNode } | null = null;
  private hackingNodes: AudioNode[] = [];
  private isMuted: boolean = false;
  private bgmStarted: boolean = false;

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
  }

  public toggleMute() {
      this.setMute(!this.isMuted);
      return this.isMuted;
  }

  public startBGM() {
    if (this.bgmStarted) return;
    this.init();
    if (!this.ctx) return;

    // Create a dark ambient drone (Background for Dashboard)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc1.type = 'sawtooth';
    osc1.frequency.value = 45; // Low E
    
    osc2.type = 'sine';
    osc2.frequency.value = 46; // Slight detune
    
    filter.type = 'lowpass';
    filter.frequency.value = 200; // Dark muffling

    gain.gain.value = 0.03; // Very Quiet background

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    this.bgmNodes = { osc1, osc2, gain };
    this.bgmStarted = true;
  }

  public startHackingTheme() {
      if (this.hackingNodes.length > 0 || this.isMuted || !this.ctx) return;
      this.init();
      if (!this.ctx) return;

      // Add a rhythmic tension layer for the active scam
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      // Bass pulse
      osc.type = 'sawtooth';
      osc.frequency.value = 55; // A1

      filter.type = 'lowpass';
      filter.frequency.value = 300;

      // LFO for rhythm (fast pulse)
      const lfo = this.ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 8; // 8Hz pulse
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.15; // Depth

      osc.connect(filter);
      filter.connect(gain);
      
      // Modulate volume with LFO
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      gain.gain.value = 0.02; // Base volume
      gain.connect(this.ctx.destination);

      osc.start();
      lfo.start();

      this.hackingNodes = [osc, gain, filter, lfo, lfoGain];
  }

  public stopHackingTheme() {
      this.hackingNodes.forEach(node => {
          if (node instanceof OscillatorNode) node.stop();
          node.disconnect();
      });
      this.hackingNodes = [];
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
      this.playTone(800, 'square', 0.05, 0.02);
  }

  public playType() {
      // Kept for legacy, but unused in chat typing now
      const freq = 600 + Math.random() * 200;
      this.playTone(freq, 'sine', 0.03, 0.03);
  }

  public playMessageSent() {
      this.playTone(400, 'sine', 0.1, 0.1);
      setTimeout(() => this.playTone(800, 'sine', 0.2, 0.05), 100);
  }

  public playMessageReceived() {
      this.playTone(1200, 'sine', 0.1, 0.05);
      setTimeout(() => this.playTone(1800, 'sine', 0.3, 0.05), 100);
  }

  public playSuccess() {
      this.playTone(440, 'triangle', 0.1, 0.1);
      setTimeout(() => this.playTone(554, 'triangle', 0.1, 0.1), 100); // C#
      setTimeout(() => this.playTone(659, 'triangle', 0.4, 0.1), 200); // E
  }

  public playFailure() {
      this.playTone(150, 'sawtooth', 0.3, 0.1);
      setTimeout(() => this.playTone(100, 'sawtooth', 0.5, 0.1), 150);
  }
  
  public playScan() {
     // Digital "Scanning" Sequence
     if (this.isMuted) return;
     this.init();
     if(!this.ctx) return;
     
     const now = this.ctx.currentTime;
     const count = 12;
     
     for(let i=0; i<count; i++) {
         const osc = this.ctx.createOscillator();
         const gain = this.ctx.createGain();
         
         osc.type = 'square';
         // Rapid random frequencies
         osc.frequency.value = 400 + Math.random() * 1200;
         
         osc.connect(gain);
         gain.connect(this.ctx.destination);
         
         const startTime = now + (i * 0.08);
         const duration = 0.05;

         gain.gain.setValueAtTime(0.05, startTime);
         gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
         
         osc.start(startTime);
         osc.stop(startTime + duration);
     }
  }
}

export const audioManager = new AudioService();
