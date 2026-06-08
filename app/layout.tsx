import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import SessionProviderWrapper from "./components/SessionProviderWrapper";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Inventario TI — Boiero",
  description: "Gestión de inventario de hardware de TI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${ibmMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#06101C] flex flex-col text-[#E8F4FF]">
        <SessionProviderWrapper>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
