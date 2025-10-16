// src/components/ClientLayout.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IntroAnimation from "@/components/IntroAnimation";
import { AnimatePresence, motion } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // This state determines if the intro has finished.
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    // Check session storage to see if the intro has already played in this session.
    // This prevents the animation from re-playing on every page navigation.
    if (sessionStorage.getItem("introPlayed")) {
      setIntroFinished(true);
    }
  }, []);

  // This function is passed to the IntroAnimation component.
  // When the animation completes, it updates the state and sets the session flag.
  const handleIntroComplete = () => {
    setIntroFinished(true);
    sessionStorage.setItem("introPlayed", "true");
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {introFinished ? (
          // KEY CONTENT: Shown after the intro is complete.
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar />
            <main>
              {children}
            </main>
            <Footer />
          </motion.div>
        ) : (
          // INTRO ANIMATION: Shown only if the intro has not yet played this session.
          <IntroAnimation key="intro-animation" onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>
    </>
  );
}