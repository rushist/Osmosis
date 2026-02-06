"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">WaaS</span>
        </div>
        <Link
          href="/admin/login"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25"
        >
          Admin Login
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Powered by Zero-Knowledge Proofs
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Whitelist as a
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"> Service</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Anonymous event whitelisting with ZK-powered verification.
            No on-chain registration. Complete privacy preservation.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin/login"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-orange-500/25"
            >
              Create Event →
            </Link>
            <Link
              href="/verify"
              className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-lg transition-all duration-300 border border-zinc-700 hover:border-zinc-600"
            >
              Verify Attendance
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-white text-center mb-4">How It Works</h2>
          <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
            Anonymous whitelisting with cryptographic guarantees
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Event</h3>
              <p className="text-zinc-400 text-sm">
                Admin creates event and chooses whitelisting mode: <strong className="text-purple-400">Wallet-based</strong> or <strong className="text-emerald-400">QR-code</strong> (via email)
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Build Merkle Tree</h3>
              <p className="text-zinc-400 text-sm">
                All whitelisted identities (wallets or QR tokens) are hashed into a <strong className="text-emerald-400">Merkle tree</strong>. No on-chain registration.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">ZK Verification</h3>
              <p className="text-zinc-400 text-sm">
                User generates <strong className="text-orange-400">ZK proof</strong> of membership. Verifier checks proof validity + nullifier (prevents double-use).
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why WaaS?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Complete Privacy</h3>
                <p className="text-zinc-400 text-sm">User identity never revealed. ZK proofs ensure anonymous verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">No On-Chain Registration</h3>
                <p className="text-zinc-400 text-sm">Users don&apos;t register anything on-chain. Only proof verification happens on-chain.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Sybil Resistant</h3>
                <p className="text-zinc-400 text-sm">Nullifier prevents double attendance. One proof per identity per event.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Flexible Modes</h3>
                <p className="text-zinc-400 text-sm">Choose wallet-based ZK or QR-code-based ZK membership per event.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 py-8 text-center">
        <p className="text-zinc-500 text-sm">
          Built with Zero-Knowledge Proofs & Merkle Trees
        </p>
      </footer>
    </div>
  );
}
