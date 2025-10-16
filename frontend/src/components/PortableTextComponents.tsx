// src/components/PortableTextComponents.tsx
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
import { FaLink } from 'react-icons/fa';
import type { PortableTextReactComponents, PortableTextBlockComponent } from '@portabletext/react';

// Helper function to generate slugs from text
const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').slice(0, 200);

export const portableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }: { value: any }) => (
      <div className="relative my-8 overflow-hidden rounded-xl">
        <Image
          src={urlFor(value)?.url() || ''}
          alt={value.alt || 'Blog post image'}
          width={800}
          height={400}
          className="w-full object-cover"
        />
      </div>
    ),
  },
  block: {
    h2: ((props) => {
      const text = (props.children as any)?.toString?.() || '';
      const id = slugify(text);
      return (
        <h2 id={id} className="group relative mt-12 mb-4 text-3xl font-bold">
          <a href={`#${id}`} className="absolute -left-6 top-1 opacity-0 transition-opacity group-hover:opacity-50">
            <FaLink />
          </a>
          {props.children}
        </h2>
      );
    }) as PortableTextBlockComponent,
    h3: ((props) => {
      const text = (props.children as any)?.toString?.() || '';
      const id = slugify(text);
      return (
        <h3 id={id} className="group relative mt-8 mb-4 text-2xl font-semibold">
          <a href={`#${id}`} className="absolute -left-6 top-1 opacity-0 transition-opacity group-hover:opacity-50">
            <FaLink />
          </a>
          {props.children}
        </h3>
      );
    }) as PortableTextBlockComponent,
    blockquote: ((props) => (
      <blockquote className="my-8 border-l-4 border-primary bg-primary/10 p-4 italic text-muted-foreground">
        {props.children}
      </blockquote>
    )) as PortableTextBlockComponent,
  },
};