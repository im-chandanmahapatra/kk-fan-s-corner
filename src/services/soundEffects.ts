/**
 * Web Audio API synthesized retro sound effects.
 * Produces zero-latency, realistic mechanical clicks, cassette latches, and analog tape hiss
 * without requiring external media assets.
 */

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private tapeHissSource: AudioBufferSourceNode | null = null;
  private tapeHissGain: GainNode | null = null;
  private isHissRunning = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Mechanical Walkman "Ka-Chunk" latch sound when pressing Play or Pause.
   * Simulates heavy spring latch release + metallic lever impact.
   */
  public playMechanicalClick(isStop = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Heavy low-frequency thud (solenoid / mechanical spring release)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = isStop ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isStop ? 180 : 120, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);

    // 2. High metallic click (plastic/metal lever snapping into gear)
    const bufferSize = ctx.sampleRate * 0.04;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isStop ? 3200 : 2600, now);
    filter.Q.setValueAtTime(4.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now + 0.01);

    // 3. Secondary tiny spring bounce click ~25ms later
    const bounceOsc = ctx.createOscillator();
    const bounceGain = ctx.createGain();
    bounceOsc.type = 'sine';
    bounceOsc.frequency.setValueAtTime(800, now + 0.028);
    bounceOsc.frequency.exponentialRampToValueAtTime(300, now + 0.055);

    bounceGain.gain.setValueAtTime(0.15, now + 0.028);
    bounceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    bounceOsc.connect(bounceGain);
    bounceGain.connect(ctx.destination);

    bounceOsc.start(now + 0.028);
    bounceOsc.stop(now + 0.065);
  }

  /**
   * High-speed gear ratchet sound for Fast-Forward or Rewind
   */
  public playGearRatchet() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const clickTime = now + i * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1400 + i * 150, clickTime);

      gain.gain.setValueAtTime(0.12, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.025);
    }
  }

  /**
   * Continuous vintage analog tape hiss (brown/pink noise through high-pass filter)
   */
  public setTapeHiss(enabled: boolean, volume = 0.03) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!enabled) {
      if (this.tapeHissGain) {
        this.tapeHissGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
        setTimeout(() => {
          if (!this.isHissRunning && this.tapeHissSource) {
            try {
              this.tapeHissSource.stop();
              this.tapeHissSource.disconnect();
            } catch {
              // ignore
            }
            this.tapeHissSource = null;
          }
        }, 300);
      }
      this.isHissRunning = false;
      return;
    }

    if (this.isHissRunning) {
      if (this.tapeHissGain) {
        this.tapeHissGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
      }
      return;
    }

    // Generate 3 seconds of looped organic tape texture
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Gentle 1-pole filter to simulate pinkish magnetic tape hiss
      lastOut = lastOut * 0.95 + white * 0.05;
      data[i] = lastOut;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to eliminate aggressive lows and high harshness
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 500;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4500;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.3);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);

    source.start();

    this.tapeHissSource = source;
    this.tapeHissGain = gain;
    this.isHissRunning = true;
  }
}

export const soundEffects = new SoundEffectsService();
