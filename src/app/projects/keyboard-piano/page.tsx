import Link from 'next/link'
import type { Metadata } from 'next'
import { BuyMeACoffee } from '@/components/BuyMeACoffee'
import { Container } from '@/components/Container'
import KeyboardPiano from '@/components/projects/KeyboardPiano'
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

const keyboardPianoOgImage = resolveOgImage('/og-keyboard-piano.png')

export const metadata: Metadata = {
  title: 'Kiano',
  description:
    'Kiano by Paul Barrón: a browser-based keyboard instrument and note trainer built with Next.js, Tone.js, and Web Audio.',
  openGraph: {
    title: 'Kiano by Paul Barrón',
    description:
      'Play notes with your keyboard and train note recognition in the browser.',
    images: [keyboardPianoOgImage],
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
    <Link
      href={href}
      aria-label={label}
      className="group -m-1 p-1"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-700 dark:fill-zinc-400 dark:group-hover:fill-zinc-200" />
    </Link>
  )
}

export default function KeyboardPianoPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-4xl">
        <KeyboardPiano />
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
