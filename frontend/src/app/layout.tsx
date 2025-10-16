// src/app/layout.tsx
import './globals.css';
import { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aryan's Portfolio",
  description: "A creative portfolio showcasing full-stack development projects.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <ClientLayout>
            <main className="relative z-10">
              {children}
            </main>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}