import * as Tone from 'tone'

let successSynth: Tone.Synth | null = null

function getSuccessSynth() {
  if (!successSynth) {
    successSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.1,
      },
      volume: -12,
    }).toDestination()
  }

  return successSynth
}

export function playSuccessSound() {
  const synth = getSuccessSynth()
  const now = Tone.now()
  synth.triggerAttackRelease('C5', '32n', now, 0.75)
  synth.triggerAttackRelease('E5', '32n', now + 0.08, 0.75)
}

export function disposeSuccessSound() {
  successSynth?.dispose()
  successSynth = null
}
