/**
 * Workshop configuration types and default values.
 * This file is BROWSER-SAFE — it does NOT import anything from db/ or server-only modules.
 */

export const DEFAULT_WORKSHOP_ID = "workshop_ai_cloud_masterclass";

export type WorkshopConfig = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  dateText: string;
  timeText: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  priceText: string;
  badgeText: string;
  ctaText: string;
  bannerImage: string;
  displayDelaySeconds: number;
  dismissalSnoozeHours: number;
  enabled: boolean;
};

export const DEFAULT_WORKSHOP_CONFIG: WorkshopConfig = {
  id: DEFAULT_WORKSHOP_ID,
  title: "Full-Stack AI & Cloud Masterclass 2026",
  subtitle: "Build Production Next.js Apps & Deploy Scalable AI Agents",
  description:
    "Join Google & top industry engineers for an intensive 2-day live interactive workshop. Learn how to architect, build, and deploy production full-stack systems with hands-on mentoring.",
  dateText: "Saturday & Sunday, Oct 10-11, 2026",
  timeText: "10:00 AM – 4:00 PM IST (Live)",
  location: "Live Interactive (Zoom + Discord)",
  mode: "Remote",
  priceText: "FREE (Limited 100 Seats)",
  badgeText: "🚀 UPCOMING LIVE WORKSHOP",
  ctaText: "Reserve Your Spot",
  bannerImage: "/images/dashboard-promo.png",
  displayDelaySeconds: 3,
  dismissalSnoozeHours: 24,
  enabled: true,
};
