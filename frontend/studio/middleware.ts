import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TRUSTED_ORIGINS = [
  'https://www.sanity.io',
  'https://aryanportfolio.sanity.studio',
  'http://localhost:3333'
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get the origin from the request headers
  const origin = request.headers.get('origin')

  // Check if the origin is trusted
  if (origin && TRUSTED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

export const config = {
  matcher: '/api/:path*'
} 