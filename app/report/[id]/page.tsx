"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle,
  Copy,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Confetti from "../../../components/Confetti";
import { ReportData } from "../../../utils/mockData";

export default function ReportPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Total slides available: 8
  const TOTAL_SLIDES = 8;

  // Slideshow control
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedBio, setCopiedBio] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // Dynamic counter for the score gauge
  const [displayedScore, setDisplayedScore] = useState(0);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/report/${id}`);
      if (!res.ok) {
        throw new Error("Report not found");
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveSlide((prev) => Math.min(TOTAL_SLIDES - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Score Count-Up effect
  useEffect(() => {
    if (report && activeSlide === 0) {
      setDisplayedScore(0);
      const target = report.overallScore;
      const duration = 1500; // ms
      const steps = 30;
      const stepTime = duration / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += Math.ceil(target / steps);
        if (current >= target) {
          setDisplayedScore(target);
          clearInterval(timer);
          // If score is high (> 80), explode confetti!
          if (target > 80 && report.isUnlocked) {
            setConfettiActive(true);
          }
        } else {
          setDisplayedScore(current);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [report, activeSlide]);

  const handleCopyBio = () => {
    if (report) {
      navigator.clipboard.writeText(report.bioRewrite);
      setCopiedBio(true);
      setTimeout(() => setCopiedBio(false), 2000);
    }
  };

  // ── Share helpers ────────────────────────────────────────────────────────────

  /** Re-draws the share card into a Blob (PNG) without triggering a download. */
  const generateShareCardBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      if (!report) return reject(new Error("No report"));
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));

      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, "#020617");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.fillStyle = "rgba(124,58,237,0.12)";
      ctx.beginPath(); ctx.arc(150, 300, 350, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(236,72,153,0.12)";
      ctx.beginPath(); ctx.arc(900, 1600, 450, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#ffffff"; ctx.font = "bold 48px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("rizzmeter", 540, 160);
      ctx.font = "bold 64px sans-serif"; ctx.fillText("PROFILE SCORECARD", 540, 270);
      ctx.fillStyle = "#a78bfa"; ctx.font = "bold 36px sans-serif";
      ctx.fillText(`${report.profileType.toUpperCase()} REVIEW`, 540, 340);

      ctx.fillStyle = "rgba(15,23,42,0.7)";
      ctx.beginPath(); ctx.arc(540, 680, 200, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ec4899"; ctx.lineWidth = 14; ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 120px sans-serif";
      ctx.fillText(report.overallScore.toString(), 540, 700);
      ctx.fillStyle = "#94a3b8"; ctx.font = "bold 32px sans-serif";
      ctx.fillText("/ 100", 540, 770);

      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(140, 950, 800, 420);
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.strokeRect(140, 950, 800, 420);
      ctx.textAlign = "left";
      ctx.fillStyle = "#06b6d4"; ctx.font = "bold 32px sans-serif";
      ctx.fillText("⭐ TOP STRENGTH", 190, 1020);
      ctx.fillStyle = "#f8fafc"; ctx.font = "normal 28px sans-serif";
      ctx.fillText(report.greenFlags[0] || "Looks very approachable", 190, 1070);
      ctx.fillStyle = "#f43f5e"; ctx.font = "bold 32px sans-serif";
      ctx.fillText("🚨 BIGGEST RED FLAG", 190, 1180);
      ctx.fillStyle = "#f8fafc"; ctx.font = "normal 28px sans-serif";
      const rfText = report.redFlags[0] || "Bio looks too basic";
      ctx.fillText(rfText.length > 50 ? rfText.slice(0, 50) + "…" : rfText, 190, 1230);
      ctx.textAlign = "center"; ctx.fillStyle = "#94a3b8"; ctx.font = "bold 30px sans-serif";
      ctx.fillText("Compare and Roast Your Profile at rizzmeter.com", 540, 1750);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("toBlob failed"));
      }, "image/png");
    });

  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/report/${id}`
      : `https://rizzmeter.com/report/${id}`;

  const handleShareWhatsApp = () => {
    const text =
      `🔥 I just got my profile roasted by Rizzmeter!\n\n` +
      `My rizz score: *${report?.overallScore ?? "??"}/100*\n\n` +
      `Check yours 👉 ${reportUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareWithFile = async (platform: "instagram" | "snapchat") => {
    try {
      const blob = await generateShareCardBlob();
      const file = new File([blob], "rizzmeter_score.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Rizzmeter Score",
          text: `My rizz score: ${report?.overallScore ?? "??"}/100 🔥 Check yours at ${reportUrl}`,
        });
      } else {
        // Desktop fallback: download image + copy link
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objUrl; a.download = "rizzmeter_score.png"; a.click();
        URL.revokeObjectURL(objUrl);
        await navigator.clipboard.writeText(reportUrl);
        alert(
          platform === "instagram"
            ? "Image downloaded! Open Instagram Stories, pick the image, and paste the link. (Link copied to clipboard)"
            : "Image downloaded! Open Snapchat, attach the image, and paste the link. (Link copied to clipboard)"
        );
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Share error:", err);
    }
  };

  // Viral Share Card Builder
  const handleDownloadShareCard = () => {
    if (!report) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, "#020617");
    grad.addColorStop(0.5, "#0f172a");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Glowing Circles
    ctx.fillStyle = "rgba(124, 58, 237, 0.12)";
    ctx.beginPath();
    ctx.arc(150, 300, 350, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(236, 72, 153, 0.12)";
    ctx.beginPath();
    ctx.arc(900, 1600, 450, 0, Math.PI * 2);
    ctx.fill();

    // Rizzmeter Logo Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("rizzmeter", 540, 160);

    // Title Block
    ctx.fillStyle = "#ffffff";
    ctx.font = "extrabold 64px sans-serif";
    ctx.fillText("PROFILE SCORECARD", 540, 270);

    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`${report.profileType.toUpperCase()} REVIEW`, 540, 340);

    // Center circular Score Badge
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.beginPath();
    ctx.arc(540, 680, 200, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "extrabold 120px sans-serif";
    ctx.fillText(report.overallScore.toString(), 540, 700);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("/ 100", 540, 770);

    // Metrics grid
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(140, 950, 800, 420);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(140, 950, 800, 420);

    ctx.textAlign = "left";
    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("⭐ TOP STRENGTH", 190, 1020);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "normal 28px sans-serif";
    ctx.fillText(report.greenFlags[0] || "Looks very approachable", 190, 1070);

    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("🚨 BIGGEST RED FLAG", 190, 1180);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "normal 28px sans-serif";
    const redFlagText = report.redFlags[0] || "Bio looks too basic";
    ctx.fillText(redFlagText.length > 50 ? redFlagText.substring(0, 50) + "..." : redFlagText, 190, 1230);

    // Branding Footer
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "semibold 30px sans-serif";
    ctx.fillText("Compare and Roast Your Profile at rizzmeter.com", 540, 1750);

    // Download file link triggers
    const pngUrl = canvas.toDataURL("image/png");
    const dlLink = document.createElement("a");
    dlLink.href = pngUrl;
    dlLink.download = `rizzmeter_score_${report.id}.png`;
    dlLink.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#020617] text-white py-32">
        <div className="w-12 h-12 rounded-full border-4 border-t-brand-purple border-slate-800 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading audit report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#020617] text-white py-32 px-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">Report Error</h2>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-sm">
          {error || "We couldn't retrieve the report details."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const slides = [
    // Slide 0: Score & Teaser
    {
      title: "Profile Audit Score",
      content: (
        <div className="flex flex-col items-center justify-center flex-1 py-4 text-center">
          {/* Gauge display */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="100"
                className="stroke-slate-800/80 fill-none"
                strokeWidth="12"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="100"
                className="stroke-brand-pink fill-none shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                strokeWidth="14"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - report.overallScore / 100)}
                initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - report.overallScore / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-6xl font-black">{displayedScore}</span>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Overall Rizz</span>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Attractiveness</span>
                <span className="text-lg font-bold text-white">{report.attractiveness}%</span>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Trustworthiness</span>
                <span className="text-lg font-bold text-white">{report.trustworthiness}%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 text-left">
              <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider mb-2">First Impressions</h4>
              <ul className="space-y-1.5">
                {report.firstImpression.map((imp, index) => (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-brand-pink mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    // Slide 1: Impressions details
    {
      title: "General Vibes",
      content: (
        <div className="flex flex-col justify-center flex-1 py-4 space-y-6">
          <h3 className="text-2xl font-black text-white text-center">First impression counts. Here is yours.</h3>
          <div className="space-y-4">
            {report.firstImpression.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="glass-panel p-5 rounded-2xl border-slate-800 flex gap-4 items-center"
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-lg font-bold text-brand-cyan">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-200 font-medium flex-1">{v}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 2: AI Roast
    {
      title: "The AI Roast",
      content: (
        <div className="flex flex-col justify-center flex-1 py-4 text-center relative">
          <div className="absolute top-[-5%] left-[10%] w-[120px] h-[120px] bg-red-900/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-950/30 border border-red-900/40 rounded-full text-xs font-extrabold text-rose-500 mb-6 mx-auto animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current" /> Warning: Unfiltered Roast
          </div>

          <div className="glass-panel rounded-2xl border-rose-900/20 bg-rose-950/5 p-6 md:p-8 relative">
            {/* Background pattern */}
            <span className="absolute top-2 right-4 text-slate-800/20 text-6xl font-black select-none pointer-events-none">🔥</span>
            <p className="text-base md:text-lg text-slate-100 font-medium italic leading-relaxed font-sans select-all">
              &quot;{report.roast}&quot;
            </p>
          </div>
        </div>
      )
    },
    // Slide 3: Photo Ranking
    {
      title: "Photo Audit & Ranks",
      content: (
        <div className="flex flex-col justify-center flex-1 py-4">
          <h3 className="text-xl font-black text-center mb-6">Photo Ranking Breakdown</h3>
          <div className="space-y-4 overflow-y-auto max-h-[360px] no-scrollbar">
            {report.photoRanking.map((photo, i) => (
              <div key={i} className="glass-panel rounded-xl p-4 border-slate-800/80 flex gap-4">
                <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-center min-w-[70px]">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Photo</span>
                  <span className="text-xl font-extrabold text-white">#{photo.index}</span>
                  <span className={`text-xs font-black mt-1 ${photo.score >= 80 ? "text-emerald-400" : photo.score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                    {photo.score}%
                  </span>
                </div>
                <div className="flex-1 text-left flex flex-col justify-center">
                  <p className="text-xs text-slate-300 font-semibold mb-1">{photo.review}</p>
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-brand-purple" /> {photo.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 4: Bio Rewrite
    {
      title: "Bio Glow-Up",
      content: (
        <div className="flex flex-col justify-center flex-1 py-4 space-y-4">
          <h3 className="text-xl font-black text-center">Original vs rewritten bio</h3>

          <div className="space-y-3">
            {/* Original */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-left">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Your original bio</span>
              <p className="text-xs text-slate-400 italic font-mono">{report.originalBio || "No bio detected in screenshot."}</p>
            </div>

            {/* Rewritten */}
            <div className="p-4 rounded-xl bg-purple-950/10 border border-brand-purple/20 text-left relative overflow-hidden">
              <span className="block text-[10px] text-brand-purple font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> AI Bio rewrite (Gen-Z optimized)
              </span>
              <p className="text-xs text-slate-200 font-medium whitespace-pre-line leading-relaxed">
                {report.bioRewrite}
              </p>

              <button
                onClick={handleCopyBio}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-purple text-slate-400 hover:text-white transition-colors"
                title="Copy rewritten bio"
              >
                {copiedBio ? <span className="text-[10px] text-emerald-400 font-bold px-1">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )
    },
    // Slide 5: Flags
    {
      title: "Flags Scan",
      content: (
        <div className="flex flex-col justify-center flex-1 py-4 space-y-4">
          <h3 className="text-xl font-black text-center mb-2">Platform green & red flags</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Green */}
            <div className="p-4 rounded-xl bg-emerald-950/5 border border-emerald-900/25 text-left">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 fill-emerald-950" /> Green Flags
              </h4>
              <ul className="space-y-2">
                {report.greenFlags.map((flag, index) => (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✔</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red */}
            <div className="p-4 rounded-xl bg-rose-950/5 border border-rose-900/25 text-left">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 fill-rose-950" /> Red Flags
              </h4>
              <ul className="space-y-2">
                {report.redFlags.map((flag, index) => (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">✖</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    // Slide 6: Glow-Up Plan
    {
      title: "Actionable Glow-Up",
      content: (
        <div className="flex flex-col justify-center flex-1 py-4">
          <h3 className="text-xl font-black text-center mb-6">Profile glow-up steps</h3>
          <div className="space-y-3.5">
            {report.glowUpPlan.map((step, i) => (
              <div key={i} className="glass-panel p-4.5 rounded-xl border-slate-800/80 flex gap-3 text-left">
                <div className="w-7 h-7 rounded-full bg-brand-purple/20 border border-brand-purple flex items-center justify-center text-xs font-extrabold text-brand-purple">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed flex-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 7: Share Card
    {
      title: "Share Scorecard",
      content: (
        <div className="flex flex-col justify-center flex-1 py-4 items-center text-center">
          <h3 className="text-xl font-black mb-1">Make them jealous.</h3>
          <p className="text-slate-400 text-[10px] mb-6">Download a premium Instagram Stories format card showing your rating.</p>

          {/* Card Mock Preview */}
          <div className="w-full max-w-[210px] aspect-[9/16] rounded-2xl p-4 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] border border-white/10 flex flex-col justify-between shadow-2xl relative mb-6">
            <div className="absolute top-[-5%] left-[-5%] w-[80px] h-[80px] bg-purple-900/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[80px] h-[80px] bg-pink-900/10 rounded-full blur-xl pointer-events-none" />

            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">rizzmeter</span>
              <span className="block text-[8px] font-bold text-brand-purple mt-0.5">{report.profileType.toUpperCase()} SCORE</span>
            </div>

            <div className="my-3 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-brand-pink flex items-center justify-center bg-slate-950">
                <span className="text-2xl font-black">{report.overallScore}</span>
              </div>
            </div>

            <div className="text-left bg-white/5 border border-white/5 rounded-lg p-2.5 space-y-2">
              <div>
                <span className="block text-[7px] font-bold text-brand-cyan">STRENGTH</span>
                <span className="text-[9px] text-slate-200 font-medium block truncate">{report.greenFlags[0]}</span>
              </div>
              <div>
                <span className="block text-[7px] font-bold text-rose-400">RED FLAG</span>
                <span className="text-[9px] text-slate-200 font-medium block truncate">{report.redFlags[0]}</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[7px] text-slate-500 font-semibold">Generate yours at rizzmeter.com</span>
            </div>
          </div>

          <button
            onClick={handleDownloadShareCard}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25"
          >
            <Download className="w-4 h-4" /> Download PNG Card
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 bg-[#020617] text-white py-12 px-6 justify-center items-center relative min-h-screen">
      {/* Decorative Blur Overlays */}
      <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] bg-purple-900/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-pink-900/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Confetti Explosion element */}
      <Confetti active={confettiActive} />

      {/* Top Controls */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back Home
        </button>

        <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          rizz<span className="text-brand-pink">meter</span>
        </span>
      </div>

      {/* Wrapped Slide container card */}
      <div className="w-full max-w-lg bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col min-h-[640px] shadow-2xl relative z-10 overflow-hidden">
        {/* Top Slide Line progress */}
        <div className="flex gap-1.5 mb-6">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === activeSlide ? "bg-brand-pink" : idx < activeSlide ? "bg-brand-purple" : "bg-slate-800"
                }`}
            />
          ))}
        </div>

        {/* Slide contents with transition animation */}
        <div className="flex flex-col flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1"
            >
              {slides[activeSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer controls for unlocked slides */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <button
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
            className={`p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-40`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-500 tracking-wider">
            {slides[activeSlide].title} ({activeSlide + 1}/{TOTAL_SLIDES})
          </span>

          <button
            onClick={() => setActiveSlide((prev) => Math.min(TOTAL_SLIDES - 1, prev + 1))}
            disabled={activeSlide === TOTAL_SLIDES - 1}
            className={`p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-40`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Navigation Hints */}
      <p className="text-[10px] text-slate-500 font-medium mt-4">
        Tip: Tap arrows or use your keyboard navigation keys to step through your Wrapped report.
      </p>

      {/* ── Social Share Buttons ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 mt-5">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Share your score
        </p>
        <div className="flex flex-wrap justify-center items-center gap-2">

          {/* WhatsApp */}
          <button
            id="share-whatsapp"
            onClick={handleShareWhatsApp}
            title="Share on WhatsApp"
            className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-[#075e54]/20 border border-[#25d366]/30 hover:bg-[#25d366]/20 hover:border-[#25d366]/60 transition-all duration-200 text-[#25d366] text-xs font-bold shadow-sm hover:shadow-[0_0_12px_rgba(37,211,102,0.2)]"
          >
            {/* WhatsApp SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>

          {/* Instagram */}
          <button
            id="share-instagram"
            onClick={() => handleShareWithFile("instagram")}
            title="Share on Instagram"
            className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 border border-pink-600/30 hover:border-pink-500/60 hover:from-purple-800/25 hover:via-pink-800/25 hover:to-orange-800/25 transition-all duration-200 text-pink-400 text-xs font-bold shadow-sm hover:shadow-[0_0_12px_rgba(236,72,153,0.2)]"
          >
            {/* Instagram SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Instagram
          </button>

          {/* Snapchat */}
          <button
            id="share-snapchat"
            onClick={() => handleShareWithFile("snapchat")}
            title="Share on Snapchat"
            className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-400/30 hover:bg-yellow-400/20 hover:border-yellow-400/60 transition-all duration-200 text-yellow-400 text-xs font-bold shadow-sm hover:shadow-[0_0_12px_rgba(250,204,21,0.2)]"
          >
            {/* Snapchat SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.3 4.209l-.036.36c-.009.093.072.187.18.196.048.004.1 0 .15-.01.26-.064.54-.16.8-.16.59 0 1.12.468 1.12 1.06 0 .37-.2.7-.535.907-.85.526-1.29.807-1.29 1.133 0 .42.49 1.4 1.03 2.11.53.7 1.28 1.42 2.29 1.52.13.013.24.11.24.24 0 .38-.91 1.06-2.84 1.37-.05.007-.1.08-.1.18v.02c.03.14.07.3.07.44 0 .44-.35.77-.74.77-.27 0-.56-.11-.86-.33-.25-.19-.5-.29-.75-.29-.27 0-.53.11-.77.32-.91.82-1.95 1.24-3.01 1.24-1.06 0-2.1-.42-3.01-1.24-.24-.21-.5-.32-.77-.32-.25 0-.5.1-.75.29-.3.22-.59.33-.86.33-.39 0-.74-.33-.74-.77 0-.14.04-.3.07-.44v-.02c0-.1-.05-.173-.1-.18C2.91 17.77 2 17.09 2 16.71c0-.13.11-.227.24-.24 1.01-.1 1.76-.82 2.29-1.52.54-.71 1.03-1.69 1.03-2.11 0-.326-.44-.607-1.29-1.133C3.94 11.5 3.74 11.17 3.74 10.8c0-.592.53-1.06 1.12-1.06.26 0 .54.096.8.16.05.01.102.014.15.01.108-.009.189-.103.18-.196l-.036-.36c-.103-.99-.229-3.016.3-4.209C7.859 1.069 11.216.793 12.206.793"/>
            </svg>
            Snapchat
          </button>

        </div>
      </div>

    </div>
  );
}
