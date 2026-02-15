import * as Tone from 'tone'

let missSynth: Tone.Synth | null = null

function getMissSynth() {
  if (!missSynth) {
    missSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0,
        release: 0.1,
      },
      volume: -12,
    }).toDestination()
  }

  return missSynth
}

export function playMissSound() {
  const synth = getMissSynth()
  const now = Tone.now()
  synth.triggerAttackRelease('G4', '32n', now, 0.75)
  synth.triggerAttackRelease('D4', '32n', now + 0.06, 0.75)
}

export function disposeMissSound() {
  missSynth?.dispose()
  missSynth = null
}
