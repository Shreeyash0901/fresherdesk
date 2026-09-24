"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Phone,
  User,
  Mail,
  AlertCircle,
  X,
  Lock,
} from "lucide-react";
import {
  startWorkshopLeadAction,
  completeWorkshopLeadAction,
} from "@/app/actions/workshop-leads";
import {
  DEFAULT_WORKSHOP_CONFIG,
  type WorkshopConfig,
} from "@/lib/workshop-config-shared";
import { Input } from "@/components/ui/input";



// Session-scoped: popup re-appears on every page refresh
const SESSION_KEY_DISMISSED = "fd_workshop_popup_dismissed";
// Lead resume data persists across sessions in localStorage
const STORAGE_KEY_ACTIVE_LEAD = "fd_workshop_active_lead_id";
const STORAGE_KEY_SAVED_PHONE = "fd_workshop_saved_phone";


export function WorkshopPopup({
  config = DEFAULT_WORKSHOP_CONFIG,
}: {
  config?: WorkshopConfig;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "form" | "success">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);

  // Form Fields for Step 2
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("College Student / Fresh Graduate");

  // UX State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Display timer logic on Mount
  // Popup always shows 3 seconds after a page load/refresh.
  // sessionStorage dismissal only lasts the current tab session.
  useEffect(() => {
    if (!config.enabled) return;

    try {
      // Only skip if already dismissed in this session (this tab/window)
      const dismissedThisSession = sessionStorage.getItem(SESSION_KEY_DISMISSED);
      if (dismissedThisSession) return;

      // Check if user previously completed step 1 (persists across refreshes)
      const savedLeadId = localStorage.getItem(STORAGE_KEY_ACTIVE_LEAD);
      const savedPhone = localStorage.getItem(STORAGE_KEY_SAVED_PHONE);
      if (savedLeadId && savedPhone) {
        setLeadId(savedLeadId);
        setPhone(savedPhone);
        setStep("form");
      }

      const timer = setTimeout(() => {
        setIsOpen(true);
      }, (config.displayDelaySeconds || 3) * 1000);

      return () => clearTimeout(timer);
    } catch {
      // Ignore storage access errors in iframe/restricted modes
    }
  }, [config]);

  // Handle Close / Dismissal — only for the current session
  function handleDismiss() {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY_DISMISSED, "1");
    } catch {
      // Ignore
    }
  }

  // Handle Step 1: Mobile Submit
  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await startWorkshopLeadAction(trimmedPhone, countryCode, config.id);

      if (res.success && res.leadId) {
        setLeadId(res.leadId);
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE_LEAD, res.leadId);
          localStorage.setItem(STORAGE_KEY_SAVED_PHONE, res.phone || trimmedPhone);
        } catch {}
        // Smooth transition to Step 2
        setStep("form");
      } else {
        setError(res.error || "Failed to verify phone number. Please try again.");
      }
    } catch {
      setError("Network connection issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Step 2: Complete Registration Form
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId) {
      setError("Session expired. Please restart registration.");
      setStep("phone");
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setError("Please provide your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your current city.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await completeWorkshopLeadAction({
        leadId,
        name: name.trim(),
        email: email.trim(),
        city: city.trim(),
        occupation,
        workshopId: config.id,
      });

      if (res.success) {
        setStep("success");
      } else {
        setError(res.error || "Could not complete registration. Please try again.");
      }
    } catch {
      setError("Network issue occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="workshop-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close workshop announcement"
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-slate-900/40 text-white hover:bg-slate-900/70 transition-colors backdrop-blur-xs"
        >
          <X size={17} />
        </button>

        {/* Visual Workshop Banner Header */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 pb-6 overflow-hidden">
          {/* Subtle glow circles */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

          {/* Badge & Workshop Label */}
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles size={13} className="text-emerald-300" />
              {config.badgeText}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white">
              {config.priceText}
            </span>
          </div>

          <h2
            id="workshop-popup-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-white relative z-10 leading-snug"
          >
            {config.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 relative z-10 max-w-lg leading-relaxed line-clamp-2">
            {config.subtitle}
          </p>

          {/* Event Quick Meta Pill strip */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-[11px] text-slate-200 border-t border-white/10 pt-3 relative z-10">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={13} className="text-emerald-400 shrink-0" />
              {config.dateText}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock size={13} className="text-emerald-400 shrink-0" />
              {config.timeText}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              {config.location}
            </span>
          </div>
        </div>

        {/* Modal Body / Funnel Steps */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Fast Mobile Capture */}
          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="ws-phone-input"
                  className="block text-xs font-bold text-slate-800 mb-1"
                >
                  Enter your mobile number to reserve your spot:
                </label>
                <p className="text-[12px] text-slate-500 mb-3">
                  We&apos;ll send the session link, curriculum kit, and workshop reminders directly to you.
                </p>

                {/* Country Code + Phone input */}
                <div className="flex rounded-lg border border-slate-300 shadow-2xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white overflow-hidden transition-all">
                  <div className="bg-slate-50 px-3 py-2.5 border-r border-slate-200 flex items-center text-xs font-bold text-slate-700 select-none">
                    <span className="mr-1">🇮🇳</span>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-slate-800 cursor-pointer"
                      aria-label="Country Code"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+971">+971 (UAE)</option>
                    </select>
                  </div>
                  <input
                    id="ws-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    autoFocus
                    disabled={isSubmitting}
                    className="flex-1 px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full button button-green text-sm font-bold flex items-center justify-center gap-2 py-3 rounded-lg shadow-sm transition-all active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Saving your details...</span>
                ) : (
                  <>
                    <span>Continue to Registration</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-1">
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                <span>No spam. We&apos;ll only contact you regarding this workshop.</span>
              </div>
            </form>
          )}

          {/* STEP 2: Full Workshop Details Form */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="pl-8 text-xs h-9 bg-slate-50"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="pl-8 text-xs h-9 bg-slate-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Current City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune / Bengaluru"
                      className="pl-8 text-xs h-9 bg-slate-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Background / Role
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-emerald-500"
                    disabled={isSubmitting}
                  >
                    <option value="College Student (Final Year)">College Student (Final Year)</option>
                    <option value="College Student (1st - 3rd Year)">College Student (1st - 3rd Year)</option>
                    <option value="Recent Graduate (0-1 YOE)">Recent Graduate (0-1 YOE)</option>
                    <option value="Working Professional (1-3 YOE)">Working Professional (1-3 YOE)</option>
                    <option value="Career Switcher / Other">Career Switcher / Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="button button-outline compact text-xs"
                  disabled={isSubmitting}
                >
                  I&apos;ll finish later
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button button-green compact text-xs flex-1 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 size={15} />
                  <span>{isSubmitting ? "Confirming Spot..." : "Complete Free Registration"}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                By continuing, you agree to receive session details via email & WhatsApp.
              </p>
            </form>
          )}

          {/* STEP 3: Success Confirmation Screen */}
          {step === "success" && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Registration Confirmed 🎉
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  You&apos;re All Set for the Masterclass!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  We&apos;ve reserved your seat for <strong>{config.title}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 max-w-sm mx-auto text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-semibold">{config.dateText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span className="font-semibold">{config.timeText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Platform:</span>
                  <span className="font-semibold">{config.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Confirmation Sent To:</span>
                  <span className="font-semibold font-mono">{phone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="button button-navy text-xs font-semibold px-8 py-2.5 rounded-lg shadow-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
