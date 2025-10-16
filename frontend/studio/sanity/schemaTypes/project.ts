// sanity/schemas/project.js
export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'projectName',
      title: 'Project Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'liveUrl',
      title: 'Live URL',
      type: 'url',
    },
    {
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
    },
    {
      name: 'imageUrl',
      title: 'Image URL',
      type: 'string', // Or use type: 'image' for Sanity's asset management
    },
    {
      name: 'tags',
      title: 'Tags & Category',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    },
  ],
}