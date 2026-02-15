'use client'

import Link from 'next/link'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

type PlayModalProps = {
  open: boolean
  onClose: () => void
}

export default function PlayModal({ open, onClose }: PlayModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-[calc(100vw-2rem)] max-w-md space-y-5 rounded-2xl bg-zinc-50 p-6 shadow-lg ring-1 ring-zinc-900/10 dark:bg-[#131313] dark:ring-white/10">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-md px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close Play modal"
          >
            Close
          </button>

          <div className="space-y-2 pr-14">
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
              Note Trainer
            </DialogTitle>
            <p className="text-sm leading-6 text-zinc-600 dark:text-neutral-300">
              Train note recognition against the clock. You will see one target
              note on staff and must hit the correct key before time runs out.
            </p>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-neutral-300">
            <li>Correct note: score and streak increase</li>
            <li>Missed note: streak resets</li>
            <li>Play with keyboard only, no rhythm required</li>
            <li>Trainer shows full note names (C4, D#4) to help you learn faster.</li>
          </ul>

          <div className="flex items-center justify-end">
            <Link
              href="/note-trainer"
              onClick={onClose}
              className="cursor-pointer rounded-md border border-transparent bg-[#67c2a0] px-3 py-2 text-sm text-white transition hover:bg-[#5db596]"
            >
              Ready
            </Link>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
