"use client";

/**
 * A generated ambient drone (no audio files): two detuned low sines and a soft
 * triangle through a slowly breathing low-pass filter, plus a whisper of noise.
 * Also provides a tiny UI "tick" for hovers.
 */
class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ui: GainNode | null = null;
  private started = false;

  private build() {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = 6;
    filter.connect(master);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const voices: [OscillatorType, number, number][] = [
      ["sine", 55, 0.32],
      ["sine", 82.41, 0.18],
      ["triangle", 110.3, 0.07],
      ["sine", 164.8, 0.035],
    ];
    for (const [type, freq, gain] of voices) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 12;
      g.gain.value = gain;
      osc.connect(g).connect(filter);
      osc.start();
    }

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = 0.985 * last + 0.015 * (Math.random() * 2 - 1);
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start();

    const ui = ctx.createGain();
    ui.gain.value = 0.05;
    ui.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.ui = ui;
  }

  async setEnabled(on: boolean) {
    if (on && !this.started) {
      this.build();
      this.started = true;
    }
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    if (on) {
      if (ctx.state === "suspended") await ctx.resume();
      master.gain.linearRampToValueAtTime(0.16, now + 2.2);
    } else {
      master.gain.linearRampToValueAtTime(0, now + 0.6);
      window.setTimeout(() => {
        if (master.gain.value < 0.001) void ctx.suspend();
      }, 700);
    }
  }

  tick(freq = 2400) {
    const ctx = this.ctx;
    const ui = this.ui;
    if (!ctx || !ui || ctx.state !== "running") return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.06);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.5, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(g).connect(ui);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const ambient = new AmbientEngine();
