"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeb3 } from "./providers";
import dynamic from "next/dynamic";

// Dynamically import FloatingLines to avoid SSR issues with Three.js
const FloatingLines = dynamic(() => import("./components/FloatingLines"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const router = useRouter();
  const { connectWallet, isConnected, isConnecting } = useWeb3();

  const handleViewEvents = async () => {
    if (isConnected) {
      router.push("/events");
    } else {
      const connected = await connectWallet();
      if (connected) {
        router.push("/events");
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col">
      {/* FloatingLines WebGL Animation Background */}
      <div className="fixed inset-0 z-0 opacity-40">
        <FloatingLines
          linesGradient={["#f97316", "#ec4899"]}
          enabledWaves={["middle", "bottom"]}
          lineCount={[4, 3]}
          lineDistance={[6, 5]}
          animationSpeed={0.6}
          interactive={true}
          bendRadius={4.0}
          bendStrength={-0.3}
          parallax={true}
          parallaxStrength={0.1}
          mixBlendMode="screen"
        />
      </div>

      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 pointer-events-none" />

      {/* Navigation - Minimal */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleViewEvents}
            disabled={isConnecting}
            className="px-5 py-2 text-zinc-400 hover:text-white transition-colors text-sm disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Events"}
          </button>
          <Link
            href="/admin/login"
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero - Full Screen, Centered, Minimal */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 -mt-20">
        {/* Main Content */}
        <div className="text-center">
          {/* WHITELIST - Big */}
          <h1
            className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none tracking-wider"
            style={{ fontFamily: " 'Bebas Neue', sans-serif" }}
          >
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              OSMOSIS
            </span>
          </h1>

          {/* as a Service - Smaller, below */}
          <p
            className="text-2xl md:text-3xl lg:text-4xl text-zinc-400 -mt-4 md:-mt-6 tracking-wide"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.2em" }}
          >
            WHITELIST as a <span className="text-white">SERVICE</span>
          </p>

          {/* Tagline - Minimal */}
          <p className="text-zinc-500 text-sm md:text-base mt-8 max-w-md mx-auto">
            Anonymous event whitelisting powered by Zero-Knowledge Proofs
          </p>

          {/* CTA Buttons - Minimal */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/admin/login"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Create Event
            </Link>
            <button
              onClick={handleViewEvents}
              disabled={isConnecting}
              className="px-8 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Browse Events"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-zinc-600 text-xs">
          ZK Proofs · Merkle Trees · Complete Privacy
        </p>
      </footer>
    </div>
  );
}
