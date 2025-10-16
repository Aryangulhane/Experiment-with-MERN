// src/components/Footer.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaTwitter, FaArrowUp } from "react-icons/fa";

const navItems = [
  { name: 'About', path: '/about' },
  { name: 'Projects', path: '/projects' },
  { name: 'Blog', path: '/blog' },
];

const socialLinks = [
  { name: 'GitHub', icon: FaGithub, url: 'https://github.com/Aryangulhane' },
  { name: 'LinkedIn', icon: FaLinkedin, url: 'https://www.linkedin.com/in/aryan-gulhane' },
  { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com/AryanGulhane3' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className=" relative mt-24  py-12 px-8"
    >
      {/* Back to Top Button */}
      <motion.button
        onClick={handleScrollTop}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </motion.button>

      <div className="container mx-auto">
        {/* Top Section: Logo & Navigation */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* New Monogram Logo */}
          <Link href="/" className="group flex items-center gap-2 text-2xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary transition-all duration-300 group-hover:bg-primary">
              <span className="gradient-text transition-all duration-300 group-hover:text-background">AG</span>
            </div>
            <span className="cyber-text text-foreground">Aryan Gulhane</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <hr className="my-8 border-border/50" />

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col-reverse items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} Aryan Gulhane. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                whileHover={{ y: -3, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-2xl text-muted-foreground transition-colors hover:text-primary"
              >
                <social.icon />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}