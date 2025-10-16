// src/components/project-search/SearchBar.tsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
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