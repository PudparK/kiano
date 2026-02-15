'use client'

const NOTE_Y: Record<string, number> = {
  C4: 70,
  D4: 65,
  E4: 60,
  F4: 55,
  G4: 50,
  A4: 45,
  B4: 40,
  C5: 35,
}

type StaffProps = {
  note: string
}

export default function Staff({ note }: StaffProps) {
  const y = NOTE_Y[note] ?? 60
  const showLedgerBelow = note === 'C4'

  return (
    <div className="rounded-2xl bg-zinc-100/80 p-4 shadow-inner ring-1 ring-zinc-200/70 dark:bg-zinc-800/70 dark:ring-zinc-700/60">
      <svg viewBox="0 0 320 100" className="h-auto w-full" role="img" aria-label={`Target note ${note}`}>
        {[20, 30, 40, 50, 60].map((lineY) => (
          <line
            key={lineY}
            x1="20"
            y1={lineY}
            x2="300"
            y2={lineY}
            className="stroke-zinc-500/40 dark:stroke-white/20"
            strokeWidth="1.5"
          />
        ))}

        {showLedgerBelow ? (
          <line
            x1="138"
            y1="70"
            x2="182"
            y2="70"
            className="stroke-zinc-500/50 dark:stroke-white/30"
            strokeWidth="1.5"
          />
        ) : null}

        <ellipse cx="160" cy={y} rx="12" ry="8" className="fill-zinc-900/90 dark:fill-white/90" />

        <text
          x="182"
          y={y + 4}
          className="fill-zinc-700 text-[10px] font-semibold dark:fill-zinc-200"
        >
          {note}
        </text>
      </svg>
    </div>
  )
}
