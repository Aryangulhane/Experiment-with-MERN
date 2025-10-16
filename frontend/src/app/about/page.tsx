"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from 'next/link'; 
// Added FaGraduationCap for the timeline
import { FaReact, FaNodeJs, FaDownload, FaEnvelope, FaGraduationCap } from "react-icons/fa";
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiMongodb } from "react-icons/si";
// Background and hero components from homepage to match visual language
import Scene3D from "@/components/Scene3D";
import Footer from "@/components/Footer";

// Reusable Framer Motion Variants for clean, staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// --- Page Component ---
export default function AboutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const skills = [
    { name: "React & Next.js", level: 90, icon: <SiNextdotjs className="text-white" /> },
    { name: "TypeScript", level: 85, icon: <SiTypescript className="text-primary" /> },
    { name: "Node.js", level: 80, icon: <FaNodeJs className="text-green-500" /> },
    { name: "Tailwind CSS", level: 95, icon: <SiTailwindcss className="text-primary" /> },
    { name: "MongoDB & Databases", level: 75, icon: <SiMongodb className="text-green-500" /> },
    { name: "UI/UX & Animation", level: 85, icon: <FaReact className="text-primary" /> },
  ];

  if (!isMounted) {
    return <AboutPageSkeleton />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground relative">
      {/* Hero Section - Text Focused & Futuristic */}
      <motion.section
        className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Subtle background gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(40%_100%_at_50%_0%,rgba(var(--primary-rgb),0.1)_0%,rgba(var(--primary-rgb),0)_100%)]"
        />

        <div className="mx-auto max-w-4xl space-y-8 relative z-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div>
              <motion.h1 variants={itemVariants} className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
                <span className="block text-accent text-lg font-medium">Hi, I&apos;m Aryan</span>
                <span className="block mt-2 gradient-text">Engineer in Brain & Human in Heart</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="mt-4 text-base text-muted-foreground sm:text-lg">
                I am a Student, facinated about the Technologies Currently working on Wed Developent and Artificial Intelligence and Machine Learning 
              </motion.p>

              <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-4">
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="btn animated-border group flex items-center gap-2 px-6 py-2 text-sm font-semibold">
                  <FaDownload className="transition-transform group-hover:scale-110" /> Resume
                </a>
                <Link href="/contact" className="btn group flex items-center gap-2 rounded-full border border-border px-6 py-2 text-sm font-semibold hover:border-primary hover:text-primary">
                <FaEnvelope className="transition-transform group-hover:translate-x-1" /> Contact
                </Link>
              </motion.div>
            </div>

            {/* Decorative glass card with tech icons to the right */}
            <motion.div variants={itemVariants} className="order-first md:order-last flex items-center justify-center">
              <div className="glass w-56 rounded-xl p-6 text-center border border-border shadow-lg">
                <div className="mb-3 text-sm font-medium text-muted-foreground">Core Technologies</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="tech-icon bg-primary/10 rounded-full p-3">
                    <SiNextdotjs className="text-xl text-white" />
                  </div>
                  <div className="tech-icon bg-primary/10 rounded-full p-3">
                    <SiTypescript className="text-xl text-primary" />
                  </div>
                  <div className="tech-icon bg-primary/10 rounded-full p-3">
                    <FaReact className="text-xl text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">Fast. Thoughtful. Accessible.</div>
              </div>
            </motion.div>
          </div>
          {/* Futuristic stats strip */}
          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass rounded-lg p-4 text-center border border-border">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-sm text-muted-foreground">Time when started exploration</div>
            </div>
            <div className="glass rounded-lg p-4 text-center border border-border">
              <div className="text-3xl font-bold">4+</div>
              <div className="text-sm text-muted-foreground">Projects worked on</div>
            </div>
            <div className="glass rounded-lg p-4 text-center border border-border">
              <div className="text-3xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">Open Source Contributions</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        className="bg-card/50 px-4 py-20 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-7xl">
          <motion.h2 variants={itemVariants} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            My <span className="text-primary">Technical Toolkit</span>
          </motion.h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <motion.div
                key={skill.name}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass cursor-pointer rounded-xl border border-border p-6 transition-colors hover:border-primary/50"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                    {skill.icon}
                  </div>
                  <span className="text-lg font-semibold">{skill.name}</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Experience & Education Timeline */}
      <motion.section
        className="px-4 py-20 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-3xl">
          <motion.h2 variants={itemVariants} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            My <span className="text-primary">Journey</span>
          </motion.h2>

          <div className="relative border-l-2 border-primary/20">
            {/* Experience Item */}
            <TimelineItem
              title="Senior Full-Stack Developer"
              subtitle="Tech Solutions Inc. • 2022 - Present"
              description="Led development of a SaaS platform using Next.js and TypeScript, improving performance by 40%. Mentored junior developers and established CI/CD pipelines."
              icon={<FaNodeJs className="h-4 w-4 text-primary-foreground" />}
            />
            {/* Education Item */}
            <TimelineItem
              title="B.Tech in Computer Science"
              subtitle="MIT ADT • 2025 - 2029 (Expected)"
              description="Pursuing a B.Tech degree with a focus on AI and web technologies. Actively participating in hackathons and coding clubs, with a goal of contributing to open-source projects."
              icon={<FaGraduationCap className="h-4 w-4 text-primary-foreground" />}
            />
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// --- Helper Components ---

interface TimelineItemProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

function TimelineItem({ title, subtitle, description, icon }: TimelineItemProps) {
  return (
    <motion.div variants={itemVariants} className="relative mb-10 ml-8">
      <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-8 ring-background">
        {icon}
      </span>
      <div className="glass rounded-xl border border-border p-6 transition-colors duration-300 hover:border-accent/50">
        <h3 className="mb-1 text-xl font-bold text-foreground">{title}</h3>
        <p className="mb-3 text-sm font-normal leading-none text-muted-foreground">{subtitle}</p>
        <p className="text-base font-normal text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

// A more accurate skeleton component
function AboutPageSkeleton() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-24">
      <div className="space-y-24">
        {/* Hero Skeleton */}
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8">
          <div className="h-16 w-3/4 rounded-lg bg-muted/50"></div>
          <div className="h-8 w-full rounded-lg bg-muted/50"></div>
          <div className="h-8 w-5/6 rounded-lg bg-muted/50"></div>
          <div className="flex gap-6 pt-4">
            <div className="h-12 w-44 rounded-full bg-primary/20"></div>
            <div className="h-12 w-44 rounded-full bg-muted/50"></div>
          </div>
        </div>

        {/* Skills Section Skeleton */}
        <div>
          <div className="mx-auto mb-12 h-10 w-1/3 rounded-lg bg-muted/50"></div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted/50"></div>)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
  
}