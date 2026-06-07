"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Zap,
  Flame,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Trophy,
  Star,
  Users,
  X,
  Menu
} from "lucide-react";

// Inline SVG Icons for brand compatibility
const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

type PlatformType = "instagram" | "dating" | "linkedin" | "whatsapp";

interface LogMessage {
  id: number;
  text: string;
  type: "info" | "success" | "warning";
}

export default function LandingPage() {

  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToRoaster = () => {
    const el = document.getElementById("roaster");
    el?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const [platform, setPlatform] = useState<PlatformType>("instagram");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Scanning / analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Platform configuration details
  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-600", desc: "Roast your feed aesthetics and grid vibes." },
    { id: "dating", name: "Dating Profile", icon: Flame, color: "from-orange-500 to-red-600", desc: "Fix your Hinge, Tinder, or Bumble matches." },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-cyan-500", desc: "Ditch the corporate buzzwords and dry pitches." },
    { id: "whatsapp", name: "WhatsApp DP", icon: MessageSquare, color: "from-emerald-500 to-green-600", desc: "No more moody quotes or blurry selfies." }
  ];

  // Helper to add terminal log messages
  const addLog = (text: string, type: "info" | "success" | "warning" = "info") => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  // Client-Side Canvas Image Compression
  const compressImage = (selectedFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 900;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], selectedFile.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/jpeg",
            0.8
          );
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Handle file selection
  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setError(null);
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Main analyze trigger
  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setLogs([]);
    setError(null);

    try {
      addLog("Initializing local profile analyzer...", "info");
      await new Promise(r => setTimeout(r, 600));

      addLog("Compressing image client-side to save bandwidth...", "info");
      const compressed = await compressImage(file);
      addLog(`Image resized from ${(file.size / 1024).toFixed(1)}KB to ${(compressed.size / 1024).toFixed(1)}KB!`, "success");
      await new Promise(r => setTimeout(r, 600));

      addLog("Uploading compressed screenshot to servers...", "info");
      const uploadFormData = new FormData();
      uploadFormData.append("file", compressed);
      uploadFormData.append("profileType", platform);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        throw new Error("Screenshot upload failed.");
      }

      const uploadData = await uploadRes.json();
      addLog("Upload complete! File key stored.", "success");
      await new Promise(r => setTimeout(r, 600));

      addLog("Requesting Vision LLM feedback (GPT-4o API)...", "info");
      addLog("Critiquing bios, scanning layouts, ranking facial expressions...", "info");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadData.url, profileType: platform })
      });

      if (!analyzeRes.ok) {
        throw new Error("Profile analysis failed.");
      }

      const reportData = await analyzeRes.json();
      addLog("Roast generated! Securing report ID...", "success");
      await new Promise(r => setTimeout(r, 500));

      // Redirect to report view
      router.push(`/report/${reportData.id}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#020617] text-white relative">
      {/* Decorative Blur Overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      {/* <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            rizz<span className="text-brand-pink">meter</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="#roaster" className="hover:text-white transition-colors">Roast Me</a>
          <a href="/leaderboard" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
          </a>
          <a href="/challenge" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-cyan" /> AI Challenge
          </a>
        </nav>
        <button
          onClick={() => {
            const el = document.getElementById("roaster");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          Roast Now <ArrowRight className="w-4 h-4" />
        </button>
      </header> */}

      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-50 border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>

          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            rizz<span className="text-brand-pink">meter</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a
            href="#roaster"
            className="hover:text-white transition-colors"
          >
            Roast Me
          </a>

          <a
            href="/leaderboard"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            Leaderboard
          </a>

          <a
            href="/challenge"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            AI Challenge
          </a>
        </nav>

        {/* Desktop CTA */}
        <button
          onClick={scrollToRoaster}
          className="hidden md:flex px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold text-sm hover:opacity-90 transition-all items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          Roast Now
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-[73px] left-0 right-0 z-40 transition-all duration-300 ${isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        <div className="mx-4 mt-2 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <nav className="flex flex-col">
            <a
              href="#roaster"
              onClick={scrollToRoaster}
              className="px-6 py-4 text-white hover:bg-white/5 transition-colors"
            >
              Roast Me
            </a>

            <a
              href="/leaderboard"
              onClick={() => setIsMenuOpen(false)}
              className="px-6 py-4 text-white hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </a>

            <a
              href="/challenge"
              onClick={() => setIsMenuOpen(false)}
              className="px-6 py-4 text-white hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-brand-cyan" />
              AI Challenge
            </a>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={scrollToRoaster}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                Roast Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-brand-cyan mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" /> Powered by GPT-4o Vision
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl"
        >
          How bad is your profile? <br />
          <span className="gradient-text">Get brutally roasted.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 mt-6 text-lg md:text-xl max-w-2xl leading-relaxed"
        >
          Upload screenshots of your Instagram, LinkedIn, Dating profiles, or WhatsApp DP. Get a first impression score, photo ratings, bio rewrites, and a glow-up plan.
        </motion.p>
      </section>

      {/* Interactive Roaster Dashboard */}
      <section id="roaster" className="max-w-4xl mx-auto px-6 pb-24 w-full z-10 scroll-mt-28">
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Neon side border accents */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan" />

          {!isAnalyzing ? (
            <>
              {/* Category Selector Tabs */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-400 mb-4 text-center">
                  Select your profile platform
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((p) => {
                    const Icon = p.icon;
                    const isSelected = platform === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id as PlatformType)}
                        className={`flex flex-col items-center justify-center py-4 px-3 rounded-2xl border transition-all ${isSelected
                            ? "bg-slate-900 border-brand-purple shadow-md shadow-purple-500/10 text-white"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-brand-purple" : ""}`} />
                        <span className="text-xs font-bold">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-center text-xs text-slate-500 mt-3.5">
                  {platforms.find(p => p.id === platform)?.desc}
                </p>
              </div>

              {/* Drag and Drop Uploader */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={handleUploadClick}
                className={`border-2 border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition-all flex flex-col items-center ${isDragOver
                    ? "border-brand-purple bg-purple-500/5 scale-[0.99]"
                    : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-900/10"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  accept="image/*"
                />

                {previewUrl ? (
                  <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-xl overflow-hidden border border-slate-700 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-xs font-bold text-white bg-slate-900/80 px-3 py-1.5 rounded-full">
                        Change Photo
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold mb-1">
                      Drag & Drop profile screenshot here
                    </h3>
                    <p className="text-slate-500 text-xs max-w-xs mb-4">
                      Supports JPG, PNG or WEBP files. Client-side compressed for faster loading.
                    </p>
                    <span className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-xs font-bold text-slate-300">
                      Browse Files
                    </span>
                  </>
                )}
              </div>

              {error && (
                <p className="text-red-400 text-xs font-semibold text-center mt-4 bg-red-950/25 border border-red-900/50 py-2.5 px-4 rounded-xl">
                  {error}
                </p>
              )}

              {/* Action Button */}
              {file && (
                <button
                  onClick={handleAnalyze}
                  className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan hover:opacity-95 text-white font-extrabold tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-transform"
                >
                  <Zap className="w-4 h-4 fill-white" /> Analyze & Roast My Profile
                </button>
              )}
            </>
          ) : (
            /* Analysis Scanner Terminal UI */
            <div className="flex flex-col items-center py-6">
              <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-xl overflow-hidden border border-brand-purple/50 bg-slate-950 mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl!}
                  alt="Analyzing target"
                  className="w-full h-full object-cover opacity-60"
                />
                {/* Scanner Laser effect */}
                <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan shadow-[0_0_15px_#7c3aed] animate-scan" />
              </div>

              {/* Terminal Logs */}
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 min-h-[160px] max-h-[200px] overflow-y-auto flex flex-col gap-2">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2"
                    >
                      <span className={log.type === "success" ? "text-emerald-400" : log.type === "warning" ? "text-amber-400" : "text-brand-cyan"}>
                        {log.type === "success" ? "✔" : log.type === "warning" ? "⚠" : "▶"}
                      </span>
                      <p className="flex-1">{log.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <p className="text-slate-400 text-xs mt-6 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-brand-purple" /> Roasting engine generating spicy responses...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Free Features Grid */}
      <section className="bg-slate-950/60 border-t border-b border-white/5 py-24 z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">100% Free. Unlimited Glow-Ups.</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-16 text-sm">
            Get comprehensive audits, full breakdown slides, photo rankings, optimized bio rewrites, and the viral scorecard - completely free.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Card 1: AI Roast & Scores */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-brand-purple/40 transition-all text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-brand-purple/20 flex items-center justify-center mb-4 text-brand-purple">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Unfiltered AI Roast</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Get a brutal, hilarious, and honest critique of your profile's overall aesthetic, vibe, and Gen-Z rating score.
                </p>
              </div>
            </div>

            {/* Card 2: Photo Rankings */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-brand-pink/40 transition-all text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-brand-pink/20 flex items-center justify-center mb-4 text-brand-pink">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Photo Rankings</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Evaluate individual photos and panels. Learn which ones boost your matches and which ones need to be swapped out immediately.
                </p>
              </div>
            </div>

            {/* Card 3: Bio Rewrite */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-brand-cyan/40 transition-all text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-brand-cyan/20 flex items-center justify-center mb-4 text-brand-cyan">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Gen-Z Bio Rewrites</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ditch dry summaries and corporate buzzwords. Get funny, emoji-rich, and optimized copy for your target audience.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <button
              onClick={() => {
                const el = document.getElementById("roaster");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
            >
              Start Your Free Audit
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center z-10">
        <h2 className="text-2xl md:text-4xl font-black mb-12 flex items-center justify-center gap-2">
          Loved by <Users className="w-6 h-6 text-brand-purple" /> 2,400+ roasted users
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 text-left">
            <div className="flex items-center gap-1 text-yellow-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              &quot;Rizzmeter roasted my Tinder bio, called me out for looking like a corporate robot, and rewritten it. Next day I got matches who actually message first.&quot;
            </p>
            <span className="text-[11px] font-bold text-slate-500">- Sahil K., Tinder user</span>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 text-left">
            <div className="flex items-center gap-1 text-yellow-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              &quot;My Instagram rating was 68. The critique pointed out that mirror selfies in dirty rooms are red flags. Cleaned the room, took new photos, scored 85. Game changer.&quot;
            </p>
            <span className="text-[11px] font-bold text-slate-500">- Diya M., Instagram user</span>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 text-left">
            <div className="flex items-center gap-1 text-yellow-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              &quot;LinkedIn roaster was painful. It said my headline sounded like a ChatGPT copy-paste. Rewrote it to show results. Got headhunted for a startup role two weeks later.&quot;
            </p>
            <span className="text-[11px] font-bold text-slate-500">- Raghav S., Dev</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-slate-500 mt-auto bg-slate-950/40">
        <p>© 2026 Rizzmeter Inc. All rights reserved. Do not take roasts seriously.</p>
      </footer>
    </div>
  );
}
