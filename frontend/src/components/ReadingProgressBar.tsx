// src/components/ReadingProgressBar.tsx
"use client";

import { motion, useScroll } from 'framer-motion';

export default function ReadingProgressBar() {
  // The useScroll hook tracks the scroll position of the page.
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 origin-left bg-primary"
      // The scaleX property is directly linked to the scroll progress.
      // It will go from 0 (top of page) to 1 (bottom of page).
      style={{ scaleX: scrollYProgress }}
    />
  );
}