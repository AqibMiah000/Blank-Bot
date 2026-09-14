/**
 * High-pitched crisp checkout success chime synthesizer
 * Generates a clean, pleasant Apple Pay / high-tech confirmation tone
 * using the Web Audio API without needing external sound files.
 */
export function playHighPitchedChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // High-pitched crystal chord: C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1567.98Hz) -> C7 (2093Hz)
    const tones = [
      { freq: 1174.66, delay: 0.00, duration: 0.18 }, // D6
      { freq: 1479.98, delay: 0.07, duration: 0.22 }, // F#6
      { freq: 1760.00, delay: 0.14, duration: 0.25 }, // A6
      { freq: 2349.32, delay: 0.21, duration: 0.38 }, // D7 high resolution bell
    ];

    const now = ctx.currentTime;

    tones.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave with subtle harmonics for a clean bell sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      // Volume envelope: instant sharp attack + smooth exponential decay
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.3, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    });
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
  }
}

/**
 * Distinctive rapid double-blip sonar synthesizer for Freebies & Deals sniper
 * Provides an instant, identifiable sound cue when a glitch or restock is caught
 * without confusing it with a completed checkout.
 */
export function playFreebieSniperChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Fast futuristic cyber blip: high dual harmonic ping
    const pings = [
      { freq: 1760.00, delay: 0.00, duration: 0.09 }, // A6
      { freq: 2637.02, delay: 0.08, duration: 0.16 }, // E7
    ];

    pings.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Crisp electronic tone
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.25, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    });
  } catch (err) {
    console.warn('Freebie chime error:', err);
  }
}

