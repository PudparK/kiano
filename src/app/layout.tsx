import type { Metadata } from 'next'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Providers } from '@/app/providers'
import { resolveOgImage, warnIfPublicAssetMissing } from '@/app/metadata-utils'

import '@/styles/tailwind.css'

warnIfPublicAssetMissing('/favicon.ico', 'favicon')
const defaultOgImage = resolveOgImage('/og-default.png')

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paulbarron.dev'),
  title: {
    default: 'Kiano by Paul Barrón',
    template: '%s | Kiano by Paul Barrón',
  },
  description:
    'Kiano by Paul Barrón — a browser-based piano and note training experience built for interactive music practice.',
  openGraph: {
    title: 'Kiano by Paul Barrón',
    description:
      'Play notes with your keyboard and train note recognition in real time with Kiano.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paulbarron.dev',
    siteName: 'Kiano by Paul Barrón',
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'Paul Barron portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiano by Paul Barrón',
    description:
      'Play notes with your keyboard and train note recognition in real time with Kiano.',
    images: [defaultOgImage],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-[#131313] dark:text-slate-100">
        <Providers>
          <Header />
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
