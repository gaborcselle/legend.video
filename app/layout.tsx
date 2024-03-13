// this is the main layout page for the app
// it is used to wrap all the pages in the app
// it contains the header and the main content of the app

import { Toaster } from 'react-hot-toast'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'

import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import GoogleAnalytics from '@/components/google-analytics-tag'

export const metadata = {
  // We need "https://" in metadataBase because process.env.VERCEL_URL does not contain protocol:
  // https://vercel.com/docs/projects/environment-variables/system-environment-variables
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: {
    default: 'Legend.video',
    template: `%s - Legend.video`
  },
  description: 'Make your stories come alive in video, with Legend.video.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <Toaster />
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
          </div>
          {/* <TailwindIndicator /> */}
        </Providers>
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  )
}
