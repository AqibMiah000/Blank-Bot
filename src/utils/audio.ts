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

/** 6. Cash Register: Coin ring followed by mechanical drawer snap ("Cha-Ching") */
export function playCashRegister() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // High metallic coin harmonics
  [1975.53, 2489.02, 3135.96].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.04);
    gain.gain.setValueAtTime(0.2, now + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.04);
    osc.stop(now + i * 0.04 + 0.35);
  });

  // Mechanical register snap / clunk
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snapOsc.type = 'square';
  snapOsc.frequency.setValueAtTime(380, now + 0.14);
  snapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.24);
  snapGain.gain.setValueAtTime(0.25, now + 0.14);
  snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  snapOsc.connect(snapGain);
  snapGain.connect(ctx.destination);
  snapOsc.start(now + 0.14);
  snapOsc.stop(now + 0.28);
}

/** 7. Synthwave Arp: 80s Neon Cascading Major Triad */
export function playSynthwaveArp() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major arpeggio
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);
    gain.gain.setValueAtTime(0.12, now + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.25);
  });
}

/** 8. Victory Fanfare: Triumphant brass sequence */
export function playVictoryFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const chords = [
    { freq: 523.25, delay: 0.00, dur: 0.10 }, // C5
    { freq: 659.25, delay: 0.10, dur: 0.10 }, // E5
    { freq: 783.99, delay: 0.20, dur: 0.10 }, // G5
    { freq: 1046.50, delay: 0.30, dur: 0.45 }, // C6 grand sustain
  ];
  chords.forEach(({ freq, delay, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + delay);
    gain.gain.setValueAtTime(0.24, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + dur);
  });
}

/** 9. Cyber Chime: High ethereal dual crystal ping */
export function playCyberChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const pings = [
    { freq: 1567.98, delay: 0.00, dur: 0.28 }, // G6
    { freq: 2093.00, delay: 0.08, dur: 0.45 }, // C7
  ];
  pings.forEach(({ freq, delay, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    gain.gain.setValueAtTime(0.28, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + dur);
  });
}

/** 10. Sub Bass Drop: Deep 808 club frequency sweep */
export function playSubBassDrop() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.45);
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

/** 11. Minimal Pop: Clean, crisp UI bubble pop */
export function playMinimalPop() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(950, now + 0.04);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
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
    case 'cash_register':
      return playCashRegister();
    case 'synthwave_arp':
      return playSynthwaveArp();
    case 'victory_fanfare':
      return playVictoryFanfare();
    case 'cyber_chime':
      return playCyberChime();
    case 'sub_bass_drop':
      return playSubBassDrop();
    case 'minimal_pop':
      return playMinimalPop();
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

