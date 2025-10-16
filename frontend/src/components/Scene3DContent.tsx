"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function Scene3DContent() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Camera position
    camera.position.z = 5;

    // Add grid with enhanced visibility
    const gridSize = 30;
    const gridDivisions = 30;
    const getThemeMono = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000');
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, getThemeMono(), getThemeMono());
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: getThemeMono(),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    // Create mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse movement effect
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let mouseX = 0;
    let mouseY = 0;

    // Create shadow plane
    const shadowPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2);
    const shadowGeometry = new THREE.CircleGeometry(0.5, 32);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: getThemeMono(),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.visible = false;
    scene.add(shadow);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      mouseX = mouse.x;
      mouseY = mouse.y;
    };

    window.addEventListener('mousemove', handleMouseMove);
    const obs = new MutationObserver(() => {
      const c = getThemeMono();
      (gridHelper.material as any).color.set(c);
      (particlesMaterial as any).color.set(c);
      (shadowMaterial as any).color.set(c);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.ray.intersectPlane(shadowPlane, new THREE.Vector3());
      
      if (intersects) {
        shadow.position.copy(intersects);
        shadow.visible = true;
      } else {
        shadow.visible = false;
      }

      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;

      // Mouse interaction
      particlesMesh.rotation.x += mouseY * 0.0005;
      particlesMesh.rotation.y += mouseX * 0.0005;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      obs.disconnect();
      mountRef.current?.removeChild(renderer.domElement);
      scene.remove(particlesMesh);
      scene.remove(gridHelper);
      scene.remove(shadow);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
} 