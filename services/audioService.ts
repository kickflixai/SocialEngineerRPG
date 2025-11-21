
class AudioService {
  private ctx: AudioContext | null = null;
  private bgmNodes: { osc1: OscillatorNode, osc2: OscillatorNode, gain: GainNode } | null = null;
  private hackingNodes: AudioNode[] = [];
  private scanNodes: AudioNode[] = [];
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

    gain.gain.value = 0.015; // Extremely quiet background

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
      if (this.hackingNodes.length > 0 || this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.value = 0.03; // Quiet enough to chat over
      masterGain.connect(this.ctx.destination);

      // Layer 1: Deep Triangle Drone (cleaner than saw)
      const drone = this.ctx.createOscillator();
      drone.type = 'triangle'; 
      drone.frequency.value = 50; 
      const droneGain = this.ctx.createGain();
      droneGain.gain.value = 0.4;
      drone.connect(droneGain);
      droneGain.connect(masterGain);

      // Layer 2: Rhythmic Tech Pulse (Filtered Noise Simulation)
      const arpCarrier = this.ctx.createOscillator();
      arpCarrier.type = 'sawtooth';
      arpCarrier.frequency.value = 100; // Base freq
      
      const arpFilter = this.ctx.createBiquadFilter();
      arpFilter.type = 'lowpass';
      arpFilter.frequency.value = 200;
      arpFilter.Q.value = 5;

      // LFO to open/close filter rhythmically
      const lfo = this.ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 4; // 4Hz rhythm
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 500; // Filter sweep depth

      lfo.connect(lfoGain);
      lfoGain.connect(arpFilter.frequency);

      arpCarrier.connect(arpFilter);
      arpFilter.connect(masterGain);

      drone.start();
      arpCarrier.start();
      lfo.start();

      this.hackingNodes = [drone, droneGain, arpCarrier, arpFilter, lfo, lfoGain, masterGain];
  }

  public stopHackingTheme() {
      this.hackingNodes.forEach(node => {
          if (node instanceof OscillatorNode) node.stop();
          node.disconnect();
      });
      this.hackingNodes = [];
  }

  public startScanLoop() {
      if (this.scanNodes.length > 0 || this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      // Sci-Fi Data Stream Sound
      const masterGain = this.ctx.createGain();
      masterGain.gain.value = 0.015; // Very subtle
      masterGain.connect(this.ctx.destination);

      const carrier = this.ctx.createOscillator();
      carrier.type = 'square';
      carrier.frequency.value = 800; // High pitch data sound

      const modulator = this.ctx.createOscillator();
      modulator.type = 'sawtooth';
      modulator.frequency.value = 12; // Fast modulation

      const modGain = this.ctx.createGain();
      modGain.gain.value = 1000; // Wide frequency sweep

      // Connect Modulator -> Carrier Frequency (FM Synthesis)
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      carrier.connect(masterGain);

      carrier.start();
      modulator.start();

      this.scanNodes = [carrier, modulator, modGain, masterGain];
  }

  public stopScanLoop() {
      this.scanNodes.forEach(node => {
          if (node instanceof OscillatorNode) node.stop();
          node.disconnect();
      });
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
      this.playTone(800, 'square', 0.05, 0.01);
  }

  public playType() {
      // Unused
  }

  public playMessageSent() {
      this.playTone(400, 'sine', 0.1, 0.05);
      setTimeout(() => this.playTone(800, 'sine', 0.2, 0.02), 100);
  }

  public playMessageReceived() {
      this.playTone(1200, 'sine', 0.1, 0.02);
      setTimeout(() => this.playTone(1800, 'sine', 0.3, 0.02), 100);
  }

  public playSuccess() {
      this.playTone(440, 'triangle', 0.1, 0.05);
      setTimeout(() => this.playTone(554, 'triangle', 0.1, 0.05), 100); // C#
      setTimeout(() => this.playTone(659, 'triangle', 0.4, 0.05), 200); // E
  }

  public playFailure() {
      this.playTone(150, 'sawtooth', 0.3, 0.05);
      setTimeout(() => this.playTone(100, 'sawtooth', 0.5, 0.05), 150);
  }
  
  // Deprecated one-shot scan
  public playScan() {
     this.startScanLoop();
     setTimeout(() => this.stopScanLoop(), 2000);
  }
}

export const audioManager = new AudioService();
