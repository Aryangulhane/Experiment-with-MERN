// src/components/BlogPostClient.tsx
"use client";

import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import { portableTextComponents } from '@/components/PortableTextComponents';
import { urlFor } from '@/lib/sanity';
import { FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { Post, RelatedPost } from '@/lib/sanity'; // Assuming you've moved types to sanity.ts

// --- TypeScript Interfaces ---
interface Heading {
  _key: string;
  style: 'h2' | 'h3';
  children: { text: string }[];
}

interface BlogPostClientProps {
  post: Post;
  relatedPosts: RelatedPost[];
  headings: Heading[];
}

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// --- Main Client Component ---
export default function BlogPostClient({ post, relatedPosts, headings }: BlogPostClientProps) {
  // Helper to calculate reading time
  const readingTime = Math.ceil(JSON.stringify(post.body).split(/\s+/).length / 200);

  return (
    <>
      <ReadingProgressBar />
      <motion.article
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-16 sm:py-24"
      >
        <PostHeader post={post} readingTime={readingTime} />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12">
          {headings.length > 0 && <TableOfContents headings={headings} />}
          
          <div className={`prose prose-lg max-w-none dark:prose-invert ${headings.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            <PortableText value={post.body} components={portableTextComponents} />
          </div>

          <SocialShare title={post.title} slug={post.slug.current} />
        </div>

        {relatedPosts.length > 0 && <RelatedPostsSection posts={relatedPosts} />}
      </motion.article>
    </>
  );
}

// --- Helper Components for a Professional & Modular Structure ---

const PostHeader = ({ post, readingTime }: { post: Post; readingTime: number }) => (
  <header className="relative mx-auto mb-16 max-w-4xl text-center">
    {post.mainImage && (
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"
      >
        <Image
          src={urlFor(post.mainImage)?.url() || ''}
          alt={post.title}
          fill
          className="object-cover opacity-10"
          priority
        />
      </motion.div>
    )}
    <motion.div variants={itemVariants} className="mb-4 flex flex-wrap justify-center gap-2">
      {post.categories?.map((cat) => (
        <span key={cat} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {cat}
        </span>
      ))}
    </motion.div>
    <motion.h1 variants={itemVariants} className="glow-text cyber-text text-4xl font-extrabold sm:text-5xl lg:text-6xl">
      {post.title}
    </motion.h1>
    <motion.p variants={itemVariants} className="mt-4 text-sm text-muted-foreground">
      Published on {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      <span className="mx-2">•</span>
      <span>{readingTime} min read</span>
    </motion.p>
  </header>
);

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').slice(0, 200);

const TableOfContents = ({ headings }: { headings: Heading[] }) => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0px -80% 0px' }
    );

    headings.forEach((h) => {
      const id = slugify(h.children[0]?.text || '');
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside className="hidden lg:col-span-3 lg:block">
      <div className="sticky top-28">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">On this page</h2>
        <ul className="space-y-2">
          {headings.map((heading) => {
            const id = slugify(heading.children[0]?.text || '');
            const isActive = activeId === id;
            return (
              <li key={heading._key}>
                <a
                  href={`#${id}`}
                  className={`block border-l-2 py-1 pl-4 text-sm transition-all ${
                    heading.style === 'h3' ? 'ml-4' : ''
                  } ${
                    isActive
                      ? 'border-primary font-medium text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {heading.children[0]?.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

const SocialShare = ({ title, slug }: { title: string; slug: string }) => {
  const url = `https://yourdomain.com/blog/${slug}`; // Replace with your actual domain
  const shareLinks = [
    { Icon: FaTwitter, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${url}` },
    { Icon: FaLinkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { Icon: FaFacebook, url: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  ];

  return (
    <div className="hidden lg:col-span-1 lg:block">
      <div className="sticky top-1/3 flex flex-col items-center gap-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share</span>
        {shareLinks.map(({ Icon, url }, index) => (
          <motion.a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover={{ scale: 1.2, color: 'hsl(var(--primary-h) var(--primary-s) var(--primary-l))' }}
            className="text-muted-foreground"
          >
            <Icon size={20} />
          </motion.a>
        ))}
      </div>
    </div>
  );
};

const RelatedPostsSection = ({ posts }: { posts: RelatedPost[] }) => (
  <section className="mt-24 border-t border-border pt-16">
    <h2 className="mb-8 text-center text-3xl font-bold">Related Articles</h2>
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {posts.map((related) => (
        <Link href={`/blog/${related.slug.current}`} key={related._id} className="group">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="glass h-full overflow-hidden rounded-2xl border border-border p-6 transition-all hover:border-primary/50"
          >
            <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">{related.title}</h3>
            <div className="flex flex-wrap gap-2">
              {related.categories?.map((cat) => (
                <span key={cat} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  {cat}
                </span>
              ))}
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  </section>
);