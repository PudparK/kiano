'use client'

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

type AboutModalProps = {
  open: boolean
  onClose: () => void
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-[calc(100vw-2rem)] max-w-xl space-y-5 rounded-2xl bg-zinc-50 p-6 shadow-lg ring-1 ring-zinc-900/10 dark:bg-[#131313] dark:ring-white/10">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-md px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close About modal"
          >
            Close
          </button>

          <div className="space-y-2 pr-14">
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
              About
            </DialogTitle>
            <p className="text-sm leading-6 text-zinc-600 dark:text-neutral-300">
              Keyboard Piano is a browser-based mini instrument that maps your
              typing keys to playable notes. I built it as a lightweight audio
              playground to practice real-time interaction patterns and keep a
              quick creative sketchpad inside the site.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-neutral-400">
              How to play
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-neutral-300">
              <li>Use your keyboard to play notes</li>
              <li>Hold keys to sustain</li>
              <li>Z/X shifts octaves</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-neutral-400">
              Built with
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-neutral-300">
              <li>Tone.js sampler piano + synth fallback</li>
              <li>Keyboard event handling + stuck-note prevention</li>
              <li>Next.js client component</li>
            </ul>
          </section>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
