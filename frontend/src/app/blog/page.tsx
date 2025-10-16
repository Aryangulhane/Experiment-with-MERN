// src/app/blog/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { client, urlFor } from "@/lib/sanity";
import Link from "next/link";
import Image from "next/image";
import { FaTag } from "react-icons/fa";

// Define TypeScript types for our data
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  excerpt: string;
  categories: string[];
}

interface Category {
  _id: string;
  title: string;
}

// Reusable Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch both posts and categories in parallel
      const [postData, categoryData] = await Promise.all([
        client.fetch<Post[]>(`*[_type == "post"] | order(publishedAt desc) {
          _id, title, slug, mainImage, publishedAt, excerpt, "categories": categories[]->title
        }`),
        client.fetch<Category[]>(`*[_type == "category"] | order(title asc) { _id, title }`)
      ]);
      setPosts(postData);
      setCategories(categoryData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") {
      return posts;
    }
    return posts.filter((post) => post.categories?.includes(activeFilter));
  }, [activeFilter, posts]);

  if (isLoading) {
    return <BlogSkeleton />; // Show a loading skeleton
  }

  // Split posts for the new layout: one featured, the rest in a grid
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const otherPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div
            variants={itemVariants}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Ideas, Iterated
          </motion.div>
          <motion.h1 variants={itemVariants} className="cyber-text text-center text-5xl font-extrabold tracking-tight lg:text-7xl">
            Digital <span className="gradient-text">Field Notes</span>
          </motion.h1>
          <motion.div variants={itemVariants} className="mx-auto mt-4 mb-6 h-px w-24 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0" />
          <motion.p variants={itemVariants} className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
            Short, honest write‑ups at the edge of web tech, design systems, and delightful motion.
          </motion.p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12 flex flex-wrap justify-center gap-4"
        >
          <FilterButton
            category="All"
            activeFilter={activeFilter}
            onClick={() => setActiveFilter("All")}
          />
          {categories.map((cat) => (
            <FilterButton
              key={cat._id}
              category={cat.title}
              activeFilter={activeFilter}
              onClick={() => setActiveFilter(cat.title)}
            />
          ))}
        </motion.div>

        {/* Blog Post Grid */}
        <AnimatePresence mode="wait">
          {filteredPosts.length > 0 ? (
            <motion.div
              key={activeFilter} // Re-trigger animation on filter change
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Featured Post */}
              {featuredPost && (
                <FeaturedPostCard post={featuredPost} />
              )}
              {/* Other Posts */}
              {otherPosts.length > 0 && (
                 <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <NoPostsFound />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// --- Helper Components for a Cleaner Structure ---

const FilterButton = ({ category, activeFilter, onClick }: { category: string, activeFilter: string, onClick: () => void }) => (
  <motion.button
    variants={itemVariants}
    onClick={onClick}
    className={`btn rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 ${
      activeFilter === category
        ? "animated-border bg-primary/20 text-primary-foreground"
        : "border border-border hover:border-primary hover:text-primary"
    }`}
  >
    {category}
  </motion.button>
);

const PostCard = ({ post }: { post: Post }) => (
  <Link href={`/blog/${post.slug.current}`} className="group block">
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="glass h-full overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:border-primary/50"
    >
      <div className="relative h-48 w-full">
        <Image
          src={urlFor(post.mainImage)?.url() || '/placeholder.jpg'}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.categories?.map((cat) => (
            <span key={cat} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {cat}
            </span>
          ))}
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">{post.title}</h2>
        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        <p className="mt-4 text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </motion.div>
  </Link>
);

const FeaturedPostCard = ({ post }: { post: Post }) => (
  <Link href={`/blog/${post.slug.current}`} className="group block">
     <motion.div
      variants={itemVariants}
      className="glass grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:border-primary/50 md:grid-cols-2"
    >
      <div className="relative h-64 w-full md:h-full">
        <Image
          src={urlFor(post.mainImage)?.url() || '/placeholder.jpg'}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-8">
        <span className="mb-4 inline-block text-sm font-semibold text-primary">Featured Article</span>
        <h2 className="mb-4 text-3xl font-bold text-foreground transition-colors group-hover:text-primary lg:text-4xl">{post.title}</h2>
        <p className="mb-6 text-base text-muted-foreground">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {post.categories?.map((cat) => (
            <span key={cat} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <FaTag size={12} /> {cat}
            </span>
          ))}
        </div>
         <p className="mt-6 text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </motion.div>
  </Link>
);


const NoPostsFound = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <h2 className="text-2xl font-bold text-muted-foreground">No Chronicles Found</h2>
    <p className="mt-2 text-muted-foreground">Looks like this digital frontier is yet to be explored.</p>
  </motion.div>
);

const BlogSkeleton = () => (
  <div className="container mx-auto animate-pulse px-4 py-16 sm:py-24">
    <div className="mx-auto mb-12 h-16 w-3/4 rounded-lg bg-muted/50"></div>
    <div className="mb-12 flex flex-wrap justify-center gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-24 rounded-full bg-muted/50"></div>)}
    </div>
    <div className="h-80 w-full rounded-2xl bg-muted/50"></div>
    <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-96 rounded-2xl bg-muted/50"></div>)}
    </div>
  </div>
);