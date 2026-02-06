"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/app/providers";
import WalletButton from "@/components/WalletButton";

export default function AdminLogin() {
    const { isConnected } = useWeb3();
    const router = useRouter();

    useEffect(() => {
        if (isConnected) {
            router.push("/admin/dashboard");
        }
    }, [isConnected, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 shadow-2xl">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg shadow-orange-500/20">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">WaaS Admin</h1>
                        <p className="text-zinc-400">Whitelist as a Service</p>
                    </div>

                    {/* Connect Section */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-white mb-2">Admin Login</h2>
                            <p className="text-zinc-500 text-sm">
                                Connect your wallet to access the admin dashboard
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <WalletButton />
                        </div>

                        {/* Info */}
                        <div className="mt-6 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-zinc-300">
                                        Make sure you have MetaMask installed in your browser.
                                    </p>
                                    <a
                                        href="https://metamask.io/download/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-orange-400 hover:text-orange-300 transition-colors mt-1 inline-block"
                                    >
                                        Download MetaMask →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-zinc-600 text-sm mt-6">
                    Powered by Blockchain Technology
                </p>
            </div>
        </div>
    );
}
