import { useEffect, useCallback } from 'react'

const SANITY_ORIGIN = 'https://www.sanity.io'
const STUDIO_ORIGIN = 'https://aryanportfolio.sanity.studio'
const LOCAL_ORIGIN = 'http://localhost:3333'

const TRUSTED_ORIGINS = [SANITY_ORIGIN, STUDIO_ORIGIN, LOCAL_ORIGIN]

export function usePostMessage() {
  const sendMessage = useCallback((message: any, targetOrigin: string = SANITY_ORIGIN) => {
    // Always use the exact Sanity.io origin for outgoing messages
    window.postMessage(message, SANITY_ORIGIN)
  }, [])

  const receiveMessage = useCallback((callback: (event: MessageEvent) => void) => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Sanity.io
      if (event.origin !== SANITY_ORIGIN) {
        console.warn(`Received message from untrusted origin: ${event.origin}`)
        return
      }

      // Process the message
      callback(event)
    }

    // Add event listener
    window.addEventListener('message', handleMessage)

    // Return cleanup function
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return {
    sendMessage,
    receiveMessage
  }
} 