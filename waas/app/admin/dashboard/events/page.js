"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_URL}/events`);
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
        setLoading(false);
    };

    const deleteEvent = async (id) => {
        try {
            await fetch(`${API_URL}/events/${id}`, { method: "DELETE" });
            setEvents(events.filter((e) => (e._id || e.id) !== id));
        } catch (err) {
            console.error("Error deleting event:", err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
                    <p className="text-zinc-400">Manage your whitelist events</p>
                </div>
                <Link
                    href="/admin/dashboard/events/new"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Event
                </Link>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
                    <p className="text-zinc-400 mb-6">Create your first whitelist event to get started</p>
                    <Link
                        href="/admin/dashboard/events/new"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold transition-all duration-300 hover:from-orange-400 hover:to-amber-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Your First Event
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const eventId = event._id || event.id;
                        return (
                            <div
                                key={eventId}
                                className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-300 group"
                            >
                                {/* Event Image */}
                                {event.image && (
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Approval Type Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${event.approvalType === "qr"
                                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                }`}
                                        >
                                            {event.approvalType === "qr" ? "QR Code" : "Wallet Whitelist"}
                                        </span>
                                        <button
                                            onClick={() => deleteEvent(eventId)}
                                            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Event Info */}
                                    <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>

                                    {/* Event Details */}
                                    <div className="space-y-1 mb-4">
                                        {event.place && (
                                            <p className="text-zinc-400 text-sm flex items-center gap-2">
                                                <span>📍</span> {event.place}
                                            </p>
                                        )}
                                        {event.date && (
                                            <p className="text-zinc-400 text-sm flex items-center gap-2">
                                                <span>📅</span> {event.date} {event.time && `at ${event.time}`}
                                            </p>
                                        )}
                                        {event.fee && (
                                            <p className="text-zinc-400 text-sm flex items-center gap-2">
                                                <span>💰</span> {event.fee}
                                            </p>
                                        )}
                                    </div>

                                    {/* View Event Link */}
                                    <Link
                                        href={`/admin/dashboard/events/${eventId}`}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all duration-300 font-medium"
                                    >
                                        Manage Event
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
