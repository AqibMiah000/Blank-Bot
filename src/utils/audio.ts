import { SoundPackId } from '../types';

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** 1. Refract Cyan: High-pitched crystal chord */
export function playRefractCyanChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const tones = [
    { freq: 1174.66, delay: 0.00, duration: 0.18 }, // D6
    { freq: 1479.98, delay: 0.07, duration: 0.22 }, // F#6
    { freq: 1760.00, delay: 0.14, duration: 0.25 }, // A6
    { freq: 2349.32, delay: 0.21, duration: 0.38 }, // D7 high bell
  ];
  tones.forEach(({ freq, delay, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    gain.gain.setValueAtTime(0.001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.3, now + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + duration);
  });
}

/** 2. Laser Ping: High-voltage futuristic electronic ping */
export function playLaserPing() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(3200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

/** 3. Retro Arcade: 8-bit level-up chord */
export function playRetroArcade() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
    gain.gain.setValueAtTime(0.12, now + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.12);
  });
}

/** 4. Sub Thud: Cinematic low-end impact with soft top transient */
export function playSubThud() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

/** 5. Mechanical Click: Clean haptic sound */
export function playMechanicalClick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** Master Sound Pack Player */
export function playCheckoutSound(pack: SoundPackId = 'refract_cyan') {
  if (pack === 'mute') return;
  switch (pack) {
    case 'laser_ping':
      return playLaserPing();
    case 'retro_arcade':
      return playRetroArcade();
    case 'sub_thud':
      return playSubThud();
    case 'mechanical_click':
      return playMechanicalClick();
    case 'refract_cyan':
    default:
      return playRefractCyanChime();
  }
}

export const playHighPitchedChime = playRefractCyanChime;

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

