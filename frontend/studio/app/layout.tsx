import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

const SANITY_ORIGIN = 'https://www.sanity.io'
const STUDIO_ORIGIN = 'https://aryanportfolio.sanity.studio'

export const metadata: Metadata = {
  title: 'Sanity Studio',
  description: 'Content management for your portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Handle incoming messages
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Sanity.io
      if (event.origin !== SANITY_ORIGIN) {
        console.warn(`Received message from untrusted origin: ${event.origin}`)
        return
      }

      // Handle the message
      console.log('Received message from Sanity.io:', event.data)
    }

    // Add event listener
    window.addEventListener('message', handleMessage)

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.sanity.io"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://core.sanity-cdn.com/bridge.js"
          as="script"
          crossOrigin="anonymous"
        />
        <script
          src="https://core.sanity-cdn.com/bridge.js"
          async
          crossOrigin="anonymous"
          onLoad={() => {
            if (window.sanityBridge) {
              window.sanityBridge.init({
                targetOrigin: SANITY_ORIGIN
              })
            }
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 