// Petite musique de mariachis composée par le navigateur (Web Audio) :
// trompettes à deux voix, guitares en accords et basse "oum-pa-pa" en 3 temps.
// Mélodie originale en sol majeur, jouée en boucle.

const BPM = 168;
const BEAT = 60 / BPM; // durée d'un temps (noire), en secondes
const EIGHTH = BEAT / 2;

// Gamme de sol majeur, pour harmoniser la 2e trompette une tierce en dessous
const G_MAJOR = [7, 9, 11, 0, 2, 4, 6]; // sol la si do ré mi fa#

const CHORDS: Record<string, { notes: number[]; bass: [number, number] }> = {
  G: { notes: [55, 59, 62], bass: [43, 38] },
  D7: { notes: [54, 57, 60], bass: [38, 45] },
  C: { notes: [55, 60, 64], bass: [36, 43] },
};

// Une mesure = un accord + la mélodie en croches ([note MIDI ou null, durée en croches])
const SONG: { chord: string; melody: [number | null, number][] }[] = [
  { chord: "G", melody: [[74, 2], [71, 1], [74, 1], [79, 2]] },
  { chord: "D7", melody: [[78, 2], [76, 1], [74, 1], [72, 2]] },
  { chord: "D7", melody: [[69, 1], [71, 1], [72, 2], [69, 2]] },
  { chord: "G", melody: [[71, 4], [null, 2]] },
  { chord: "C", melody: [[76, 2], [74, 1], [72, 1], [76, 2]] },
  { chord: "G", melody: [[74, 2], [71, 1], [67, 1], [71, 2]] },
  { chord: "D7", melody: [[69, 1], [72, 1], [78, 2], [76, 2]] },
  { chord: "G", melody: [[79, 4], [null, 2]] },
];

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

const thirdBelow = (midi: number) => {
  const pc = midi % 12;
  const i = G_MAJOR.indexOf(pc);
  if (i === -1) return midi - 3;
  const target = G_MAJOR[(i + 5) % 7]; // 2 degrés plus bas
  let lower = midi - ((pc - target + 12) % 12);
  if (lower === midi) lower -= 12;
  return lower;
};

export type MariachiPlayer = { stop: () => void; setMuted: (muted: boolean) => void };

export const startMariachi = (): MariachiPlayer | null => {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  ctx.resume().catch(() => undefined);
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.4);
  master.connect(ctx.destination);

  // Trompette : dent de scie filtrée, attaque franche et vibrato
  const trumpet = (midi: number, start: number, length: number, level: number) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq(midi);
    const vibrato = ctx.createOscillator();
    const vibratoDepth = ctx.createGain();
    vibrato.frequency.value = 5.5;
    vibratoDepth.gain.value = freq(midi) * 0.006;
    vibrato.connect(vibratoDepth).connect(osc.frequency);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    filter.Q.value = 2;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(level, start + 0.03);
    env.gain.linearRampToValueAtTime(level * 0.7, start + 0.12);
    env.gain.setValueAtTime(level * 0.7, start + length - 0.05);
    env.gain.linearRampToValueAtTime(0, start + length);
    osc.connect(filter).connect(env).connect(master);
    osc.start(start);
    vibrato.start(start);
    osc.stop(start + length + 0.02);
    vibrato.stop(start + length + 0.02);
  };

  // Corde pincée (guitare, guitarrón) : triangle qui s'éteint vite
  const pluck = (midi: number, start: number, length: number, level: number) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq(midi);
    const env = ctx.createGain();
    env.gain.setValueAtTime(level, start);
    env.gain.exponentialRampToValueAtTime(0.001, start + length);
    osc.connect(env).connect(master);
    osc.start(start);
    osc.stop(start + length);
  };

  const scheduleBar = (barIndex: number, start: number) => {
    const bar = SONG[barIndex % SONG.length];
    const chord = CHORDS[bar.chord];
    // Basse sur le 1er temps, accords grattés sur les 2e et 3e temps
    pluck(chord.bass[barIndex % 2], start, BEAT * 0.9, 0.5);
    [1, 2].forEach((beat) =>
      chord.notes.forEach((n, i) => pluck(n, start + beat * BEAT + i * 0.012, BEAT * 0.6, 0.12))
    );
    // Les deux trompettes, en tierces
    let t = start;
    bar.melody.forEach(([note, eighths]) => {
      const length = eighths * EIGHTH;
      if (note !== null) {
        trumpet(note, t, length * 0.92, 0.16);
        trumpet(thirdBelow(note), t, length * 0.92, 0.1);
      }
      t += length;
    });
  };

  // Programme les mesures un peu à l'avance pour un rythme régulier
  const BAR = 3 * BEAT;
  let nextBar = 0;
  let nextTime = ctx.currentTime + 0.1;
  const scheduler = window.setInterval(() => {
    while (nextTime < ctx.currentTime + 0.6) {
      scheduleBar(nextBar, nextTime);
      nextBar += 1;
      nextTime += BAR;
    }
  }, 150);

  let stopped = false;
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      window.clearInterval(scheduler);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      window.setTimeout(() => ctx.close().catch(() => undefined), 400);
    },
    setMuted: (muted: boolean) => {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(muted ? 0 : 0.22, ctx.currentTime, 0.05);
    },
  };
};
