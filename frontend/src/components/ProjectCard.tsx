
// src/components/ProjectCard.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  repoUrl: string;
}

export const ProjectCard = ({ title, description, image, tags, liveUrl, repoUrl }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-2xl font-bold text-foreground">{title}</h3>
        <p className="mb-4 flex-1 text-sm text-muted-foreground">{description}</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <Link href={liveUrl} target="_blank" className="btn flex items-center gap-2 text-sm">
            <FaExternalLinkAlt /> Live Demo
          </Link>
          <Link href={repoUrl} target="_blank" className="text-muted-foreground transition-colors hover:text-primary">
            <FaGithub size={24} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};