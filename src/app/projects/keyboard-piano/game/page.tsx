import { Container } from '@/components/Container'
import NoteTrainer from '@/components/projects/note-trainer/NoteTrainer'

export default function KeyboardPianoGamePage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Note Trainer
          </h1>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
            <li>Play the target note shown on the staff.</li>
            <li>You have 3 seconds per note.</li>
            <li>Correct note grows streak, misses reset streak.</li>
          </ul>
        </header>

        <NoteTrainer />
      </div>
    </Container>
  )
}
