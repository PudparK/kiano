'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Staff from '@/components/projects/note-trainer/Staff'
import {
  KEY_TO_NOTE,
  NOTE_ORDER,
  keyToNoteName,
  midiToFreq,
  noteNameToMidi,
} from '@/components/projects/keyboard-piano/pianoMapping'

const ADVANCE_DELAY_MS = 400
const SPEED_OPTIONS = [3, 5, 8] as const
const SPEED_STORAGE_KEY = 'noteTrainerSpeed'
const WHITE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'] as const
const BLACK_KEYS = [
  { key: 'w', leftClass: 'left-[calc(10%-3.125%)]' },
  { key: 'e', leftClass: 'left-[calc(20%-3.125%)]' },
  { key: 't', leftClass: 'left-[calc(40%-3.125%)]' },
  { key: 'y', leftClass: 'left-[calc(50%-3.125%)]' },
  { key: 'u', leftClass: 'left-[calc(60%-3.125%)]' },
  { key: 'o', leftClass: 'left-[calc(80%-3.125%)]' },
  { key: 'p', leftClass: 'left-[calc(90%-3.125%)]' },
] as const

type GameState = 'idle' | 'running' | 'paused'

function nextNote(prev: string | null) {
  const pool = NOTE_ORDER.filter((note) => note !== prev)
  const index = Math.floor(Math.random() * pool.length)
  return pool[index] ?? NOTE_ORDER[0]
}

export default function NoteTrainer() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [targetNote, setTargetNote] = useState<string>(NOTE_ORDER[0])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [timePerNote, setTimePerNote] = useState<number>(5)
  const [timeLeftMs, setTimeLeftMs] = useState(5000)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set())

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const beginRoundRef = useRef<(note: string) => void>(() => {})
  const roundResolvedRef = useRef(false)
  const speedLoadedRef = useRef(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  const timeRatio = useMemo(
    () => Math.max(0, Math.min(1, timeLeftMs / (timePerNote * 1000))),
    [timeLeftMs, timePerNote],
  )

  const clearRoundTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (advanceRef.current) {
      clearTimeout(advanceRef.current)
      advanceRef.current = null
    }
  }, [])

  const ensureAudio = useCallback(async () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null
      const ctx = new AudioCtx()
      const master = ctx.createGain()
      master.gain.value = 0.2
      master.connect(ctx.destination)
      audioCtxRef.current = ctx
      masterGainRef.current = master
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
    }

    return audioCtxRef.current
  }, [])

  const playTone = useCallback(
    async (freq: number, type: OscillatorType, durationMs: number, gainValue: number) => {
      const ctx = await ensureAudio()
      const master = masterGainRef.current
      if (!ctx || !master) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000)

      osc.connect(gain)
      gain.connect(master)
      osc.start()
      osc.stop(ctx.currentTime + durationMs / 1000 + 0.02)
    },
    [ensureAudio],
  )

  const playNote = useCallback(
    async (note: string) => {
      const midi = noteNameToMidi(note)
      if (midi == null) return
      await playTone(midiToFreq(midi), 'triangle', 220, 0.12)
    },
    [playTone],
  )

  const playSuccess = useCallback(async () => {
    await playTone(880, 'sine', 180, 0.1)
  }, [playTone])

  const playFail = useCallback(async () => {
    await playTone(180, 'square', 220, 0.16)
  }, [playTone])

  const beginRound = useCallback(
    (note: string) => {
      const roundMs = timePerNote * 1000
      clearRoundTimers()
      roundResolvedRef.current = false
      setTargetNote(note)
      setTimeLeftMs(roundMs)

      const startedAt = performance.now()

      intervalRef.current = setInterval(() => {
        const elapsed = performance.now() - startedAt
        setTimeLeftMs(Math.max(0, roundMs - elapsed))
      }, 50)

      timeoutRef.current = setTimeout(() => {
        if (roundResolvedRef.current) return
        roundResolvedRef.current = true
        setStreak(0)
        void playFail()
        clearRoundTimers()

        advanceRef.current = setTimeout(() => {
          setTargetNote((prev) => {
            const next = nextNote(prev)
            if (gameState === 'running') beginRoundRef.current(next)
            return next
          })
        }, ADVANCE_DELAY_MS)
      }, roundMs)
    },
    [clearRoundTimers, gameState, playFail, timePerNote],
  )

  useEffect(() => {
    beginRoundRef.current = beginRound
  }, [beginRound])

  const startGame = useCallback(async () => {
    await ensureAudio()
    setGameState('running')
    setTargetNote(() => {
      const seed = nextNote(null)
      beginRound(seed)
      return seed
    })
  }, [beginRound, ensureAudio])

  const pauseGame = useCallback(() => {
    setGameState('paused')
    clearRoundTimers()
  }, [clearRoundTimers])

  const resumeGame = useCallback(async () => {
    await ensureAudio()
    setGameState('running')
    beginRound(targetNote)
  }, [beginRound, ensureAudio, targetNote])

  const resetGame = useCallback(() => {
    clearRoundTimers()
    setGameState('idle')
    setScore(0)
    setStreak(0)
    setBest(0)
    setTimeLeftMs(timePerNote * 1000)
    setTargetNote((prev) => nextNote(prev))
  }, [clearRoundTimers, timePerNote])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(SPEED_STORAGE_KEY)
      const parsed = Number(raw)
      if (SPEED_OPTIONS.includes(parsed as (typeof SPEED_OPTIONS)[number])) {
        setTimePerNote(parsed)
        setTimeLeftMs(parsed * 1000)
      }
    } catch {
      // ignore storage read errors
    } finally {
      speedLoadedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!speedLoadedRef.current) return
    try {
      window.localStorage.setItem(SPEED_STORAGE_KEY, String(timePerNote))
    } catch {
      // ignore storage write errors
    }
  }, [timePerNote])

  const handleSpeedChange = useCallback(
    (speed: (typeof SPEED_OPTIONS)[number]) => {
      setTimePerNote(speed)
      setTimeLeftMs(speed * 1000)
      if (gameState === 'running') {
        beginRound(targetNote)
      }
    },
    [beginRound, gameState, targetNote],
  )

  const handlePlayedNote = useCallback(
    (playedNote: string) => {
      void playNote(playedNote)

      if (gameState !== 'running' || roundResolvedRef.current) return
      if (playedNote !== targetNote) return

      roundResolvedRef.current = true
      clearRoundTimers()
      void playSuccess()
      setScore((prev) => prev + 1)
      setStreak((prev) => {
        const next = prev + 1
        setBest((currBest) => Math.max(currBest, next))
        return next
      })

      advanceRef.current = setTimeout(() => {
        setTargetNote((prev) => {
          const next = nextNote(prev)
          if (gameState === 'running') beginRound(next)
          return next
        })
      }, ADVANCE_DELAY_MS)
    },
    [beginRound, clearRoundTimers, gameState, playNote, playSuccess, targetNote],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return

      const key = e.key.toLowerCase()
      const playedNote = keyToNoteName(key)
      if (!playedNote) return
      e.preventDefault()
      if (!e.repeat) {
        setPressedKeys((prev) => {
          const next = new Set(prev)
          next.add(key)
          return next
        })
        handlePlayedNote(playedNote)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (!keyToNoteName(key)) return
      setPressedKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [handlePlayedNote])

  useEffect(() => {
    const pauseForSafety = () => {
      setGameState((prev) => (prev === 'running' ? 'paused' : prev))
      clearRoundTimers()
      setPressedKeys(new Set())
    }

    const onVisibility = () => {
      if (document.hidden) pauseForSafety()
    }

    window.addEventListener('blur', pauseForSafety)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', pauseForSafety)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [clearRoundTimers])

  useEffect(() => {
    return () => {
      clearRoundTimers()
      if (audioCtxRef.current) {
        void audioCtxRef.current.close()
      }
    }
  }, [clearRoundTimers])

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-100/80 p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-800/70 dark:ring-zinc-700/60">
          <p className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Score</p>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{score}</p>
        </div>
        <div className="rounded-xl bg-zinc-100/80 p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-800/70 dark:ring-zinc-700/60">
          <p className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Streak</p>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{streak}</p>
        </div>
        <div className="rounded-xl bg-zinc-100/80 p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-800/70 dark:ring-zinc-700/60">
          <p className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Best</p>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{best}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {gameState === 'running' ? (
            <button
              type="button"
              onClick={pauseGame}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={gameState === 'idle' ? startGame : resumeGame}
              className="rounded-md bg-[#67c2a0] px-3 py-2 text-sm text-white transition hover:bg-[#5db596]"
            >
              {gameState === 'idle' ? 'Start' : 'Resume'}
            </button>
          )}
          <button
            type="button"
            onClick={resetGame}
            className="rounded-md bg-zinc-200 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Reset
          </button>

          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm text-neutral-400">Speed</span>
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handleSpeedChange(speed)}
                className={[
                  'rounded-full px-3 py-1 text-sm transition',
                  timePerNote === speed
                    ? 'bg-green-500/20 text-green-300 ring-1 ring-green-400/40'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10',
                ].join(' ')}
              >
                {speed}s
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Time: {(timeLeftMs / 1000).toFixed(1)}s
        </p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-[#67c2a0] transition-[width] duration-100"
          style={{ width: `${timeRatio * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Target note: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{targetNote}</span>
        </p>
        <Staff note={targetNote} />
      </div>

      <div className="space-y-2">
        <p className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Keyboard</p>
        <div className="rounded-xl bg-zinc-200/80 p-3 shadow-inner dark:bg-zinc-800">
          <div className="relative">
            <div className="grid grid-cols-10">
              {WHITE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.add(key)
                      return next
                    })
                    handlePlayedNote(KEY_TO_NOTE[key])
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }}
                  onPointerCancel={() =>
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }
                  onPointerLeave={() =>
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }
                  className={[
                    'relative flex aspect-[1/2.5] min-w-0 w-full cursor-pointer rounded bg-white shadow-sm transition dark:bg-zinc-100',
                    pressedKeys.has(key)
                      ? 'bg-zinc-300 ring-1 ring-zinc-500/35 dark:bg-zinc-300 dark:ring-zinc-500/35'
                      : '',
                  ].join(' ')}
                >
                  <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-tight text-zinc-700 sm:right-2 sm:left-auto sm:translate-x-0 sm:text-base">
                    {KEY_TO_NOTE[key]}
                  </span>
                  <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-600 opacity-45 sm:right-2 sm:left-auto sm:translate-x-0 sm:text-[10px]">
                    {key.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            <div className="pointer-events-none absolute top-0 right-0 left-0">
              {BLACK_KEYS.map(({ key, leftClass }) => (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.add(key)
                      return next
                    })
                    handlePlayedNote(KEY_TO_NOTE[key])
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }}
                  onPointerCancel={() =>
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }
                  onPointerLeave={() =>
                    setPressedKeys((prev) => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }
                  className={[
                    'pointer-events-auto absolute flex aspect-[3/8] w-[6.25%] rounded border border-zinc-900 bg-zinc-900 shadow-lg transition dark:bg-zinc-950',
                    leftClass,
                    pressedKeys.has(key) ? 'bg-zinc-700 ring-1 ring-zinc-200/25' : '',
                  ].join(' ')}
                >
                  <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-tight text-zinc-100 sm:right-1.5 sm:left-auto sm:translate-x-0 sm:text-xs">
                    {KEY_TO_NOTE[key]}
                  </span>
                  <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-100 opacity-45 sm:right-1.5 sm:left-auto sm:translate-x-0 sm:text-[10px]">
                    {key.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
