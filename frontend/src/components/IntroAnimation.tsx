// src/components/IntroAnimation.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";

// --- Framer Motion Variants ---
const containerVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  // A "shutter closing" effect for a cinematic exit
  exit: {
    clipPath: "inset(50% 0 50% 0)",
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
  },
};

// --- Main Component ---
export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [showIntro, setShowIntro] = useState(true);
  const [showText, setShowText] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // State to trigger exit animations

  useEffect(() => {
    // Sequence Timings
    const textTimer = setTimeout(() => setShowText(true), 1500);
    const exitTriggerTimer = setTimeout(() => setIsExiting(true), 4800);
    const mainTimer = setTimeout(() => setShowIntro(false), 5500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTriggerTimer);
      clearTimeout(mainTimer);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {showIntro && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Enhanced Background Effects */}
          <BackgroundRings />

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {/* Pass the exiting state to the logo to trigger its deconstruction */}
            <AGLogo isExiting={isExiting} />

            {/* Dynamic Loading Text */}
            <AnimatePresence>
              {showText && !isExiting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 font-mono text-sm tracking-widest text-muted-foreground"
                >
                  <TypeAnimation
                    sequence={[
                      "Initializing Kernel...",
                      1000,
                      "Compiling Asset Modules...",
                      1000,
                      "System Online. Welcome.",
                    ]}
                    wrapper="span"
                    speed={70}
                    cursor={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// --- Helper Components for a Cleaner Structure ---

// Component for the animated background rings
const BackgroundRings = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0 flex items-center justify-center"
  >
    <div className="relative h-[500px] w-[500px]">
      {/* Create 4 rings with staggered animations */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-primary/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1 + i * 0.3,
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </div>
);


// Enhanced SVG Logo Component with Exit Animation
const AGLogo = ({ isExiting }: { isExiting: boolean }) => {
  const drawVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { pathLength: { type: "spring", duration: 1.5, bounce: 0 }, opacity: { duration: 0.1 } },
    },
    // Define the exit animation for each path
    exit: {
      pathLength: 0,
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  };

  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      initial="hidden"
      animate={isExiting ? "exit" : "visible"} // Switch between visible and exit states
      className="stroke-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]"
    >
      <motion.path
        d="M 30 90 L 60 30 L 90 90"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={drawVariants}
      />
      <motion.path
        d="M 45 70 L 75 70"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={drawVariants}
      />
    </motion.svg>
  );
};