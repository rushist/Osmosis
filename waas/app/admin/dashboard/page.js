"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Load events from localStorage
        const savedEvents = localStorage.getItem("waas_events");
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        }
    }, []);

    const stats = [
        {
            name: "Total Events",
            value: events.length,
            icon: "calendar",
            color: "from-orange-500 to-amber-500",
        },
        {
            name: "QR Events",
            value: events.filter((e) => e.approvalType === "qr").length,
            icon: "qr",
            color: "from-purple-500 to-pink-500",
        },
        {
            name: "Wallet Events",
            value: events.filter((e) => e.approvalType === "wallet").length,
            icon: "wallet",
            color: "from-emerald-500 to-teal-500",
        },
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-zinc-400">Welcome to your WaaS admin panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm mb-1">{stat.name}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                {stat.icon === "calendar" && (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                                {stat.icon === "qr" && (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                )}
                                {stat.icon === "wallet" && (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/admin/dashboard/events/new"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-semibold">Create New Event</p>
                            <p className="text-zinc-400 text-sm">Add a new whitelist event</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/dashboard/events"
                        className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-semibold">View All Events</p>
                            <p className="text-zinc-400 text-sm">Manage your existing events</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
