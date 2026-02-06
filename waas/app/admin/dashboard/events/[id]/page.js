"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

export default function EventDetailPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchEvent();
        fetchRegistrations();
    }, [resolvedParams.id]);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`${API_URL}/events/${resolvedParams.id}`);
            const data = await res.json();
            setEvent(data);
        } catch (err) {
            console.error("Error fetching event:", err);
        }
        setLoading(false);
    };

    const fetchRegistrations = async () => {
        try {
            const res = await fetch(`${API_URL}/register/event/${resolvedParams.id}`);
            const data = await res.json();
            setRegistrations(data);
        } catch (err) {
            console.error("Error fetching registrations:", err);
        }
    };

    const approveRegistration = async (registrationId, approvalType) => {
        try {
            const message = approvalType === "qr"
                ? "Please check your email for QR code"
                : "You are approved!";

            await fetch(`${API_URL}/register/approve/${registrationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            // Refresh registrations
            fetchRegistrations();

            setSuccessMessage(
                approvalType === "qr"
                    ? "Approved! Email notification sent."
                    : "Approved! User will see 'You are approved!'"
            );
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        } catch (err) {
            console.error("Error approving registration:", err);
        }
    };

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="p-8">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-12 text-center">
                    <p className="text-zinc-400 mb-4">Event not found</p>
                    <button
                        onClick={() => router.push("/admin/dashboard/events")}
                        className="text-orange-400 hover:text-orange-300"
                    >
                        ← Back to Events
                    </button>
                </div>
            </div>
        );
    }

    const pendingRegistrations = registrations.filter(r => r.status === "pending");
    const approvedRegistrations = registrations.filter(r => r.status === "approved");

    return (
        <div className="p-8">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-6 right-6 z-50 animate-slide-in">
                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-4 flex items-center gap-3 backdrop-blur-xl">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-emerald-400 font-medium">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push("/admin/dashboard/events")}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Events
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                            <span
                                className={`px-3 py-1 rounded-lg text-xs font-semibold ${event.approvalType === "qr"
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    }`}
                            >
                                {event.approvalType === "qr" ? "QR Code" : "Wallet Whitelist"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-400 text-sm">
                            {event.place && <span>📍 {event.place}</span>}
                            {event.date && <span>📅 {event.date}</span>}
                            {event.fee && <span>💰 {event.fee}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Pending Approvals */}
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">
                            Pending Approvals ({pendingRegistrations.length})
                        </h2>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Requires Action
                        </span>
                    </div>

                    {pendingRegistrations.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">No pending approvals</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingRegistrations.map((reg) => (
                                <div
                                    key={reg._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-mono">{truncateAddress(reg.walletAddress)}</p>
                                            <p className="text-zinc-500 text-xs">
                                                Requested {new Date(reg.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => approveRegistration(reg._id, event.approvalType)}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${event.approvalType === "qr"
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
                                                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
                                            }`}
                                    >
                                        {event.approvalType === "qr" ? "Approve & Send QR Email" : "Approve"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Approved List */}
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Approved ({approvedRegistrations.length})
                    </h2>

                    {approvedRegistrations.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">No approved registrations yet</p>
                    ) : (
                        <div className="space-y-3">
                            {approvedRegistrations.map((reg) => (
                                <div
                                    key={reg._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-mono">{truncateAddress(reg.walletAddress)}</p>
                                            <p className="text-emerald-400 text-xs">{reg.adminMessage}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        Approved
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for animation */}
            <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
