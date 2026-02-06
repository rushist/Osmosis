"use client";

import { useWeb3 } from "@/app/providers";

export default function WalletButton({ className = "" }) {
    const { account, isConnecting, error, connectWallet, disconnectWallet, isConnected } = useWeb3();

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (isConnected) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-emerald-400 font-medium">{truncateAddress(account)}</span>
                </div>
                <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all duration-300 border border-zinc-700 hover:border-zinc-600"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={connectWallet}
                disabled={isConnecting}
                className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
            >
                {/* MetaMask Fox Icon */}
                <svg className="w-6 h-6" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.66296 1L15.6869 10.809L13.3548 4.99099L2.66296 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M28.2295 23.5334L24.7346 28.872L32.2149 30.9323L34.3551 23.6501L28.2295 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.27271 23.6501L3.40175 30.9323L10.8821 28.872L7.39819 23.5334L1.27271 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.4706 14.5149L8.39209 17.6507L15.7968 17.9842L15.5477 9.94897L10.4706 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M25.1505 14.5149L19.9836 9.85803L19.8241 17.9842L27.2289 17.6507L25.1505 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.8821 28.872L15.3599 26.7199L11.4886 23.7027L10.8821 28.872Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20.2612 26.7199L24.7346 28.872L24.1325 23.7027L20.2612 26.7199Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <span className="relative z-10">
                    {isConnecting ? "Connecting..." : "Connect with MetaMask"}
                </span>

                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>

            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}
