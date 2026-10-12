let audioCtx: AudioContext | null = null;
let ringtoneInterval: number | null = null;
let activeRingtoneGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a discrete, gentle Apple-style alert chime (soft sine wave ping).
 */
export function playSoftAlertChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First soft chime note (523Hz - C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second soft resonance note (783Hz - G5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.08);

    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.warn('Audio chime note:', err);
  }
}

/**
 * Plays an authentic, gentle Apple iPhone-style ringtone pattern.
 * Recurring soft marimba chimes until answered or declined.
 */
export function playAppleRingtone(): void {
  stopAppleRingtone();

  try {
    const ctx = getAudioContext();

    const playChimePattern = () => {
      if (!ctx || ctx.state === 'closed') return;
      const now = ctx.currentTime;

      // Master gain for ringtone
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.15, now);
      masterGain.connect(ctx.destination);
      activeRingtoneGain = masterGain;

      // Apple Marimba inspired cadence: D5 -> G5 -> A5 -> D6
      const notes = [
        { freq: 587.33, start: 0.00, dur: 0.18 }, // D5
        { freq: 783.99, start: 0.16, dur: 0.20 }, // G5
        { freq: 880.00, start: 0.34, dur: 0.22 }, // A5
        { freq: 1174.66, start: 0.52, dur: 0.35 }, // D6
      ];

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle'; // Warmer, bell-like timbre
        osc.frequency.setValueAtTime(freq, now + start);

        noteGain.gain.setValueAtTime(0.001, now + start);
        noteGain.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    };

    playChimePattern();
    ringtoneInterval = window.setInterval(playChimePattern, 2400);
  } catch (err) {
    console.warn('Ringtone playback error:', err);
  }
}

/**
 * Stop ringtone immediately
 */
export function stopAppleRingtone(): void {
  if (ringtoneInterval !== null) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if (activeRingtoneGain) {
    try {
      activeRingtoneGain.gain.setValueAtTime(0.001, getAudioContext().currentTime);
      activeRingtoneGain.disconnect();
    } catch {
      // ignore
    }
    activeRingtoneGain = null;
  }
}

export function stopEmergencySiren(): void {
  stopAppleRingtone();
}
