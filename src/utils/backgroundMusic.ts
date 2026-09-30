/**
 * Procedural ambient background music generator using Web Audio API.
 * Produces a warm, generative, relaxing ambient soundscape ideal for puzzle concentration.
 * Zero external audio assets or network downloads required.
 */

class BackgroundMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private targetVolume: number = 0.4;
  private intervalId: number | null = null;
  private chordIndex: number = 0;

  // Chord progression (Frequencies in Hz) - Relaxing Lofi / Zen ambient chords
  // Chord 1: Fmaj9, Chord 2: Dm9, Chord 3: Bbmaj7, Chord 4: Csus4 / C9
  private readonly chords: number[][] = [
    // Fmaj9: F2 (87.31), C3 (130.81), E3 (164.81), A3 (220.0), G4 (392.0)
    [87.31, 130.81, 164.81, 220.0, 392.0],
    // Dm9: D2 (73.42), A2 (110.0), C3 (130.81), F3 (174.61), E4 (329.63)
    [73.42, 110.0, 130.81, 174.61, 329.63],
    // Bbmaj7: Bb1 (58.27), F2 (87.31), A2 (110.0), D3 (146.83), C4 (261.63)
    [58.27, 87.31, 110.0, 146.83, 261.63],
    // C9sus4: C2 (65.41), G2 (98.0), D3 (146.83), F3 (174.61), A3 (220.0)
    [65.41, 98.0, 146.83, 174.61, 220.0],
  ];

  // Pentatonic melody notes (Hz)
  private readonly melodyScale: number[] = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ];

  private activeNodes: { oscs: OscillatorNode[]; gain: GainNode }[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupAudioGraph();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private setupAudioGraph() {
    if (!this.ctx) return;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    // Warm Low-pass filter to keep sound gentle and non-fatiguing
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(750, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Ambient delay / reverb effect
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.45, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.35, this.ctx.currentTime);

    // Wiring
    // Sources -> Filter -> MasterGain -> Destination
    //                   -> DelayNode -> DelayFeedback -> DelayNode
    //                                -> MasterGain
    this.filter.connect(this.masterGain);
    this.filter.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);
  }

  public setVolume(vol: number) {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && this.isRunning && !this.isPaused) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume * 0.25, now + 0.3);
    }
  }

  public start(volume: number = 0.4) {
    this.targetVolume = volume;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.isRunning) {
      if (this.isPaused) {
        this.resume();
      }
      return;
    }

    this.isRunning = true;
    this.isPaused = false;

    // Fade in master gain smoothly
    const now = ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume * 0.25, now + 2.0);
    }

    // Play first chord immediately
    this.playNextChord();

    // Trigger chord progression every 7 seconds
    this.intervalId = window.setInterval(() => {
      if (this.isRunning && !this.isPaused) {
        this.playNextChord();
      }
    }, 7000);
  }

  private playNextChord() {
    const ctx = this.getContext();
    if (!ctx || !this.filter) return;

    const chord = this.chords[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    const now = ctx.currentTime;
    const chordDuration = 7.5;

    // Create pad gain with soft swell
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.001, now);
    padGain.gain.linearRampToValueAtTime(0.18, now + 2.0);
    padGain.gain.setValueAtTime(0.18, now + chordDuration - 2.5);
    padGain.gain.linearRampToValueAtTime(0.001, now + chordDuration);
    padGain.connect(this.filter);

    const oscs: OscillatorNode[] = [];

    // Synthesize notes in the chord
    chord.forEach((freq, idx) => {
      // Main oscillator
      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Slight detune for warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);

      osc.connect(padGain);
      osc.start(now);
      osc.stop(now + chordDuration);
      oscs.push(osc);
    });

    this.activeNodes.push({ oscs, gain: padGain });

    // Clean up expired nodes
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter((n) => n.gain !== padGain);
    }, (chordDuration + 0.5) * 1000);

    // Schedule 2-3 gentle bell chimes over the chord duration
    this.scheduleChimes(now, chordDuration);
  }

  private scheduleChimes(startTime: number, duration: number) {
    const ctx = this.getContext();
    if (!ctx || !this.filter) return;

    const numChimes = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numChimes; i++) {
      const chimeDelay = 1.2 + Math.random() * (duration - 3.0);
      const chimeTime = startTime + chimeDelay;

      const freq = this.melodyScale[Math.floor(Math.random() * this.melodyScale.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chimeTime);

      // Bell envelope: instant soft ping, long gentle decay
      gain.gain.setValueAtTime(0.001, chimeTime);
      gain.gain.linearRampToValueAtTime(0.07, chimeTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 2.2);

      osc.connect(gain);
      gain.connect(this.filter);

      osc.start(chimeTime);
      osc.stop(chimeTime + 2.3);
    }
  }

  public pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
    }
  }

  public resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume * 0.25, now + 1.0);
    }
  }

  public stop() {
    if (!this.isRunning) return;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + 1.0);
    }

    setTimeout(() => {
      this.activeNodes.forEach(({ oscs, gain }) => {
        try {
          oscs.forEach((o) => o.stop());
          gain.disconnect();
        } catch {}
      });
      this.activeNodes = [];
      this.isRunning = false;
      this.isPaused = false;
    }, 1100);
  }

  public getIsPlaying(): boolean {
    return this.isRunning && !this.isPaused;
  }
}

export const backgroundMusic = new BackgroundMusicEngine();
