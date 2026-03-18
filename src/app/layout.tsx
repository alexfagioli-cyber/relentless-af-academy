import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { CelebrationProvider } from '@/components/ui/celebration-toast'
import { FeedbackButton } from '@/components/ui/feedback-button'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'RelentlessAF Academy',
  description: 'AI mentorship programme — become extraordinary',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8C872" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {/* Desktop: centre content in a phone mockup frame */}
        <div className="md:flex md:items-center md:justify-center md:min-h-screen">
          <div className="md:w-[390px] md:max-h-[85vh] md:aspect-[9/19.5] md:rounded-[40px] md:border md:border-[#363654] md:shadow-[0_0_60px_rgba(0,0,0,0.5)] md:overflow-y-auto md:overflow-x-hidden md:relative md:bg-[#1A1A2E]">
            <CelebrationProvider>
              {children}
              <FeedbackButton />
            </CelebrationProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
