// src/components/project-search/FacetSidebar.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface FacetSidebarProps {
  facets: { _id: string; count: number }[];
  onFacetClick: (tag: string) => void;
  activeTags: string[];
}

export const FacetSidebar = ({ facets, onFacetClick, activeTags }: FacetSidebarProps) => {
  if (!facets || facets.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="sidebar-section rounded-2xl border border-border p-6"
    >
      <h2 className="mb-4 text-xl font-bold text-foreground">Top Tags</h2>
      <ul className="flex flex-col gap-2">
        {facets.map(facet => (
          <li key={facet._id}>
            <button
              onClick={() => onFacetClick(facet._id)}
              disabled={activeTags.includes(facet._id)}
              className="flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:bg-primary/10 disabled:font-semibold"
            >
              <span className="capitalize">{facet._id}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {facet.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};