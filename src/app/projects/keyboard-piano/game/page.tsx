import type { Metadata } from 'next'
import { Container } from '@/components/Container'
import { BuyMeACoffee } from '@/components/BuyMeACoffee'
import NoteTrainer from '@/components/projects/note-trainer/NoteTrainer'
import { resolveOgImage } from '@/app/metadata-utils'
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  SubstackIcon,
} from '@/components/SocialIcons'

const SUBSTACK_URL = process.env.NEXT_PUBLIC_SUBSTACK_URL as string
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL as string
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL as string
const LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL as string
const noteTrainerOgImage = resolveOgImage('/note-trainer-graph.png')

export const metadata: Metadata = {
  title: 'Note Trainer',
  description:
    'Kiano Note Trainer by Paul Barrón: a browser-based music training game for real-time staff note recognition.',
  openGraph: {
    title: 'Kiano Note Trainer by Paul Barrón',
    description: 'Train your note recognition skills directly in the browser.',
    images: [noteTrainerOgImage],
  },
}

function SocialLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="group -m-1 p-1"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-700 dark:fill-zinc-400 dark:group-hover:fill-zinc-200" />
    </a>
  )
}

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

        <section className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-700/40">
          <div className="mb-6 flex items-center justify-center gap-4">
            <SocialLink href={SUBSTACK_URL} label="Substack" icon={SubstackIcon} />
            <SocialLink href={INSTAGRAM_URL} label="Instagram" icon={InstagramIcon} />
            <SocialLink href={GITHUB_URL} label="GitHub" icon={GitHubIcon} />
            <SocialLink href={LINKEDIN_URL} label="LinkedIn" icon={LinkedInIcon} />
          </div>
          <div className="mt-6 flex items-center justify-center gap-x-6">
            <BuyMeACoffee />
          </div>
        </section>
      </div>
    </Container>
  )
}
