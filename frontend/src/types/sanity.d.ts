declare module 'sanity' {
  export interface Image {
    asset: {
      _ref: string;
      _type: string;
    };
    _type: string;
  }
}

declare module 'next-sanity' {
  import { SanityClient } from '@sanity/client'
  
  export interface SanityConfig {
    projectId: string
    dataset: string
    apiVersion?: string
    useCdn?: boolean
    token?: string
    perspective?: 'published' | 'previewDrafts' | 'raw'
    stega?: {
      enabled: boolean
      studioUrl: string
    }
  }

  export function createClient(config: SanityConfig): SanityClient
}

declare module '@sanity/image-url' {
  import { SanityClient } from '@sanity/client'
  
  export default function imageUrlBuilder(client: SanityClient): {
    image: (source: any) => {
      url: () => string
      width: (w: number) => any
      height: (h: number) => any
      fit: (fit: string) => any
      format: (format: string) => any
    }
  }
} 