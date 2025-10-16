"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the 3D content with no SSR
const Scene3DContent = dynamic(() => import('./Scene3DContent'), {
  ssr: false,
  loading: () => (
    <section className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg" />
  ),
});

export default function Scene3D() {
  return (
    <section className="h-[400px] w-full">
      <Suspense fallback={<section className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg" />}>
        <Scene3DContent />
      </Suspense>
    </section>
  );
} 