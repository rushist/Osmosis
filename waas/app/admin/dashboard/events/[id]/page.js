"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

export default function EventDetailPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // For QR events
    const [attendeeEmail, setAttendeeEmail] = useState("");
    const [attendeeName, setAttendeeName] = useState("");

    // For Wallet events
    const [walletAddress, setWalletAddress] = useState("");

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const savedEvents = JSON.parse(localStorage.getItem("waas_events") || "[]");
        const foundEvent = savedEvents.find((e) => e.id === resolvedParams.id);
        if (foundEvent) {
            setEvent(foundEvent);
        }
        setLoading(false);
    }, [resolvedParams.id]);

    const updateEvent = (updatedEvent) => {
        const savedEvents = JSON.parse(localStorage.getItem("waas_events") || "[]");
        const updatedEvents = savedEvents.map((e) =>
            e.id === updatedEvent.id ? updatedEvent : e
        );
        localStorage.setItem("waas_events", JSON.stringify(updatedEvents));
        setEvent(updatedEvent);
    };

    const generateQRCode = async (data) => {
        try {
            return await QRCode.toDataURL(JSON.stringify(data));
        } catch (err) {
            console.error("Error generating QR code:", err);
            return null;
        }
    };

    const addAttendee = async () => {
        if (!attendeeEmail || !attendeeName) return;

        const attendeeId = Date.now().toString();
        const qrData = {
            eventId: event.id,
            eventName: event.name,
            attendeeId,
            attendeeName,
            attendeeEmail,
            timestamp: new Date().toISOString(),
        };

        const qrCodeUrl = await generateQRCode(qrData);

        const newAttendee = {
            id: attendeeId,
            name: attendeeName,
            email: attendeeEmail,
            qrCode: qrCodeUrl,
            addedAt: new Date().toISOString(),
        };

        const updatedEvent = {
            ...event,
            attendees: [...(event.attendees || []), newAttendee],
        };

        updateEvent(updatedEvent);
        setAttendeeEmail("");
        setAttendeeName("");
        setSuccessMessage(`QR code generated for ${attendeeName}! Email would be sent to ${attendeeEmail}`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    };

    const addWalletToWhitelist = () => {
        if (!walletAddress) return;

        // Validate wallet address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            alert("Please enter a valid Ethereum wallet address");
            return;
        }

        const newWallet = {
            id: Date.now().toString(),
            address: walletAddress,
            approvedAt: new Date().toISOString(),
        };

        const updatedEvent = {
            ...event,
            whitelistedWallets: [...(event.whitelistedWallets || []), newWallet],
        };

        updateEvent(updatedEvent);
        setWalletAddress("");
        setSuccessMessage(`Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} has been approved! ✓`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    };

    const removeAttendee = (attendeeId) => {
        const updatedEvent = {
            ...event,
            attendees: event.attendees.filter((a) => a.id !== attendeeId),
        };
        updateEvent(updatedEvent);
    };

    const removeWallet = (walletId) => {
        const updatedEvent = {
            ...event,
            whitelistedWallets: event.whitelistedWallets.filter((w) => w.id !== walletId),
        };
        updateEvent(updatedEvent);
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
                            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
                            <span
                                className={`px-3 py-1 rounded-lg text-xs font-semibold ${event.approvalType === "qr"
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    }`}
                            >
                                {event.approvalType === "qr" ? "QR Code" : "Wallet Whitelist"}
                            </span>
                        </div>
                        <p className="text-zinc-400">{event.description || "No description"}</p>
                    </div>
                </div>
            </div>

            {/* QR Code Event */}
            {event.approvalType === "qr" && (
                <div className="space-y-6">
                    {/* Add Attendee Form */}
                    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Add Attendee & Generate QR</h2>
                        <p className="text-zinc-400 text-sm mb-4">
                            Enter attendee details to generate a unique QR code. An email will be sent with the QR code.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                value={attendeeName}
                                onChange={(e) => setAttendeeName(e.target.value)}
                                placeholder="Attendee Name"
                                className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                            />
                            <input
                                type="email"
                                value={attendeeEmail}
                                onChange={(e) => setAttendeeEmail(e.target.value)}
                                placeholder="Attendee Email"
                                className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                            />
                        </div>
                        <button
                            onClick={addAttendee}
                            disabled={!attendeeName || !attendeeEmail}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            Generate QR & Send Email
                        </button>
                    </div>

                    {/* Attendees List */}
                    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Attendees ({event.attendees?.length || 0})
                        </h2>
                        {event.attendees?.length === 0 ? (
                            <p className="text-zinc-500 text-center py-8">No attendees added yet</p>
                        ) : (
                            <div className="space-y-4">
                                {event.attendees?.map((attendee) => (
                                    <div
                                        key={attendee.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700"
                                    >
                                        {/* QR Code Preview */}
                                        <div className="w-16 h-16 rounded-lg bg-white p-1">
                                            <img src={attendee.qrCode} alt="QR Code" className="w-full h-full" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{attendee.name}</p>
                                            <p className="text-zinc-400 text-sm">{attendee.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={attendee.qrCode}
                                                download={`qr-${attendee.name}.png`}
                                                className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-all"
                                                title="Download QR"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                            <button
                                                onClick={() => removeAttendee(attendee.id)}
                                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                title="Remove"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Wallet Whitelist Event */}
            {event.approvalType === "wallet" && (
                <div className="space-y-6">
                    {/* Add Wallet Form */}
                    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Whitelist Wallet Address</h2>
                        <p className="text-zinc-400 text-sm mb-4">
                            Enter a wallet address to approve. The user will see &ldquo;You are approved!&rdquo; when they check their status.
                        </p>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                placeholder="0x..."
                                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                            />
                            <button
                                onClick={addWalletToWhitelist}
                                disabled={!walletAddress}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve Wallet
                            </button>
                        </div>
                    </div>

                    {/* Whitelisted Wallets */}
                    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Approved Wallets ({event.whitelistedWallets?.length || 0})
                        </h2>
                        {event.whitelistedWallets?.length === 0 ? (
                            <p className="text-zinc-500 text-center py-8">No wallets approved yet</p>
                        ) : (
                            <div className="space-y-3">
                                {event.whitelistedWallets?.map((wallet) => (
                                    <div
                                        key={wallet.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-white font-mono">{wallet.address}</p>
                                                <p className="text-zinc-500 text-xs">
                                                    Approved {new Date(wallet.approvedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeWallet(wallet.id)}
                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                            title="Remove"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
