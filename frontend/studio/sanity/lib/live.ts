// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
// Live content API is not compatible with current next-sanity and sanity client versions due to type conflicts.
// As a workaround, export a basic fetch function using the existing client.
import { client } from './client'

/**
 * Fetch data from Sanity using GROQ query.
 * @param {string} query - GROQ query string
 * @param {any[]} params - Query parameters
 */
export async function sanityFetch<T>(query: string, params: any[] = []): Promise<T> {
  return client.fetch<T>(query, params)
}

// Note: Live content updates are disabled until next-sanity and @sanity/client are fully compatible.
