export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-08-01'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'krdza9oy'
export const useCdn = process.env.NODE_ENV === 'production' 