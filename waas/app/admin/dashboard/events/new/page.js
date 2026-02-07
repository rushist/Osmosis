"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/app/providers";

const API_URL = "https://waas-3.onrender.com";

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

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
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Crazy Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-flow" />

        {/* Mega Particles */}
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-mega-float"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${Math.random() > 0.5 ? "168, 85, 247" : "251, 146, 60"}, ${Math.random() * 0.5 + 0.2})`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
            }}
          />
        ))}

        {/* Massive Gradient Blobs */}
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-transparent rounded-full blur-[120px] animate-blob-mega" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-transparent rounded-full blur-[120px] animate-blob-mega animation-delay-3000" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/15 via-blue-500/15 to-transparent rounded-full blur-[100px] animate-blob-mega animation-delay-6000" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 overflow-y-auto">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all duration-300 mb-4 group"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <h1 className="text-4xl font-bold text-white mb-2 animate-slide-in-left">
                Create New Event
              </h1>
              <p className="text-zinc-400 animate-slide-in-left animation-delay-100">
                Set up a new whitelist event
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-shake">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 space-y-6 animate-fade-in-up">
                {/* Event Title */}
                <div className="animate-fade-in-up animation-delay-200">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter event title"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>

                {/* Place */}
                <div className="animate-fade-in-up animation-delay-300">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Place *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.place}
                    onChange={(e) =>
                      setFormData({ ...formData, place: e.target.value })
                    }
                    placeholder="Enter event location"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-2 gap-4 animate-fade-in-up animation-delay-400">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Fee */}
                <div className="animate-fade-in-up animation-delay-500">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Fee
                  </label>
                  <input
                    type="text"
                    value={formData.fee}
                    onChange={(e) =>
                      setFormData({ ...formData, fee: e.target.value })
                    }
                    placeholder="e.g., Free, $10, 0.01 ETH"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>

                {/* Image Upload */}
                <div className="animate-fade-in-up animation-delay-600">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Event Image
                  </label>

                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300 group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <svg
                          className="w-6 h-6 text-zinc-500 group-hover:text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-zinc-400 text-sm group-hover:text-zinc-300">
                        Click to upload event image
                      </p>
                      <p className="text-zinc-600 text-xs mt-1">
                        JPG, PNG, GIF or WebP (max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-700 animate-scale-in">
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
                        className="absolute top-2 right-2 p-2 bg-zinc-900/80 rounded-lg text-zinc-400 hover:text-red-400 hover:scale-110 transition-all duration-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {formData.image && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-bounce-in">
                          <span className="text-emerald-400 text-xs font-medium">
                            ✓ Uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Approval Type */}
                <div className="animate-fade-in-up animation-delay-700">
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Approval Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* QR Code Option */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, approvalType: "qr" })
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                        formData.approvalType === "qr"
                          ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/30"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-300 ${
                          formData.approvalType === "qr"
                            ? "bg-purple-500"
                            : "bg-zinc-700"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                      </div>
                      <h4
                        className={`font-semibold mb-1 ${
                          formData.approvalType === "qr"
                            ? "text-purple-400"
                            : "text-white"
                        }`}
                      >
                        QR Code
                      </h4>
                      <p className="text-sm text-zinc-400">Send QR via email</p>
                    </button>

                    {/* Wallet Option */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, approvalType: "wallet" })
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                        formData.approvalType === "wallet"
                          ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/30"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-300 ${
                          formData.approvalType === "wallet"
                            ? "bg-emerald-500"
                            : "bg-zinc-700"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <h4
                        className={`font-semibold mb-1 ${
                          formData.approvalType === "wallet"
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        Wallet Whitelist
                      </h4>
                      <p className="text-sm text-zinc-400">Approve wallets</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isUploading ||
                  !formData.title ||
                  !formData.place ||
                  !formData.date ||
                  !formData.time
                }
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/50 animate-fade-in-up animation-delay-800"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Event...
                  </span>
                ) : (
                  "Create Event"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - INSANE Animated Preview */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 relative">
          {/* Rotating Rings Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[500px] h-[500px] border-2 border-purple-500/10 rounded-full animate-spin-slow"></div>
            <div className="absolute w-[400px] h-[400px] border-2 border-pink-500/10 rounded-full animate-spin-reverse"></div>
            <div className="absolute w-[300px] h-[300px] border-2 border-orange-500/10 rounded-full animate-spin-slow"></div>
          </div>

          {/* Main 3D Card Container */}
          <div
            className="relative w-full max-w-md animate-float-3d"
            style={{ perspective: "1000px" }}
          >
            {/* Mega Glow */}
            <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 via-pink-500/30 via-orange-500/30 to-cyan-500/30 rounded-[3rem] blur-[80px] animate-pulse-rainbow"></div>

            {/* Holographic Card */}
            <div className="relative bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-zinc-700/50 overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-700 animate-tilt-3d">
              {/* Holographic Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer-rainbow"></div>

              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-scanline"></div>

              {/* Header Image Area */}
              <div className="relative h-64 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 overflow-hidden">
                {imagePreview ? (
                  <div className="relative h-full animate-scale-in">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover animate-ken-burns"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {/* Animated Placeholder */}
                    <div className="relative animate-float-slow">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-700/80 flex items-center justify-center backdrop-blur-sm border border-zinc-600/50 animate-pulse-glow">
                        <svg
                          className="w-12 h-12 text-zinc-600 animate-bounce-slow"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      {/* Orbiting Dots */}
                      <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-pink-500 rounded-full -translate-x-1/2"></div>
                        <div className="absolute left-0 top-1/2 w-2 h-2 bg-orange-500 rounded-full -translate-y-1/2"></div>
                        <div className="absolute right-0 top-1/2 w-2 h-2 bg-cyan-500 rounded-full -translate-y-1/2"></div>
                      </div>
                    </div>
                    <p className="absolute bottom-4 text-zinc-500 text-sm animate-pulse">
                      Your event image will appear here
                    </p>
                  </div>
                )}

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 animate-bounce-in">
                  <div
                    className={`px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-xl shadow-2xl border transform hover:scale-110 transition-all duration-300 ${
                      formData.approvalType === "qr"
                        ? "bg-purple-500/30 text-purple-300 border-purple-400/30 shadow-purple-500/50"
                        : "bg-emerald-500/30 text-emerald-300 border-emerald-400/30 shadow-emerald-500/50"
                    }`}
                  >
                    {formData.approvalType === "qr"
                      ? "📧 QR Code"
                      : "💳 Wallet"}
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
              </div>

              {/* Card Content */}
              <div className="p-8 relative">
                <h3 className="text-2xl font-bold text-white mb-4 animate-text-glow">
                  {formData.title || "Your Event Title"}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-zinc-400 ">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30 ">
                      <span className="text-lg">📍</span>
                    </div>
                    <span className="text-sm">
                      {formData.place || "Event Location"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-400 animate-slide-in-right animation-delay-200">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30">
                      <span className="text-lg">📅</span>
                    </div>
                    <span className="text-sm">
                      {formData.date || "Date"}{" "}
                      {formData.time && `at ${formData.time}`}
                    </span>
                  </div>

                  {formData.fee && (
                    <div className="flex items-center gap-3 text-zinc-400 animate-slide-in-right animation-delay-400">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-500/30 animate-pulse-glow animation-delay-200">
                        <span className="text-lg">💰</span>
                      </div>
                      <span className="text-sm">{formData.fee}</span>
                    </div>
                  )}
                </div>

                {/* Animated Button */}
                <button
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl relative overflow-hidden group ${
                    formData.approvalType === "qr"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/50"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/50"
                  }`}
                >
                  <span className="relative z-10">
                    {formData.approvalType === "qr"
                      ? "Register with Email"
                      : "Register for Event"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-purple-500/30 rounded-tl-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-orange-500/30 rounded-br-3xl animate-pulse-slow animation-delay-1000"></div>
            </div>

            {/* Energy Rings */}
            <div className="absolute inset-0 -m-6">
              <div className="absolute inset-0 border-2 border-purple-500/20 rounded-3xl animate-ping-slow"></div>
            </div>
            <div className="absolute inset-0 -m-12">
              <div className="absolute inset-0 border-2 border-pink-500/20 rounded-3xl animate-ping-slow animation-delay-500"></div>
            </div>
            <div className="absolute inset-0 -m-16">
              <div className="absolute inset-0 border-2 border-orange-500/20 rounded-3xl animate-ping-slow animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* INSANE CSS Animations */}
      <style jsx global>{`
        @keyframes mega-float {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30px) translateX(20px) rotate(90deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-15px) translateX(-20px) rotate(180deg);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-25px) translateX(15px) rotate(270deg);
            opacity: 0.4;
          }
        }
        .animate-mega-float {
          animation: mega-float 8s ease-in-out infinite;
        }

        @keyframes blob-mega {
          0%,
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(40px, -60px) scale(1.2) rotate(90deg);
          }
          50% {
            transform: translate(-40px, 40px) scale(0.85) rotate(180deg);
          }
          75% {
            transform: translate(60px, 20px) scale(1.1) rotate(270deg);
          }
        }
        .animate-blob-mega {
          animation: blob-mega 20s ease-in-out infinite;
        }

        @keyframes float-3d {
          0%,
          100% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: translateY(-15px) rotateX(5deg) rotateY(-5deg);
          }
          50% {
            transform: translateY(-8px) rotateX(-5deg) rotateY(5deg);
          }
          75% {
            transform: translateY(-12px) rotateX(3deg) rotateY(-3deg);
          }
        }
        .animate-float-3d {
          animation: float-3d 8s ease-in-out infinite;
        }

        @keyframes tilt-3d {
          0%,
          100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: perspective(1000px) rotateX(2deg) rotateY(2deg);
          }
        }
        .animate-tilt-3d {
          animation: tilt-3d 6s ease-in-out infinite;
        }

        @keyframes shimmer-rainbow {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shimmer-rainbow {
          animation: shimmer-rainbow 4s ease-in-out infinite;
        }

        @keyframes pulse-rainbow {
          0%,
          100% {
            opacity: 0.3;
            filter: hue-rotate(0deg) blur(80px);
          }
          25% {
            opacity: 0.5;
            filter: hue-rotate(90deg) blur(70px);
          }
          50% {
            opacity: 0.6;
            filter: hue-rotate(180deg) blur(90px);
          }
          75% {
            opacity: 0.4;
            filter: hue-rotate(270deg) blur(75px);
          }
        }
        .animate-pulse-rainbow {
          animation: pulse-rainbow 8s ease-in-out infinite;
        }

        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scanline {
          animation: scanline 3s linear infinite;
        }

        @keyframes ken-burns {
          0%,
          100% {
            transform: scale(1) translate(0, 0);
          }
          50% {
            transform: scale(1.1) translate(10px, -10px);
          }
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite;
        }

        @keyframes text-glow {
          0%,
          100% {
            text-shadow:
              0 0 10px rgba(251, 146, 60, 0.3),
              0 0 20px rgba(251, 146, 60, 0.2),
              0 0 30px rgba(251, 146, 60, 0.1);
          }
          50% {
            text-shadow:
              0 0 20px rgba(168, 85, 247, 0.4),
              0 0 30px rgba(168, 85, 247, 0.3),
              0 0 40px rgba(168, 85, 247, 0.2);
          }
        }
        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow:
              0 0 10px currentColor,
              0 0 20px currentColor;
            opacity: 0.6;
          }
          50% {
            box-shadow:
              0 0 20px currentColor,
              0 0 40px currentColor;
            opacity: 1;
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(200px)
              rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(200px)
              rotate(-360deg);
            opacity: 0;
          }
        }
        .animate-orbit {
          animation: orbit 8s linear infinite;
        }

        @keyframes float-random {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -25px) rotate(10deg);
          }
          50% {
            transform: translate(-15px, -40px) rotate(-5deg);
          }
          75% {
            transform: translate(10px, -15px) rotate(8deg);
          }
        }
        .animate-float-random {
          animation: float-random 6s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes grid-flow {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}
