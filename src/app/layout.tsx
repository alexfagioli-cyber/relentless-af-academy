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
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <CelebrationProvider>
          {children}
          <FeedbackButton />
        </CelebrationProvider>
      </body>
    </html>
  )
}
