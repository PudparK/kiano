'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Field,
  Label,
  Popover,
  PopoverButton,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
} from '@headlessui/react'
import * as Tone from 'tone'
import AboutModal from '@/components/projects/keyboard-piano/AboutModal'

const KEY_TO_MIDI: Record<string, number> = {
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

const WHITE_KEYS = [
  { physicalKey: 'a', note: 'C' },
  { physicalKey: 's', note: 'D' },
  { physicalKey: 'd', note: 'E' },
  { physicalKey: 'f', note: 'F' },
  { physicalKey: 'g', note: 'G' },
  { physicalKey: 'h', note: 'A' },
  { physicalKey: 'j', note: 'B' },
  { physicalKey: 'k', note: 'C' },
  { physicalKey: 'l', note: 'D' },
  { physicalKey: ';', note: 'E' },
] as const

const BLACK_KEYS = [
  { physicalKey: 'w', note: 'C#', leftClass: 'left-[calc(10%-3.125%)]' },
  { physicalKey: 'e', note: 'D#', leftClass: 'left-[calc(20%-3.125%)]' },
  { physicalKey: 't', note: 'F#', leftClass: 'left-[calc(40%-3.125%)]' },
  { physicalKey: 'y', note: 'G#', leftClass: 'left-[calc(50%-3.125%)]' },
  { physicalKey: 'u', note: 'A#', leftClass: 'left-[calc(60%-3.125%)]' },
  { physicalKey: 'o', note: 'C#', leftClass: 'left-[calc(80%-3.125%)]' },
  { physicalKey: 'p', note: 'D#', leftClass: 'left-[calc(90%-3.125%)]' },
] as const

const WAVEFORMS = ['piano', 'sine', 'triangle'] as const
type Waveform = (typeof WAVEFORMS)[number]
const SETTINGS_STORAGE_KEY = 'keyboard-piano-settings-v1'
type InstrumentKind = 'sampler' | 'synth'
const toSynthWaveform = (waveform: Waveform): 'sine' | 'triangle' =>
  waveform === 'piano' ? 'sine' : waveform

type PianoKeyProps = {
  note: string
  keyboardKey: string
  showKeyboardKey: boolean
  down: boolean
  black?: boolean
  onDown: (physicalKey: string) => Promise<void>
  onUp: (physicalKey: string) => void
  physicalKey: string
  className: string
}

function PianoKey({
  note,
  keyboardKey,
  showKeyboardKey,
  physicalKey,
  down,
  black,
  onDown,
  onUp,
  className,
}: PianoKeyProps) {
  const downStyles = black
    ? 'bg-zinc-700 shadow-[0_0_18px_rgba(103,194,160,0.35)] ring-1 ring-zinc-200/20'
    : 'bg-zinc-300 ring-1 ring-zinc-500/35 dark:bg-zinc-300 dark:ring-zinc-500/35'

  return (
    <button
      type="button"
      onPointerDown={async (e) => {
        e.preventDefault()
        await onDown(physicalKey)
      }}
      onPointerUp={(e) => {
        e.preventDefault()
        onUp(physicalKey)
      }}
      onPointerCancel={() => onUp(physicalKey)}
      onPointerLeave={() => onUp(physicalKey)}
      className={[className, down ? downStyles : ''].join(' ')}
      title={`Key "${physicalKey}"`}
    >
      <span
        className={[
          'pointer-events-none absolute right-2 text-base font-semibold tracking-tight',
          showKeyboardKey ? 'bottom-4' : 'bottom-1',
          black ? 'text-zinc-100' : 'text-zinc-700',
        ].join(' ')}
      >
        {note}
      </span>
      {showKeyboardKey ? (
        <span
          className={[
            'pointer-events-none absolute font-mono text-[10px] opacity-45',
            black ? 'right-1.5 bottom-1' : 'right-2 bottom-1',
            black ? 'text-zinc-100' : 'text-zinc-600',
          ].join(' ')}
        >
          {keyboardKey}
        </span>
      ) : null}
    </button>
  )
}

export default function KeyboardPiano() {
  const synthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null)
  const pianoSamplerRef = useRef<Tone.Sampler | null>(null)
  const gainRef = useRef<Tone.Gain | null>(null)
  const activeNotesRef = useRef<Map<string, { midi: number; instrument: InstrumentKind }>>(
    new Map(),
  )
  const octaveShiftRef = useRef(0)
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null)

  const [isAudioReady, setIsAudioReady] = useState(false)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set())
  const [octaveShift, setOctaveShift] = useState(0)
  const [volume, setVolume] = useState(0.2)
  const [waveform, setWaveform] = useState<Waveform>('piano')
  const [showKeyboardKeys, setShowKeyboardKeys] = useState(true)
  const [isPianoLoaded, setIsPianoLoaded] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const settingsLoadedRef = useRef(false)

  const ensureAudio = useCallback(async () => {
    await Tone.start()

    if (!gainRef.current) {
      const gain = new Tone.Gain(volume).toDestination()
      gainRef.current = gain
    }

    if (!synthRef.current && gainRef.current) {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: toSynthWaveform(waveform) },
        envelope: {
          attack: 0.005,
          decay: 0.15,
          sustain: 0.35,
          release: 1.2,
        },
      }).connect(gainRef.current)
      synthRef.current = synth
    }

    if (!pianoSamplerRef.current && gainRef.current) {
      const sampler = new Tone.Sampler({
        urls: {
          A0: 'A0.mp3',
          C1: 'C1.mp3',
          'D#1': 'Ds1.mp3',
          'F#1': 'Fs1.mp3',
          A1: 'A1.mp3',
          C2: 'C2.mp3',
          'D#2': 'Ds2.mp3',
          'F#2': 'Fs2.mp3',
          A2: 'A2.mp3',
          C3: 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          A3: 'A3.mp3',
          C4: 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
          C5: 'C5.mp3',
          'D#5': 'Ds5.mp3',
          'F#5': 'Fs5.mp3',
          A5: 'A5.mp3',
          C6: 'C6.mp3',
          'D#6': 'Ds6.mp3',
          'F#6': 'Fs6.mp3',
          A6: 'A6.mp3',
          C7: 'C7.mp3',
          'D#7': 'Ds7.mp3',
          'F#7': 'Fs7.mp3',
          A7: 'A7.mp3',
          C8: 'C8.mp3',
        },
        release: 1.2,
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        onload: () => setIsPianoLoaded(true),
      }).connect(gainRef.current)

      pianoSamplerRef.current = sampler
      sampler.onerror = () => setIsPianoLoaded(false)
    } else {
      gainRef.current.gain.rampTo(volume, 0.02)
      synthRef.current?.set({ oscillator: { type: toSynthWaveform(waveform) } })
    }

    setIsAudioReady(true)
  }, [volume, waveform])

  const setMasterVolume = useCallback((nextVolume: number) => {
    setVolume(nextVolume)
    if (gainRef.current) {
      gainRef.current.gain.rampTo(nextVolume, 0.02)
    }
  }, [])

  const noteOn = useCallback(async (physicalKey: string) => {
    const baseMidi = KEY_TO_MIDI[physicalKey]
    if (baseMidi == null) return
    if (activeNotesRef.current.has(physicalKey)) return

    await ensureAudio()
    const useSampler = waveform === 'piano' && pianoSamplerRef.current?.loaded === true
    const instrument = useSampler ? pianoSamplerRef.current : synthRef.current
    if (!instrument) return

    const midi = baseMidi + octaveShiftRef.current * 12
    const note = Tone.Frequency(midi, 'midi').toNote()
    instrument.triggerAttack(note)
    activeNotesRef.current.set(physicalKey, {
      midi,
      instrument: useSampler ? 'sampler' : 'synth',
    })

    setPressedKeys((prev) => {
      const next = new Set(prev)
      next.add(physicalKey)
      return next
    })
  }, [ensureAudio, waveform])

  const noteOff = useCallback((physicalKey: string) => {
    const activeNote = activeNotesRef.current.get(physicalKey)
    if (!activeNote) return

    const note = Tone.Frequency(activeNote.midi, 'midi').toNote()
    if (activeNote.instrument === 'sampler' && pianoSamplerRef.current) {
      pianoSamplerRef.current.triggerRelease(note)
    } else {
      synthRef.current?.triggerRelease(note)
    }
    activeNotesRef.current.delete(physicalKey)

    setPressedKeys((prev) => {
      const next = new Set(prev)
      next.delete(physicalKey)
      return next
    })
  }, [])

  const stopAll = useCallback(() => {
    for (const activeNote of activeNotesRef.current.values()) {
      const note = Tone.Frequency(activeNote.midi, 'midi').toNote()
      if (activeNote.instrument === 'sampler' && pianoSamplerRef.current) {
        pianoSamplerRef.current.triggerRelease(note)
      } else {
        synthRef.current?.triggerRelease(note)
      }
    }
    activeNotesRef.current.clear()
    setPressedKeys(new Set())
  }, [])

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({ oscillator: { type: toSynthWaveform(waveform) } })
    }
  }, [waveform])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (!raw) {
        settingsLoadedRef.current = true
        return
      }

      const parsed = JSON.parse(raw) as {
        waveform?: Waveform
        volume?: number
        showKeyboardKeys?: boolean
      }

      if (
        parsed.waveform &&
        (WAVEFORMS as readonly string[]).includes(parsed.waveform)
      ) {
        setWaveform(parsed.waveform)
      }
      if (typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1) {
        setMasterVolume(parsed.volume)
      }
      if (typeof parsed.showKeyboardKeys === 'boolean') {
        setShowKeyboardKeys(parsed.showKeyboardKeys)
      }
    } catch {
      // ignore invalid localStorage state
    } finally {
      settingsLoadedRef.current = true
    }
  }, [setMasterVolume])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!settingsLoadedRef.current) return
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          waveform,
          volume,
          showKeyboardKeys,
        }),
      )
    } catch {
      // ignore storage write errors
    }
  }, [waveform, volume, showKeyboardKeys])

  useEffect(() => {
    const onShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        settingsButtonRef.current?.click()
      }
    }

    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [])

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return
      }

      const key = e.key.toLowerCase()

      if (key === 'z') {
        e.preventDefault()
        setOctaveShift((prev) => {
          const next = Math.max(-2, prev - 1)
          octaveShiftRef.current = next
          return next
        })
        return
      }

      if (key === 'x') {
        e.preventDefault()
        setOctaveShift((prev) => {
          const next = Math.min(2, prev + 1)
          octaveShiftRef.current = next
          return next
        })
        return
      }

      if (KEY_TO_MIDI[key] != null) {
        e.preventDefault()
        await noteOn(key)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (KEY_TO_MIDI[key] != null) {
        e.preventDefault()
        noteOff(key)
      }
    }

    const onBlur = () => stopAll()
    const onVisibility = () => {
      if (document.hidden) stopAll()
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp, { passive: false })
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      stopAll()
      synthRef.current?.dispose()
      pianoSamplerRef.current?.dispose()
      gainRef.current?.dispose()
      synthRef.current = null
      pianoSamplerRef.current = null
      gainRef.current = null
    }
  }, [noteOff, noteOn, stopAll])

  return (
    <div className="mx-auto mb-16 w-full max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {isAudioReady ? (
          <div className="flex items-center gap-2 rounded-md border border-transparent bg-green-500/10 px-3 py-2 text-sm text-green-400 ring-1 ring-green-400/30">
            Ready
          </div>
        ) : (
          <button
            type="button"
            onClick={ensureAudio}
            className="cursor-pointer rounded-md border border-transparent bg-[#67c2a0] px-3 py-2 text-white transition hover:bg-[#5db596]"
          >
            Click to play
          </button>
        )}

        <div className="text-sm">
          Octave: <span className="font-mono">{octaveShift}</span>{' '}
          <span className="text-neutral-500">(Z/X)</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="cursor-pointer rounded-md border border-transparent bg-zinc-200 px-3 py-2 text-zinc-700 transition hover:bg-zinc-300 dark:bg-neutral-900/70 dark:text-neutral-200 dark:ring-1 dark:ring-white/10 dark:hover:bg-neutral-900/85"
          >
            About
          </button>

          <Popover className="relative">
            <PopoverButton
              ref={settingsButtonRef}
              className="cursor-pointer rounded-md border border-transparent bg-zinc-200 px-3 py-2 text-zinc-700 transition hover:bg-zinc-300 dark:bg-neutral-900/70 dark:text-neutral-200 dark:ring-1 dark:ring-white/10 dark:hover:bg-neutral-900/85"
            >
              Settings
            </PopoverButton>
            <PopoverPanel
              anchor="bottom end"
              className="z-30 mt-2 w-72 max-sm:w-[calc(100vw-2rem)] space-y-4 rounded-2xl bg-zinc-50 p-4 shadow-lg ring-1 ring-zinc-900/10 dark:bg-[#131313] dark:ring-white/10"
            >
              <Field className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-zinc-500 dark:text-neutral-400">
                    Volume
                  </Label>
                  <span className="text-xs text-zinc-500 dark:text-neutral-500">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="w-full accent-[#67c2a0]"
                  aria-label="Fine tune volume"
                />
              </Field>

              <Field className="space-y-2">
                <Label className="text-sm font-medium text-zinc-500 dark:text-neutral-400">
                  Waveform
                </Label>
                <TabGroup
                  selectedIndex={WAVEFORMS.indexOf(waveform)}
                  onChange={(index) => setWaveform(WAVEFORMS[index] ?? 'sine')}
                >
                  <TabList className="flex flex-wrap gap-2">
                    {WAVEFORMS.map((shape) => (
                      <Tab
                        key={shape}
                        className="rounded-full bg-zinc-200 px-3 py-1.5 text-sm text-zinc-700 capitalize transition hover:bg-zinc-300 focus:outline-none data-selected:bg-[#67c2a0] data-selected:text-white dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:data-selected:bg-[#67c2a0] dark:data-selected:text-white"
                      >
                        {shape}
                      </Tab>
                    ))}
                  </TabList>
                </TabGroup>
              </Field>

              <Field className="space-y-2">
                <Label className="text-sm font-medium text-zinc-500 dark:text-neutral-400">
                  Key labels
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyboardKeys(true)}
                    className={[
                      'rounded-full px-3 py-1.5 text-sm transition',
                      showKeyboardKeys
                        ? 'bg-[#67c2a0] text-white'
                        : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10',
                    ].join(' ')}
                    aria-pressed={showKeyboardKeys}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKeyboardKeys(false)}
                    className={[
                      'rounded-full px-3 py-1.5 text-sm transition',
                      !showKeyboardKeys
                        ? 'bg-[#67c2a0] text-white'
                        : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10',
                    ].join(' ')}
                    aria-pressed={!showKeyboardKeys}
                  >
                    Off
                  </button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-neutral-500">
                  Show key labels on keys.
                </p>
              </Field>
            </PopoverPanel>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <div className="pb-2">
          <div className="relative w-full rounded-xl bg-zinc-200/80 p-3 shadow-inner dark:bg-zinc-800">
            <div className="relative">
              <div className="grid grid-cols-10">
                {WHITE_KEYS.map(({ physicalKey, note }) => (
                  <PianoKey
                    key={physicalKey}
                    note={note}
                    keyboardKey={physicalKey.toUpperCase()}
                    showKeyboardKey={showKeyboardKeys}
                    physicalKey={physicalKey}
                    down={pressedKeys.has(physicalKey)}
                    onDown={noteOn}
                    onUp={noteOff}
                    className={[
                      'relative flex aspect-[1/2.5] min-w-0 w-full cursor-pointer rounded bg-white shadow-sm transition',
                      'dark:bg-zinc-100',
                      'active:translate-y-[1px]',
                    ].join(' ')}
                  />
                ))}
              </div>

              <div className="pointer-events-none absolute top-0 right-0 left-0">
                {BLACK_KEYS.map(({ physicalKey, note, leftClass }) => (
                  <PianoKey
                    key={physicalKey}
                    note={note}
                    keyboardKey={physicalKey.toUpperCase()}
                    showKeyboardKey={showKeyboardKeys}
                    physicalKey={physicalKey}
                    down={pressedKeys.has(physicalKey)}
                    black
                    onDown={noteOn}
                    onUp={noteOff}
                    className={[
                      'pointer-events-auto absolute flex aspect-[3/8] w-[6.25%] cursor-pointer rounded border border-zinc-900 bg-zinc-900 shadow-lg transition',
                      leftClass,
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <AboutModal open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  )
}
