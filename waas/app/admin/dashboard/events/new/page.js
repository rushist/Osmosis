"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        approvalType: "qr", // 'qr' or 'wallet'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create event object
        const newEvent = {
            id: Date.now().toString(),
            ...formData,
            createdAt: new Date().toISOString(),
            attendees: [],
            whitelistedWallets: [],
        };

        // Save to localStorage
        const existingEvents = JSON.parse(localStorage.getItem("waas_events") || "[]");
        existingEvents.push(newEvent);
        localStorage.setItem("waas_events", JSON.stringify(existingEvents));

        // Redirect to events page
        setTimeout(() => {
            router.push("/admin/dashboard/events");
        }, 500);
    };

    return (
        <div className="p-8 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
                <p className="text-zinc-400">Set up a new whitelist event</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 space-y-6">
                    {/* Event Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Event Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter event name"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter event description"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300 resize-none"
                        />
                    </div>

                    {/* Approval Type */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                            Approval Type *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* QR Code Option */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, approvalType: "qr" })}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${formData.approvalType === "qr"
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${formData.approvalType === "qr"
                                        ? "bg-purple-500"
                                        : "bg-zinc-700"
                                    }`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                </div>
                                <h4 className={`font-semibold mb-1 ${formData.approvalType === "qr" ? "text-purple-400" : "text-white"
                                    }`}>
                                    QR Code
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    Each attendee gets a unique QR code for verification
                                </p>
                            </button>

                            {/* Wallet Option */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, approvalType: "wallet" })}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${formData.approvalType === "wallet"
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${formData.approvalType === "wallet"
                                        ? "bg-emerald-500"
                                        : "bg-zinc-700"
                                    }`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h4 className={`font-semibold mb-1 ${formData.approvalType === "wallet" ? "text-emerald-400" : "text-white"
                                    }`}>
                                    Wallet Whitelist
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    Approve attendees by their wallet addresses
                                </p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.name}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] shadow-lg shadow-orange-500/25"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Event...
                        </span>
                    ) : (
                        "Create Event"
                    )}
                </button>
            </form>
        </div>
    );
}
