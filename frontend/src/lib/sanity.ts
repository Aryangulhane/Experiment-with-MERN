// src/lib/sanity.ts
import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

// --- 1. CORE SANITY CLIENT SETUP (Unchanged) ---

// Validate environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'krdza9oy'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Create the config
const config = {
  projectId,
  dataset,
  apiVersion: '2024-03-19',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published' as const,
  stega: {
    enabled: false,
    studioUrl: '/studio'
  },
  //withCredentials: true,
}

// Create the client
export const client = createClient(config)

// Helper function for generating image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  if (!source) {
    return null
  }
  return builder.image(source)
}

// Export the config for use in other files
export { config }

// --- 2. TYPESCRIPT INTERFACES FOR YOUR DATA ---

// Defines the structure for a full blog post
export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  publishedAt: string;
  excerpt: string;
  body: any;
  categories?: string[];
  headings?: any[]; // For the Table of Contents
}

// Defines a simpler structure for related post cards
export interface RelatedPost {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  categories?: string[];
}


// --- 3. ENHANCED DATA FETCHING FUNCTIONS ---

/**
 * Fetches a single post by its slug, including headings for a Table of Contents.
 * @param slug The slug of the post to fetch.
 */
export async function getPost(slug: string): Promise<Post | null> {
  try {
    const query = `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      body,
      "categories": categories[]->title,
      "headings": body[style in ["h2", "h3"]]
    }`;
    const post = await client.fetch(query, { slug });
    return post || null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

/**
 * Fetches up to two related posts based on shared categories.
 * @param postId The ID of the current post to exclude it from results.
 * @param categories An array of category titles to match against.
 */
export async function getRelatedPosts(postId: string, categories: string[] = []): Promise<RelatedPost[]> {
  if (!categories || categories.length === 0) {
    return [];
  }
  try {
    const query = `*[_type == "post" && _id != $postId && count(categories[]->title in $categories) > 0] | order(publishedAt desc)[0...2] {
      _id,
      title,
      slug,
      mainImage,
      "categories": categories[]->title
    }`;
    return await client.fetch(query, { postId, categories });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}


// --- 4. GLOBAL TYPE DECLARATIONS (Unchanged) ---

declare global {
  interface Window {
    sanityBridge?: {
      init: (config: { targetOrigin: string }) => void
      send: (message: any) => void
      receive: (callback: (message: any) => void) => void
    }
  }
}