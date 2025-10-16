"use client";

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import Image from 'next/image';
import Footer from '@/components/Footer';
import * as THREE from 'three';
import { SkillCard } from '@/components/SkillCard';
import { FaCode, FaPaintBrush } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);

  // Isolate scroll animations to the hero section for better performance and accuracy.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Smooth the scroll-based animations using useSpring for a more natural feel.
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "50%"]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.5], [1, 0]), springConfig);

  // Apply native smooth scrolling behavior for anchor links.
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Sync body background color with the current theme from CSS variables.
  useEffect(() => {
    const updateBackgroundColor = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const backgroundColor = rootStyle.getPropertyValue('--background').trim();
      document.body.style.backgroundColor = backgroundColor;
    };
    updateBackgroundColor(); // Set initial color

    // Observe theme changes (e.g., light/dark mode) and update the color.
    const observer = new MutationObserver(updateBackgroundColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'], // Watch for common theme toggle attributes
    });
    return () => observer.disconnect();
  }, []);

  // Setup and manage the interactive 3D background scene.
  useEffect(() => {
    const mountNode = threeMountRef.current;
    if (!mountNode) return;

    // --- Basic Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Enable transparency
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Set background to transparent
    
    // Style and mount the canvas
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1'; // Place it behind all content
    renderer.domElement.style.pointerEvents = 'none'; // Allow clicking through the canvas
    mountNode.appendChild(renderer.domElement);

    // --- Theme-Aware Grid ---
    const getThemeColor = () => {
      const root = document.documentElement;
      const isDark = root.getAttribute('data-theme') === 'dark';
      return isDark ? '#ffffff' : '#000000';
    };
    
    const gridHelper = new THREE.GridHelper(30, 30, getThemeColor(), getThemeColor());
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Update grid color automatically on theme change.
    const themeObserver = new MutationObserver(() => {
      const color = getThemeColor();
      gridHelper.material.color.set(color);
      (particlesMaterial as any).color.set(color);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    // --- Floating Particles ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.01,
      color: getThemeColor(),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Mouse Interaction ---
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Animate particles
      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = mouse.y * 0.1;
      particlesMesh.rotation.y += mouse.x * 0.1;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup Logic ---
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      themeObserver.disconnect();
      mountNode.removeChild(renderer.domElement);
      // Dispose of Three.js objects to prevent memory leaks
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      gridHelper.geometry.dispose();
      gridHelper.material.dispose();
      renderer.dispose();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Offset for fixed navbar, adjust if needed
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition }); // Relies on smooth behavior set in useEffect
    }
  };

  const floatingPlanetVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 20, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div ref={threeMountRef} className="min-h-screen relative overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-background" style={{ zIndex: -3 }} />
      <div className="fixed inset-0 -z-20">
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.35,
            backgroundImage: `radial-gradient(circle, rgba(var(--accent-rgb), 0.25) 1px, transparent 1px)`,
            backgroundSize: '18px 18px'
          }}
        />
        <motion.div
          variants={floatingPlanetVariants}
          animate="animate"
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-xl"
        />
        <motion.div
          variants={floatingPlanetVariants}
          animate="animate"
          transition={{ delay: 5 }}
          className="absolute bottom-1/4 left-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-xl"
        />
      </div>

      {/* Hero Section */}
      <motion.div ref={heroRef} style={{ y, opacity }} className="relative z-10">
        <div className="container mx-auto px-6 py-32">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto">
            <div className="text-left flex-1">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text cyber-text"
              >
                Welcome to My Portfolio
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl font-mono text-accent mb-8"
              >
                <span className="text-primary">$ </span>
                <TypeAnimation
                  sequence={['> Hi, I\'m Aryan', 2000, '> Full-Stack Developer', 2000, '> Creative Coder', 2000]}
                  wrapper="span" speed={50} repeat={Infinity}
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-4 mt-8"
              >
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-lg bg-accent text-background hover:bg-accent/80 transition-colors duration-300 font-mono"
                  onClick={() => scrollToSection('projects')}
                >
                  $ View Projects
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-lg border border-accent hover:bg-accent/10 transition-colors duration-300 font-mono"
                  onClick={() => scrollToSection('contact')}
                >
                  $ Contact Me
                </motion.button>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="relative flex-1 flex justify-center items-center"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
                className="relative w-72 h-72 md:w-80 md:h-80 mx-auto"
              >
                {[1.5, 2, 2.5].map(scale => (
                  <div key={scale} className="absolute inset-0 rounded-full border border-accent/10 animate-pulse" style={{ transform: `scale(${scale})` }} />
                ))}
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-accent/50 group">
                  <Image src="/profile.jpg" alt="Aryan's Profile Picture" fill className="object-cover transition-transform duration-300 group-hover:scale-110" priority />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>


{/* Other Sections (remain below the parallax hero) */}
<div className="relative z-0 space-y-24 md:space-y-32">
  {/* Skills Section */}
  <section id="skills" className="relative overflow-hidden py-20">
    {/* Background Glow */}
    <div
      aria-hidden="true"
      className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full  blur-3xl"
    />
    <div className="container mx-auto px-4">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 items-center gap-16 lg:grid-cols-3"
      >
        {/* Left Column: Title & Description */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
          className="lg:col-span-1"
        >
          <h2 className="gradient-text cyber-text text-4xl font-bold">
            Technical Expertise
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            I leverage a modern, full-stack toolkit to build high-performance applications from concept to deployment.
          </p>
        </motion.div>

        {/* Right Column: Skill Cards */}
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:col-span-2"
        >
          <SkillCard
            icon={<FaCode />}
            title="Frontend Development"
            description="Crafting responsive and interactive user interfaces with a focus on performance and user experience."
            skills={['React', 'Next.js', 'TypeScript', 'Tailwind CSS']}
          />
          <SkillCard
            icon={<FaPaintBrush />}
            title="UI/UX & Animation"
            description="Designing intuitive layouts and bringing them to life with fluid animations and engaging micro-interactions."
            skills={['Framer Motion', 'GSAP', 'Three.js', 'Figma']}
          />
        </motion.div>
      </motion.div>
    </div>
  </section>

        {/* Projects Section */}
        <section id="projects" className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center mb-12 gradient-text cyber-text"
            >
              Featured Projects
            </motion.h2>
            <FeaturedProjectsGrid />
            <div className="mt-10 text-center">
              <Link href="/projects" className="btn inline-flex items-center rounded-full px-6 py-2 border border-border hover:border-primary hover:text-primary transition-colors">
                View all projects
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 text-center">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center mb-6 gradient-text cyber-text"
            >
              Get In Touch
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto mb-8 text-text/80"
            >
              I'm currently open to new opportunities and collaborations. Feel free to reach out!
            </motion.p>
            <motion.a 
              href="mailto:aryangulhane6@gmail.com"
              initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-3 rounded-lg border border-accent hover:bg-accent/10 transition-colors duration-300 font-mono"
            >
              $ Say Hello
            </motion.a>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

// Lightweight featured projects pulled from the projects page data
const allProjects = [
  {
    title: 'Cyber Dashboard',
    description: 'A futuristic data visualization dashboard built with Next.js, featuring real-time data streams and complex animations.',
    image: '/project1.jpg',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    links: { live: '#', repo: '#' },
  },
  {
    title: 'AI Content Generator',
    description: 'A SaaS platform that leverages AI to generate marketing copy, blog posts, and social media updates.',
    image: '/project2.jpg',
    tags: ['React', 'Node.js', 'AI/ML', 'MongoDB'],
    links: { live: '#', repo: '#' },
  },
  {
    title: 'E-commerce Platform',
    description: 'A full-featured e-commerce site with a custom CMS, payment integration, and a modern, responsive UI.',
    image: '/project3.jpg',
    tags: ['Next.js', 'Stripe', 'Sanity', 'TypeScript'],
    links: { live: '#', repo: '#' },
  },
];

function FeaturedProjectsGrid() {
  const featured = allProjects.slice(0, 2);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {featured.map((p) => (
        <div key={p.title} className="glass rounded-lg overflow-hidden group border border-accent/20">
          <div className="relative h-48 md:h-64 bg-accent/20">
            <Image src={p.image} alt={p.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-accent transition-colors font-mono">{p.title}</h3>
            <p className="text-text/80 mb-4 font-mono">{p.description}</p>
            <div className="flex flex-wrap gap-2">
              {p.tags.slice(0, 3).map((t) => (
                <span key={t} className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-sm font-mono border border-accent/20">{t}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
    
  );
}
