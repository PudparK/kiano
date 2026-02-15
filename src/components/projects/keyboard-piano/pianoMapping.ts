export const KEY_TO_NOTE = {
  a: 'C4',
  s: 'D4',
  d: 'E4',
  f: 'F4',
  g: 'G4',
  h: 'A4',
  j: 'B4',
  k: 'C5',
} as const

export const NOTE_ORDER = [
  'C4',
  'D4',
  'E4',
  'F4',
  'G4',
  'A4',
  'B4',
  'C5',
] as const

type NoteName = `${'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'}${'' | '#'}${number}`

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
}

export const PIANO_KEY_TO_MIDI: Record<string, number> = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  k: 72,
  o: 73,
  l: 74,
  p: 75,
  ';': 76,
}

export function keyToNoteName(key: string) {
  return KEY_TO_NOTE[key.toLowerCase() as keyof typeof KEY_TO_NOTE] ?? null
}

export function noteNameToMidi(note: NoteName) {
  const match = note.match(/^([A-G]#?)(-?\d+)$/)
  if (!match) return null
  const pitchClass = match[1]
  const octave = Number(match[2])
  const semitone = NOTE_TO_SEMITONE[pitchClass]
  if (semitone == null || Number.isNaN(octave)) return null
  return (octave + 1) * 12 + semitone
}

export function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}
