import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schema } from './sanity/schemaTypes/index'
import project from './sanity/schemaTypes/project';

// Debug environment variables
console.log('Studio Environment Variables:', {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
})

// Use fallback values if environment variables are not set
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'krdza9oy'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  
  plugins: [
    deskTool(),
    visionTool()
  ],

  schema: {
    types: schema.types,
    project,
  },

  cors: {
    allowOrigins: [
      'https://www.sanity.io',
      'https://aryanportfolio.sanity.studio',
      'http://localhost:3333'
    ]
  }
})