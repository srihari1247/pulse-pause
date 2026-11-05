/**
 * PulsePause Ambient Audio Synthesizer
 * Built using native Web Audio API - zero external audio asset dependencies
 * Generates soothing ambient soundscapes and gentle transition chimes
 */

export type AmbientSoundType = 'none' | 'bowls' | 'air' | 'ocean' | 'forest';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentSound: AmbientSoundType = 'none';
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private oscNodes: OscillatorNode[] = [];
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(muted ? 0 : 0.15, this.ctx.currentTime, 0.2);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentSound(): AmbientSoundType {
    return this.currentSound;
  }

  public playSoundscape(type: AmbientSoundType) {
    this.initContext();
    this.stopSoundscape();

    if (type === 'none' || !this.ctx) {
      this.currentSound = 'none';
      return;
    }

    this.currentSound = type;
    const ctx = this.ctx;

    // Master gain for ambient sound
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.gainNode = masterGain;

    if (type === 'bowls') {
      // Harmonic Singing Bowls (Frequencies: 216Hz, 432Hz, 648Hz with subtle slow vibrato)
      const freqs = [216, 432, 648];
      this.oscNodes = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        return osc;
      });
    } else if (type === 'air' || type === 'forest' || type === 'ocean') {
      // Noise buffer for atmospheric wind / air / ocean waves
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter depending on nature
      const filter = ctx.createBiquadFilter();
      if (type === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        // Periodic swell
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec ocean swell
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        this.oscNodes.push(lfo);
      } else if (type === 'forest') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
      } else {
        // Air
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
      }

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
    }
  }

  public stopSoundscape() {
    this.oscNodes.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.oscNodes = [];

    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
    this.currentSound = 'none';
  }

  public playTransitionChime(freq = 432) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.4);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();
