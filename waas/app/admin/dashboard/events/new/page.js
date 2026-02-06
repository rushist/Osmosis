"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/app/providers";

const API_URL = "http://localhost:5000";

export default function CreateEventPage() {
    const router = useRouter();
    const { account } = useWeb3();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        place: "",
        date: "",
        time: "",
        fee: "",
        image: "",
        approvalType: "wallet",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState("");

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setIsUploading(true);
        setError("");

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("image", file);

            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formDataUpload,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            setFormData((prev) => ({ ...prev, image: data.url }));
            console.log("Image uploaded:", data.url);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image. Please try again.");
            setImagePreview("");
        }
        setIsUploading(false);
    };

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, image: "" }));
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    createdBy: account,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create event");
            }

            await response.json();
            router.push("/admin/dashboard/events");
        } catch (err) {
            console.error(err);
            setError("Failed to create event. Please try again.");
            setIsSubmitting(false);
        }
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

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 space-y-6">
                    {/* Event Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter event title"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                        />
                    </div>

                    {/* Place */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Place *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.place}
                            onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                            placeholder="Enter event location"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                        />
                    </div>

                    {/* Date and Time Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Time *
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Fee */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Fee
                        </label>
                        <input
                            type="text"
                            value={formData.fee}
                            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                            placeholder="e.g., Free, $10, 0.01 ETH"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Event Image
                        </label>

                        {!imagePreview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/50 transition-all duration-300"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-zinc-400 text-sm">
                                    Click to upload event image
                                </p>
                                <p className="text-zinc-600 text-xs mt-1">
                                    JPG, PNG, GIF or WebP (max 5MB)
                                </p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-zinc-700">
                                {isUploading && (
                                    <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                                            <span className="text-white">Uploading...</span>
                                        </div>
                                    </div>
                                )}
                                <img
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="w-full h-48 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-zinc-900/80 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                {formData.image && (
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                                        <span className="text-emerald-400 text-xs font-medium">✓ Uploaded</span>
                                    </div>
                                )}
                            </div>
                        )}
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
                                    Send QR via email
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
                                    Approve wallets
                                </p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !formData.title || !formData.place || !formData.date || !formData.time}
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
