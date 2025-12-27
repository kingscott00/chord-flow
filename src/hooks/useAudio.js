import { useRef, useEffect, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { fretsToNotes } from '../utils/musicTheory';
import { getScaleNotes } from '../utils/scaleUtils';

// Synth presets for different tones
const SYNTH_PRESETS = {
  acoustic: {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.3,
      release: 1.5
    }
  },
  electric: {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.4,
      release: 0.8
    }
  },
  jazz: {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.05,
      decay: 0.5,
      sustain: 0.4,
      release: 2
    }
  }
};

export function useAudio(settings = {}) {
  const { volume = 70, tone = 'acoustic' } = settings;
  const synthRef = useRef(null);
  const volumeRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize synth
  useEffect(() => {
    // Create volume node
    volumeRef.current = new Tone.Volume(-12).toDestination();

    // Create polyphonic synth
    synthRef.current = new Tone.PolySynth(Tone.Synth, SYNTH_PRESETS[tone] || SYNTH_PRESETS.acoustic);
    synthRef.current.connect(volumeRef.current);

    setIsReady(true);

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (volumeRef.current) {
        volumeRef.current.dispose();
      }
    };
  }, []);

  // Update synth preset when tone changes
  useEffect(() => {
    if (synthRef.current && volumeRef.current) {
      synthRef.current.dispose();
      synthRef.current = new Tone.PolySynth(Tone.Synth, SYNTH_PRESETS[tone] || SYNTH_PRESETS.acoustic);
      synthRef.current.connect(volumeRef.current);
    }
  }, [tone]);

  // Update volume
  useEffect(() => {
    if (volumeRef.current) {
      // Convert 0-100 to dB (roughly -60 to 0)
      const db = volume === 0 ? -Infinity : -60 + (volume / 100) * 60;
      volumeRef.current.volume.value = db;
    }
  }, [volume]);

  // Start audio context (must be called from user interaction)
  const startAudio = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  }, []);

  // Play a chord (strum effect)
  const playChord = useCallback(async (chord, duration = '2n') => {
    if (!synthRef.current || !chord?.frets) return;

    await startAudio();

    const notes = fretsToNotes(chord.frets);
    if (notes.length === 0) return;

    setIsPlaying(true);

    // Strum effect - play notes slightly offset
    const now = Tone.now();
    notes.forEach((note, i) => {
      try {
        synthRef.current.triggerAttackRelease(note, duration, now + i * 0.03);
      } catch (e) {
        console.warn('Failed to play note:', note, e);
      }
    });

    // Reset playing state after duration
    setTimeout(() => setIsPlaying(false), 1500);
  }, [startAudio]);

  // Play an arpeggio (preview)
  const playArpeggio = useCallback(async (chord) => {
    if (!synthRef.current || !chord?.frets) return;

    await startAudio();

    const notes = fretsToNotes(chord.frets);
    if (notes.length === 0) return;

    setIsPlaying(true);

    const now = Tone.now();
    notes.forEach((note, i) => {
      try {
        synthRef.current.triggerAttackRelease(note, '16n', now + i * 0.08);
      } catch (e) {
        console.warn('Failed to play note:', note, e);
      }
    });

    setTimeout(() => setIsPlaying(false), 800);
  }, [startAudio]);

  // Play entire progression
  const playProgression = useCallback(async (chords, tempo = 120) => {
    if (!synthRef.current || chords.length === 0) return;

    await startAudio();

    setIsPlaying(true);

    const beatDuration = 60 / tempo; // Duration of one beat in seconds
    const chordDuration = beatDuration * 2; // Two beats per chord

    const now = Tone.now();

    chords.forEach((chord, chordIndex) => {
      if (!chord?.frets) return;

      const notes = fretsToNotes(chord.frets);
      const chordStartTime = now + chordIndex * chordDuration;

      // Strum each chord
      notes.forEach((note, noteIndex) => {
        try {
          synthRef.current.triggerAttackRelease(
            note,
            beatDuration * 1.8 + 's',
            chordStartTime + noteIndex * 0.02
          );
        } catch (e) {
          console.warn('Failed to play note:', note, e);
        }
      });
    });

    // Reset playing state after all chords
    const totalDuration = chords.length * chordDuration * 1000;
    setTimeout(() => setIsPlaying(false), totalDuration + 500);
  }, [startAudio]);

  // Stop all sounds
  const stopAll = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    setIsPlaying(false);
  }, []);

  // Play a scale ascending
  const playScale = useCallback(async (scaleId, rootNote) => {
    if (!synthRef.current) return;

    await startAudio();

    const scaleNotes = getScaleNotes(scaleId, rootNote);
    if (scaleNotes.length === 0) return;

    setIsPlaying(true);

    // Add octave root at end for complete scale
    const notesWithOctave = [...scaleNotes, scaleNotes[0]];
    const now = Tone.now();
    const noteInterval = 0.4; // 400ms per note

    notesWithOctave.forEach((note, i) => {
      try {
        // Use octave 3 for most notes, octave 4 for the final root
        const octave = (i === notesWithOctave.length - 1) ? 4 : 3;
        synthRef.current.triggerAttackRelease(
          `${note}${octave}`,
          '8n',
          now + i * noteInterval
        );
      } catch (e) {
        console.warn('Failed to play note:', note, e);
      }
    });

    // Reset playing state after all notes
    const totalDuration = notesWithOctave.length * noteInterval * 1000;
    setTimeout(() => setIsPlaying(false), totalDuration + 500);
  }, [startAudio]);

  return {
    isReady,
    isPlaying,
    playChord,
    playArpeggio,
    playProgression,
    playScale,
    stopAll,
    startAudio
  };
}

export default useAudio;
