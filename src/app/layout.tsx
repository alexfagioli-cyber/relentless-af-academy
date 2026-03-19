import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { CelebrationProvider } from '@/components/ui/celebration-toast'
import { FeedbackButton } from '@/components/ui/feedback-button'
import { SidebarNav } from '@/components/layout/sidebar-nav'
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
        <CelebrationProvider>
          <SidebarNav />
          <div className="md:ml-60">
            {children}
          </div>
          <FeedbackButton />
        </CelebrationProvider>
      </body>
    </html>
  )
}
