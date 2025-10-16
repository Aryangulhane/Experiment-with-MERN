// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from '@/context/ThemeContext'; // Ensure this path is correct
import { FiSun, FiMoon } from "react-icons/fi";

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Projects', path: '/projects' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/50 backdrop-blur-lg mx-4 mt-4 rounded-2xl border border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
           {/* New Monogram Logo */}
          <Link href="/" className="group flex items-center gap-2 text-2xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary transition-all duration-300 group-hover:bg-primary">
              <span className="gradient-text transition-all duration-300 group-hover:text-background">AG</span>
            </div>
            <span className="cyber-text text-foreground">Aryan Gulhane</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.path} path={item.path} currentPath={pathname}>
                {item.name}
              </NavLink>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <MenuButton
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentPath={pathname}
      />
    </>
  );
}

// --- Helper Components for a Cleaner Structure ---

// NavLink for Desktop
function NavLink({ path, currentPath, children }: { path: string, currentPath: string, children: React.ReactNode }) {
  const isActive = path === currentPath;
  return (
    <Link href={path} className="relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      {children}
      {isActive && (
        <motion.div
          layoutId="active-nav-link"
          className="animated-border absolute inset-0 -z-10 rounded-full bg-primary/20"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}

// Animated Mobile Menu Button (Hamburger/Cross)
function MenuButton({ isOpen, onClick }: { isOpen: boolean, onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative z-50 h-8 w-8 text-foreground transition-colors"
      aria-label="Toggle menu"
    >
      <motion.span
        className="absolute left-1/2 top-1/4 block h-0.5 w-6 bg-current"
        variants={{ open: { rotate: 45, y: 5 }, closed: { rotate: 0, y: 0 } }}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="absolute left-1/2 top-1/2 block h-0.5 w-6 -translate-y-1/2 bg-current"
        variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="absolute left-1/2 top-3/4 block h-0.5 w-6 bg-current"
        variants={{ open: { rotate: -45, y: -5 }, closed: { rotate: 0, y: 0 } }}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

// Full-screen Mobile Menu
function MobileMenu({ isOpen, onClose, currentPath }: { isOpen: boolean, onClose: () => void, currentPath: string }) {
  const menuVariants = {
    open: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2, ease: "easeOut" }
    },
    closed: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1, when: "afterChildren" }
    }
  };
  const itemVariants = {
    open: { y: 0, opacity: 1 },
    closed: { y: 20, opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
          className="glass fixed inset-0 z-40 flex flex-col items-center justify-center space-y-6 bg-background/80"
        >
          {navItems.map((item) => (
            <motion.div key={item.path} variants={itemVariants}>
              <Link
                href={item.path}
                onClick={onClose}
                className={`text-3xl font-semibold cyber-text ${
                  currentPath === item.path ? 'gradient-text' : 'text-foreground'
                }`}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
          <motion.div variants={itemVariants} className="pt-8">
            <ThemeToggle />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated Theme Toggle Button
function ThemeToggle() {
  const { theme, setTheme } = useTheme(); // Assuming your context provides `theme` and `setTheme`
  const nextTheme = theme.mode === 'dark' ? 'light' : 'dark';

  return (
    <motion.button
      onClick={() => setTheme(nextTheme)}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme.mode}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme.mode === 'dark' ? <FiSun /> : <FiMoon />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}