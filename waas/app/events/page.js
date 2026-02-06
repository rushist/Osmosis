"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWeb3 } from "../providers";

const API_URL = "http://localhost:5000";

export default function EventsPage() {
  const router = useRouter();
  const { account, isConnected, disconnectWallet } = useWeb3();
  const [events, setEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
    fetchData();
  }, [isConnected, router, account]);

  const fetchData = async () => {
    await Promise.all([fetchEvents(), fetchUserRegistrations()]);
    setLoading(false);
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchUserRegistrations = async () => {
    if (!account) return;
    try {
      const res = await fetch(`${API_URL}/register/user/${account}`);
      const data = await res.json();
      setUserRegistrations(data);
    } catch (err) {
      console.error("Error fetching registrations:", err);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleRegisterClick = (event) => {
    if (event.approvalType === "qr") {
      // For QR events, show email modal
      setSelectedEvent(event);
      setShowEmailModal(true);
    } else {
      // For wallet events, register directly
      registerEvent(event, null);
    }
  };

  const registerEvent = async (event, userEmail) => {
    setIsRegistering(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id || event.id,
          walletAddress: account,
          email: userEmail,
        }),
      });
      await res.json();
      setStatusMessage(
        event.approvalType === "qr"
          ? "Registration sent! You'll receive a QR code via email when approved."
          : "Registration request sent. Waiting for admin approval."
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      // Reset modal
      setShowEmailModal(false);
      setSelectedEvent(null);
      setEmail("");
      // Refresh registrations
      fetchUserRegistrations();
    } catch (err) {
      console.error(err);
      setStatusMessage("Registration failed.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
    setIsRegistering(false);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (selectedEvent && email) {
      registerEvent(selectedEvent, email);
    }
  };

  // Get registration status for an event
  const getRegistrationStatus = (eventId) => {
    const registration = userRegistrations.find(
      (r) => (r.eventId?._id || r.eventId) === eventId
    );
    return registration;
  };

  // Poll for approval status updates
  useEffect(() => {
    if (!account) return;
    const interval = setInterval(fetchUserRegistrations, 5000);
    return () => clearInterval(interval);
  }, [account]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Email Modal */}
      {showEmailModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Enter Your Email</h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setSelectedEvent(null);
                  setEmail("");
                }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-4">
              For <span className="text-purple-400 font-medium">{selectedEvent.title}</span>,
              we&apos;ll send you a unique QR code via email for attendance verification.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 mb-4"
              />

              <button
                type="submit"
                disabled={isRegistering || !email}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "Register & Get QR via Email"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-4 flex items-center gap-3 backdrop-blur-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-400 font-medium">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">WaaS</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-zinc-300 font-medium text-sm">{truncateAddress(account)}</span>
          </div>
          <button
            onClick={() => {
              disconnectWallet();
              router.push("/");
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all text-sm border border-zinc-700"
          >
            Disconnect
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Available Events</h1>
          <p className="text-zinc-400">Check your whitelist status and register for events</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Events Available</h3>
            <p className="text-zinc-400">There are no events created yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventId = event._id || event.id;
              const registration = getRegistrationStatus(eventId);
              const isApproved = registration?.status === "approved";
              const isPending = registration?.status === "pending";
              const hasRegistered = !!registration;

              return (
                <div
                  key={eventId}
                  className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-all duration-300 group"
                >
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
                  </div>

                  {/* Event Info */}
                  <h3 className="text-xl font-semibold text-white mb-2">{event.title || event.name}</h3>
                  <p className="text-zinc-400 text-sm mb-2">
                    {event.description || "No description"}
                  </p>

                  {/* Event Details */}
                  {event.place && (
                    <p className="text-zinc-500 text-sm mb-1">📍 {event.place}</p>
                  )}
                  {event.date && (
                    <p className="text-zinc-500 text-sm mb-1">📅 {event.date}</p>
                  )}
                  {event.fee && (
                    <p className="text-zinc-500 text-sm mb-4">💰 {event.fee}</p>
                  )}

                  {/* Status Display */}
                  {isApproved && (
                    <div className="p-4 rounded-xl mb-4 bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-emerald-400 font-semibold">
                            {registration.adminMessage || "You are approved!"}
                          </p>
                          <p className="text-emerald-400/70 text-sm">
                            {event.approvalType === "qr"
                              ? "Check your email for QR code"
                              : "Your wallet is whitelisted"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="p-4 rounded-xl mb-4 bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-amber-400 font-medium">Pending Approval</p>
                          <p className="text-amber-400/70 text-sm">
                            {event.approvalType === "qr"
                              ? "QR will be emailed when approved"
                              : "Waiting for admin to approve"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!hasRegistered && event.approvalType === "qr" && (
                    <div className="p-4 rounded-xl mb-4 bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-purple-400 font-medium">QR Code Event</p>
                          <p className="text-purple-400/70 text-sm">Enter email to receive QR</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!hasRegistered && event.approvalType === "wallet" && (
                    <div className="p-4 rounded-xl mb-4 bg-zinc-800/50 border border-zinc-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-zinc-300 font-medium">Not Registered</p>
                          <p className="text-zinc-500 text-sm">Register to request approval</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Register Button - only show if not registered */}
                  {!hasRegistered && (
                    <button
                      onClick={() => handleRegisterClick(event)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] ${event.approvalType === "qr"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
                          : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white"
                        }`}
                    >
                      {event.approvalType === "qr" ? "Register with Email" : "Register for Event"}
                    </button>
                  )}

                  {isPending && (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-zinc-700 text-zinc-400 font-semibold cursor-not-allowed"
                    >
                      Awaiting Approval...
                    </button>
                  )}

                  {isApproved && (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 cursor-default"
                    >
                      ✓ Approved
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 py-8 text-center mt-20">
        <p className="text-zinc-500 text-sm">
          Secured by Zero-Knowledge Proofs
        </p>
      </footer>

      {/* CSS for animations */}
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
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
