import {defineCliConfig} from 'sanity/cli'

// Use fallback values if environment variables are not set
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'krdza9oy'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset
  }
}) 