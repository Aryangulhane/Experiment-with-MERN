declare module '@sanity/image-url' {
  import { SanityImageSource } from '@sanity/image-url/lib/types/types'
  import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'

  export default function imageUrlBuilder(source: SanityImageSource): ImageUrlBuilder
} 