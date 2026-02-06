"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeb3 } from "./providers";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import FloatingLines to avoid SSR issues with Three.js
const FloatingLines = dynamic(() => import("./components/FloatingLines"), {
  ssr: false,
  loading: () => null,
});

// Animated gradient text component
function GradientText({ children, className = "" }) {
  return (
    <span className={`bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient ${className}`}>
      {children}
    </span>
  );
}

// Floating particles background
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated card with tilt effect
function TiltCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
      className={`transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

// Magnetic button component
function MagneticButton({ children, onClick, className = "", disabled = false }) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className={`transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const router = useRouter();
  const { connectWallet, isConnected, isConnecting } = useWeb3();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* FloatingLines WebGL Animation Background */}
      <div className="fixed inset-0 z-0 opacity-60">
        <FloatingLines
          linesGradient={["#f97316", "#ec4899", "#a855f7", "#6366f1"]}
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={[4, 5, 3]}
          lineDistance={[6, 5, 4]}
          animationSpeed={0.8}
          interactive={true}
          bendRadius={4.0}
          bendStrength={-0.4}
          parallax={true}
          parallaxStrength={0.15}
          mixBlendMode="screen"
        />
      </div>

      {/* Animated background gradient following mouse */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(249, 115, 22, 0.08), transparent 80%)`,
        }}
      />

      {/* Mesh gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 right-1/3 w-[450px] h-[450px] bg-gradient-to-br from-emerald-500/8 via-teal-500/5 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Grid pattern with fade */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">WaaS</span>
        </div>

        <div className="flex items-center gap-4">
          <MagneticButton
            onClick={handleViewEvents}
            disabled={isConnecting}
            className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-all duration-300 border border-zinc-700 hover:border-zinc-500 disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "View Events"}
          </MagneticButton>
          <Link
            href="/admin/login"
            className="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/40"
          >
            <span className="relative z-10">Admin Login</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center mb-20">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-700/50 mb-8 animate-fade-in-up backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-zinc-400 text-sm">Powered by Zero-Knowledge Proofs</span>
          </div>

          {/* Main heading with gradient animation */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-200" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            Whitelist as a
            <br />
            <GradientText className="inline-block">Service</GradientText>
          </h1>

          {/* Subheading with typing effect style */}
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-400">
            Anonymous event whitelisting with{" "}
            <span className="text-purple-400 font-medium">ZK-powered</span> verification.
            <br className="hidden md:block" />
            No on-chain registration. <span className="text-orange-400 font-medium">Complete privacy</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in-up animation-delay-600">
            <Link
              href="/admin/login"
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create Event
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <MagneticButton
              onClick={handleViewEvents}
              disabled={isConnecting}
              className="px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-lg transition-all duration-300 border border-zinc-700 hover:border-zinc-500 hover:shadow-xl disabled:opacity-50"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                "Browse Events"
              )}
            </MagneticButton>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32 animate-fade-in-up animation-delay-800">
          {[
            { value: "100%", label: "Private" },
            { value: "Zero", label: "On-Chain Data" },
            { value: "ZK", label: "Proof Based" },
            { value: "∞", label: "Scalability" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300 hover:scale-105">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It <GradientText>Works</GradientText>
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Three simple steps to anonymous whitelisting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Event",
                description: "Admin creates event and chooses whitelisting mode: wallet-based or QR-code",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                ),
                gradient: "from-purple-500 to-pink-500",
              },
              {
                step: "02",
                title: "Build Merkle Tree",
                description: "Whitelisted identities are hashed into a Merkle tree. No on-chain registration.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                ),
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                step: "03",
                title: "ZK Verification",
                description: "User generates ZK proof of membership. Nullifier prevents double-use.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                gradient: "from-orange-500 to-amber-500",
              },
            ].map((item, i) => (
              <TiltCard key={i}>
                <div className="relative h-full p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl hover:border-zinc-700 transition-all duration-500 group overflow-hidden">
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  {/* Step number */}
                  <div className="absolute top-6 right-6 text-6xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why <GradientText>WaaS</GradientText>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "🔒",
                title: "Complete Privacy",
                description: "User identity never revealed. ZK proofs ensure anonymous verification.",
                color: "purple",
              },
              {
                icon: "⛓️",
                title: "No On-Chain Registration",
                description: "Users don't register anything on-chain. Only proof verification happens on-chain.",
                color: "emerald",
              },
              {
                icon: "🛡️",
                title: "Sybil Resistant",
                description: "Nullifier prevents double attendance. One proof per identity per event.",
                color: "orange",
              },
              {
                icon: "⚡",
                title: "Flexible Modes",
                description: "Choose wallet-based ZK or QR-code-based ZK membership per event.",
                color: "pink",
              },
            ].map((feature, i) => (
              <TiltCard key={i}>
                <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <TiltCard>
            <div className="p-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to get started?
                </h2>
                <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                  Create your first anonymous whitelist event in minutes
                </p>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30"
                >
                  Get Started
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </TiltCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8 text-center">
        <p className="text-zinc-500 text-sm">
          Built with <span className="text-orange-400">♥</span> using Zero-Knowledge Proofs & Merkle Trees
        </p>
      </footer>

      {/* Custom Animations CSS */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 0.5;
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
        .animation-delay-800 { animation-delay: 0.8s; opacity: 0; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
