import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { Toaster } from '@/components/ui/toast'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Negentroper CMS | AI-Driven Digital Chaos',
  description:
    'Where artificial intelligence meets creative chaos in a symphony of digital innovation. AI-driven content management system for the modern digital alchemist.',
  keywords: [
    'AI',
    'CMS',
    'Content Management',
    'Neural Networks',
    'Digital Innovation',
    'Artificial Intelligence',
    'Creative Technology',
    'Blog',
    'Portfolio',
    'Cyberpunk',
  ],
  authors: [{ name: 'Negentroper', url: 'https://negentroper.com' }],
  openGraph: {
    title: 'Negentroper CMS | AI-Driven Digital Chaos',
    description:
      'Where artificial intelligence meets creative chaos in a symphony of digital innovation',
    type: 'website',
    locale: 'en_US',
    siteName: 'Negentroper CMS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Negentroper CMS - AI-Driven Digital Innovation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Negentroper CMS | AI-Driven Digital Chaos',
    description:
      'Where artificial intelligence meets creative chaos in digital innovation',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.className} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <QueryProvider>
              {/* Theme Toggle - Fixed Position */}
              <div className="fixed right-4 top-4 z-50">
                <ThemeToggle />
              </div>

              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
