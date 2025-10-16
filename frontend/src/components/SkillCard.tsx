// src/components/SkillCard.tsx
"use client";
import { useRef, MouseEvent } from "react";
import { motion } from "framer-motion";

interface SkillCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  skills: string[];
}

export const SkillCard = ({ icon, title, description, skills }: SkillCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current?.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current?.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="group relative rounded-2xl border border-border bg-secondary/30 p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.1), transparent 80%)`,
        }}
      />
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-bold font-mono text-foreground">{title}</h3>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-xs font-mono border border-primary/20 text-primary">
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillCard;
