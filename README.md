# paul-ts

Personal Next.js site with Kiano on the homepage and a Note Trainer game.

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint `src` with ESLint

## Keyboard Piano

The homepage includes a playable keyboard piano built as a client component.

### Features

- Browser keyboard mapping to notes (white + black keys)
- Audio unlock flow (`Enable Sound` -> `Ready`)
- Tone.js sampler piano with synth fallback modes (`piano`, `sine`, `triangle`)
- Headless UI controls (`Settings` popover, waveform tabs, key label toggle)
- About modal with project context and usage notes
- Persistent settings via `localStorage`

### Controls

- Play notes with keyboard keys shown on the instrument
- Hold keys to sustain
- `Z/X` shifts octaves
- `Ctrl+/` (or `Cmd+/`) toggles Settings

## Note Trainer

The note trainer game is available at `/note-trainer`.

### Features

- Staff-based target note training loop
- Score, streak, and best tracking
- Speed selector (`3s`, `5s`, `8s`) with `localStorage` persistence
- Pause/resume/reset controls

## Environment Variables

Copy `.env.example` to `.env.local` and set your values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUBSTACK_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_GITHUB_URL`
- `NEXT_PUBLIC_LINKEDIN_URL`
- `NEXT_PUBLIC_BUY_ME_A_COFFEE_URL`

These are used by homepage social links, support CTA, and metadata.

## Social Preview Image

Share previews use:

- `public/kiano-graph.png`
- `public/note-trainer-graph.png`

Configured in `src/app/layout.tsx` via Open Graph and Twitter metadata.

## Main Files

- `src/app/layout.tsx` - app shell, providers, metadata
- `src/app/page.tsx` - Kiano homepage
- `src/app/note-trainer/page.tsx` - Note Trainer page
- `src/components/projects/KeyboardPiano.tsx` - main piano UI/logic
- `src/components/projects/keyboard-piano/AboutModal.tsx` - About modal content
- `src/components/projects/keyboard-piano/PlayModal.tsx` - Note Trainer launch modal
- `src/components/projects/note-trainer/NoteTrainer.tsx` - game logic and UI
- `src/components/Header.tsx` - top navigation + theme toggle
- `src/components/Footer.tsx` - footer navigation
- `src/components/BuyMeACoffee.tsx` - support button
- `src/styles/tailwind.css` - Tailwind + typography plugin setup
