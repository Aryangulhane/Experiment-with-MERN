// src/app/blog/[slug]/page.tsx
"use client";
import { client, getPost, getRelatedPosts, urlFor } from '@/lib/sanity';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogPostClient from '@/app/blog/[slug]/BlogPostClient';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post._id, post.categories);
  const headings = post.headings || [];

  return (
    <BlogPostClient post={post} relatedPosts={relatedPosts} headings={headings} />
  );
}

// Server component only fetches data and renders the client component.