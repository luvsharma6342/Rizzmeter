"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Download,
  AlertTriangle,
  CheckCircle,
  Copy,
  ChevronRight,
  TrendingUp,
  Share2,
  DollarSign,
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

  // Slideshow control
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedBio, setCopiedBio] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // Payment popup state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [billingEmail, setBillingEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"single" | "lifetime">("single");

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

  // Mock Payment Flow
  const handleUnlockReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingEmail) return;

    setPaymentLoading(true);
    // Simulate gateway delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch(`/api/report/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlock", email: billingEmail, plan: selectedPlan })
      });

      if (!res.ok) {
        throw new Error("Unlock transaction failed.");
      }

      // Success
      const data = await res.json();
      setReport(data.report);
      setShowPaymentModal(false);
      setConfettiActive(true);
      // Advance to next slide to reveal the content
      setActiveSlide(1);
    } catch (err: any) {
      alert(err.message || "Payment verification failed.");
    } finally {
      setPaymentLoading(false);
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

  // Total slides available: 8
  const TOTAL_SLIDES = 8;

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
      <div className="w-full max-w-lg bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col h-[520px] shadow-2xl relative z-10 overflow-hidden">
        {/* Top Slide Line progress */}
        {report.isUnlocked && (
          <div className="flex gap-1.5 mb-6">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === activeSlide ? "bg-brand-pink" : idx < activeSlide ? "bg-brand-purple" : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        )}

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
              {report.isUnlocked || activeSlide === 0 ? (
                slides[activeSlide].content
              ) : (
                /* Blurry Teaser block for locked content */
                <div className="flex flex-col items-center justify-center flex-1 text-center py-10 blur-xs select-none">
                  <Lock className="w-12 h-12 text-slate-500 mb-4" />
                  <p className="text-sm text-slate-400">Locked teaser content</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Locked paywall interface overlay */}
        {!report.isUnlocked && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-brand-purple flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-brand-purple" />
            </div>
            
            <h3 className="text-xl font-black mb-2">Want to see your roasts & tips?</h3>
            <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
              Unlock the other 7 Spotify Wrapped-style slides including Photo Ranks, Red Flags, AI Roast paragraph, Bio rewritten and custom Story share card.
            </p>

            <div className="flex gap-3 w-full max-w-xs mb-4">
              <div 
                onClick={() => setSelectedPlan("single")}
                className={`flex-1 border rounded-xl p-3 cursor-pointer text-left transition-all ${
                  selectedPlan === "single" 
                    ? "border-brand-purple bg-purple-500/5" 
                    : "border-slate-800 bg-slate-900/20 hover:border-slate-700"
                }`}
              >
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">This Report</span>
                <span className="text-base font-extrabold text-white">₹199</span>
              </div>
              <div 
                onClick={() => setSelectedPlan("lifetime")}
                className={`flex-1 border rounded-xl p-3 cursor-pointer text-left transition-all ${
                  selectedPlan === "lifetime" 
                    ? "border-brand-pink bg-pink-500/5" 
                    : "border-slate-800 bg-slate-900/20 hover:border-slate-700"
                }`}
              >
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Lifetime Pass</span>
                <span className="text-base font-extrabold text-white">₹499</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
            >
              Unlock Report Slides Now
            </button>
            <p className="text-[10px] text-slate-500 font-medium mt-3">Fully secured transaction. Instant refund on dissatisfaction.</p>
          </div>
        )}

        {/* Footer controls for unlocked slides */}
        {report.isUnlocked && (
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
        )}
      </div>

      {/* Slide Navigation Hints */}
      {report.isUnlocked && (
        <p className="text-[10px] text-slate-500 font-medium mt-4">
          Tip: Tap arrows or use your keyboard navigation keys to step through your Wrapped report.
        </p>
      )}

      {/* Mock Payment Gateway Modal Popup */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Modal branding header */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-tight">
                rizz<span className="text-brand-pink">meter</span> Secure Checkout
              </span>
            </div>

            <form onSubmit={handleUnlockReport} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  Billing Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="enter.your.email@gmail.com"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-purple rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  Selected Package
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-xs font-bold text-white">
                      {selectedPlan === "single" ? "Single Profile Audit" : "Unlimited Lifetime Pass"}
                    </span>
                    <span className="text-[10px] text-slate-500">Includes secure cloud report storage</span>
                  </div>
                  <span className="text-base font-black text-brand-pink">
                    {selectedPlan === "single" ? "₹199" : "₹499"}
                  </span>
                </div>
              </div>

              {/* Simulated details grid */}
              <div className="p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl text-[10px] text-slate-500 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{selectedPlan === "single" ? "₹199.00" : "₹499.00"}</span>
                </div>
                <div className="flex justify-between text-brand-cyan">
                  <span>Mock Integration active:</span>
                  <span>FREE testing mode</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                      Paying...
                    </>
                  ) : (
                    <>Confirm Payment</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
