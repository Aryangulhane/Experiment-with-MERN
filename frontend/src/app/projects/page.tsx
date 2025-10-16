// src/app/projects/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaExternalLinkAlt, FaSearch } from "react-icons/fa";

// --- Import or create these components and hooks in your project ---
// You will need to create these files in your components/hooks directories

// Example hook: src/hooks/useDebounce.ts
import { useDebounce } from '@/hooks/useDebounce'; 

// --- IMPORTANT: Set this to your local or deployed backend URL ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- Framer Motion Variants (from your original code) ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

// --- Main Page Component ---
export default function ProjectsPage() {
  // --- All the state management from our MERN app ---
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [facets, setFacets] = useState<any[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  // --- All the data fetching and logic from our MERN app ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setAllCategories(response.data);
      } catch (err) {
        toast.error("Could not load project categories.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const searchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.append('q', debouncedQuery);

        const categoryObject = allCategories.find(cat => cat._id === searchCategory);
        const categoryName = categoryObject ? categoryObject.name : null;
        const combinedSearchTags = [...searchTags];
        if (categoryName && !combinedSearchTags.includes(categoryName)) {
          combinedSearchTags.push(categoryName);
        }
        if (combinedSearchTags.length > 0) {
          params.append('tags', combinedSearchTags.join(','));
        }
        
        params.append('page', currentPage.toString());
        const response = await axios.get(`${API_BASE_URL}/search?${params.toString()}`);
        
        // Note: Ensure your backend now sends 'projects' not 'posts'
        setResults(response.data.projects || []); 
        setTotalPages(response.data.totalPages || 0);
        setFacets(response.data.facets || []);
      } catch (err) {
        setError('Failed to fetch projects.');
        setResults([]); setTotalPages(0); setFacets([]);
      }
      setIsLoading(false);
    };
    searchProjects();
  }, [debouncedQuery, searchTags, currentPage, searchCategory, allCategories]);

  useEffect(() => { setCurrentPage(1); }, [debouncedQuery, searchTags, searchCategory]);

  const handleFacetClick = (tag: string) => {
    if (!searchTags.includes(tag)) setSearchTags([...searchTags, tag]);
  };
  
  const handleClearSearch = () => {
    setQuery('');
    setSearchTags([]);
    setSearchCategory('');
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(40%_100%_at_50%_0%,rgba(var(--primary-rgb),0.1)_0%,rgba(var(--primary-rgb),0)_100%)]" />
      
      <div className="container mx-auto px-4 py-24 sm:py-32">
        {/* --- YOUR ORIGINAL HERO SECTION (UNCHANGED) --- */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="text-center">
          <motion.div variants={itemVariants} className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Featured Work
          </motion.div>
          <motion.h1 variants={itemVariants} className="cyber-text text-5xl font-extrabold tracking-tight lg:text-7xl">
            <span className="text-foreground">Code</span>
            <span className="text-primary"> & </span>
            <span className="gradient-text">Creations</span>
          </motion.h1>
          <motion.div variants={itemVariants} className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0" />
          <motion.p variants={itemVariants} className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground">
            A thoughtfully curated selection of real‑world and experimental projects, now powered by a dynamic search engine.
          </motion.p>
        </motion.div>

        {/* --- INTEGRATED SEARCH & FILTERING CONTROLS --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="my-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SearchBar value={query} onChange={e => setQuery(e.target.value)} />
          <select 
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="w-full rounded-full border border-border bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Filter by Category...</option>
            {allCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
          <button onClick={handleClearSearch} className="btn rounded-full border border-border text-sm hover:border-primary hover:text-primary">
            Clear Filters
          </button>
        </motion.div>

        {/* --- MAIN CONTENT LAYOUT WITH FACETS --- */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <FacetSidebar facets={facets} onFacetClick={handleFacetClick} activeTags={searchTags} />
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center pt-24"><div className="loading-spinner"></div></div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <AnimatePresence>
                  {results.length > 0 ? (
                    results.map((project) => (
                      <ProjectCard key={project._id} project={project} /> // Use _id from MongoDB for key
                    ))
                  ) : (
                    <NoProjectsFound />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            
            {!isLoading && totalPages > 1 && (
              <PaginationControls currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

// This SearchBar should be in its own file (e.g., src/components/SearchBar.tsx)
const SearchBar = ({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="relative w-full">
    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input
      type="text"
      placeholder="Search by keyword..."
      value={value}
      onChange={onChange}
      className="w-full rounded-full border border-border bg-background/50 py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  </div>
);

// This FacetSidebar should be in its own file
const FacetSidebar = ({ facets, onFacetClick, activeTags }: { facets: any[], onFacetClick: (tag: string) => void, activeTags: string[] }) => {
  if (!facets || facets.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="sticky top-24 rounded-2xl border border-border p-6">
      <h2 className="mb-4 text-xl font-bold text-foreground">Top Tags</h2>
      <ul className="flex flex-col gap-2">
        {facets.map(facet => (
          <li key={facet._id}>
            <button onClick={() => onFacetClick(facet._id)} disabled={activeTags.includes(facet._id)} className="flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:bg-primary/10 disabled:font-semibold">
              <span className="capitalize">{facet._id}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{facet.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};


// YOUR BEAUTIFUL, ORIGINAL PROJECT CARD (with backend data props)
const ProjectCard = ({ project }: { project: any }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border"
  >
    <div className="relative h-56 w-full overflow-hidden">
      <Image
        src={project.imageUrl || '/project-placeholder.png'} // Use imageUrl from your backend
        alt={project.projectName}
        fill
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
    <div className="flex flex-1 flex-col p-6">
      <h2 className="mb-2 text-2xl font-bold text-foreground">{project.projectName}</h2>
      <p className="mb-4 flex-1 text-sm text-muted-foreground">{project.description}</p>
      
      <div className="mb-6 flex flex-wrap gap-2">
        {project.tags.map((tag: string) => (
          <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <Link href={project.liveUrl || '#'} target="_blank" className="btn flex items-center gap-2 text-sm">
          <FaExternalLinkAlt /> Live Demo
        </Link>
        <Link href={project.githubUrl || '#'} target="_blank" className="text-muted-foreground transition-colors hover:text-primary">
          <FaGithub size={24} />
        </Link>
      </div>
    </div>
  </motion.div>
);

// YOUR ORIGINAL NO PROJECTS FOUND COMPONENT
const NoProjectsFound = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="col-span-full flex flex-col items-center justify-center py-24 text-center md:col-span-2"
  >
    <h3 className="text-2xl font-bold text-muted-foreground">No projects found.</h3>
    <p className="mt-2 text-muted-foreground">Try adjusting your search filters!</p>
  </motion.div>
);

// OUR PAGINATION COMPONENT
const PaginationControls = ({ currentPage, totalPages, setCurrentPage }: any) => (
  <div className="mt-12 flex justify-center items-center gap-4">
    <button onClick={() => setCurrentPage((p: number) => p - 1)} disabled={currentPage === 1} className="btn rounded-full border border-border px-6 py-2 text-sm hover:border-primary disabled:opacity-50">
      Previous
    </button>
    <span className="text-sm font-medium text-muted-foreground">
      Page {currentPage} of {totalPages}
    </span>
    <button onClick={() => setCurrentPage((p: number) => p + 1)} disabled={currentPage === totalPages} className="btn rounded-full border border-border px-6 py-2 text-sm hover:border-primary disabled:opacity-50">
      Next
    </button>
  </div>
);