"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/app/providers";
import dynamic from "next/dynamic";

// Dynamically import FloatingLines
const FloatingLines = dynamic(() => import("@/app/components/FloatingLines"), {
    ssr: false,
    loading: () => null,
});

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isConnected, account, disconnectWallet } = useWeb3();
    const API_URL = "https://waas-3.onrender.com";

    useEffect(() => {
        if (!isConnected) {
            router.push("/");
            return;
        }

        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/events`);
                if (!res.ok) throw new Error("Failed to fetch events");
                const data = await res.json();
                
                // Filter events created by the connected wallet
                const userEvents = data.filter(
                    (event) => event.createdBy && event.createdBy.toLowerCase() === account.toLowerCase()
                );
                
                setEvents(userEvents);
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [isConnected, router]);

    const stats = [
        {
            name: "Total Events",
            value: events.length,
            icon: "calendar",
            gradient: "from-orange-500 to-pink-500",
        },
        {
            name: "QR Events",
            value: events.filter((e) => e.approvalType === "qr").length,
            icon: "qr",
            gradient: "from-purple-500 to-pink-500",
        },
        {
            name: "Wallet Events",
            value: events.filter((e) => e.approvalType === "wallet").length,
            icon: "wallet",
            gradient: "from-emerald-500 to-teal-500",
        },
    ];

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            case "ended":
                return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
            case "upcoming":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            default:
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        }
    };

    const getApprovalBadge = (type) => {
        if (type === "qr") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    QR
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Wallet
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
            {/* FloatingLines Background */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <FloatingLines
                    linesGradient={["#f97316", "#ec4899"]}
                    enabledWaves={["bottom"]}
                    lineCount={[3]}
                    lineDistance={[5]}
                    animationSpeed={0.4}
                    interactive={false}
                    mixBlendMode="screen"
                />
            </div>

            {/* Gradient overlay */}
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/70 to-zinc-950 pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-zinc-800/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span
                        className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
                    >
                        OSMOSIS
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-zinc-300 text-sm">{truncateAddress(account)}</span>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                        Disconnect
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1
                            className="text-4xl font-bold text-white mb-2"
                            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
                        >
                            Dashboard
                        </h1>
                        <p className="text-zinc-500">Manage your whitelist events</p>
                    </div>
                    <Link
                        href="/admin/dashboard/events/new"
                        className="group flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="group-hover:tracking-wide transition-all duration-300">New Event</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            className="group bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-6 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500 text-sm mb-1">{stat.name}</p>
                                    <p className="text-4xl font-bold text-white">{loading ? "..." : stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                    {stat.icon === "calendar" && (
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                    {stat.icon === "qr" && (
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    )}
                                    {stat.icon === "wallet" && (
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Events List */}
                <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800/50">
                        <h2 className="text-xl font-semibold text-white">Your Events</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-zinc-500">Loading events...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-zinc-400 mb-4">No events yet</p>
                            <Link
                                href="/admin/dashboard/events/new"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm transition-all hover:scale-105"
                            >
                                Create your first event
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800/50">
                            {events.map((event) => (
                                <Link
                                    key={event._id || event.id}
                                    href={`/admin/dashboard/events/${event._id || event.id}`}
                                    className="flex items-center justify-between p-6 hover:bg-zinc-800/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Event Image or Placeholder */}
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {event.image ? (
                                                <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-white font-medium group-hover:text-orange-400 transition-colors">
                                                {event.title}
                                            </h3>
                                            <p className="text-zinc-500 text-sm">
                                                {new Date(event.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Approval Type Badge */}
                                        {getApprovalBadge(event.approvalType)}

                                        {/* Status Badge */}
                                        <span className={`px-3 py-1 rounded-lg text-xs border ${getStatusColor(event.status || "active")}`}>
                                            {event.status || "Active"}
                                        </span>

                                        {/* Arrow */}
                                        <svg className="w-5 h-5 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
