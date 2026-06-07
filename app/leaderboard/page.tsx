"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  ArrowLeft, 
  Flame, 
  Sparkles, 
  MessageSquare, 
  Crown,
  TrendingUp,
  UserCheck
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

interface LeaderboardItem {
  id: string;
  username: string;
  profileType: "instagram" | "dating" | "linkedin" | "whatsapp" | string;
  score: number;
  avatarUrl: string;
  roastTeaser: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case "instagram": return <Instagram className="w-3.5 h-3.5" />;
      case "linkedin": return <Linkedin className="w-3.5 h-3.5" />;
      case "dating": return <Flame className="w-3.5 h-3.5" />;
      default: return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredItems = platformFilter === "all" 
    ? items 
    : items.filter(item => item.profileType === platformFilter);

  return (
    <div className="flex flex-col flex-1 bg-[#020617] text-white py-12 px-6 justify-start items-center relative min-h-screen">
      {/* Decorative Overlays */}
      <div className="absolute top-[5%] left-[10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[10%] w-[30%] h-[30%] bg-pink-900/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-12 z-10">
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

      {/* Main Container */}
      <div className="w-full max-w-3xl z-10">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-yellow-500/30 flex items-center justify-center mb-4 mx-auto shadow-lg shadow-yellow-500/5">
            <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">Recent Roast Leaderboard</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            These profiles achieved maximum rizz ratings this week. All names and avatars are randomized to protect privacy.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 border-b border-white/5 pb-6">
          {["all", "instagram", "dating", "linkedin", "whatsapp"].map((filter) => (
            <button
              key={filter}
              onClick={() => setPlatformFilter(filter)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                platformFilter === filter
                  ? "bg-slate-900 border-brand-purple text-white shadow-md shadow-purple-500/5"
                  : "bg-slate-950/20 border-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-t-brand-purple border-slate-800 animate-spin mb-4" />
            <p className="text-xs text-slate-500 font-bold">Querying leaderboard data...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-slate-500 text-xs font-bold text-center py-12">
            No audit submissions match this filter yet. Be the first to secure a spot!
          </p>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => {
              const isFirst = index === 0 && platformFilter === "all";
              return (
                <div
                  key={item.id}
                  className={`glass-panel rounded-2xl p-5 border-slate-800/80 flex items-center gap-4 relative overflow-hidden transition-transform duration-300 hover:scale-[1.01] ${
                    isFirst ? "border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-slate-900/40" : ""
                  }`}
                >
                  {/* Score badge at top right */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 flex items-baseline gap-0.5">
                    <span className="text-base font-extrabold text-white">{item.score}</span>
                    <span className="text-[10px] text-slate-500 font-bold">/100</span>
                  </div>

                  {/* Rank indicator */}
                  <div className="flex items-center justify-center w-8 text-center">
                    {isFirst ? (
                      <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                    ) : (
                      <span className="text-sm font-extrabold text-slate-500">#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar Image */}
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.avatarUrl}
                      alt={item.username}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                      {getPlatformIcon(item.profileType)}
                    </div>
                  </div>

                  {/* Username & Roast snippet */}
                  <div className="flex-1 text-left pr-16">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {item.username}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-900 border border-white/5 text-[9px] text-slate-500">
                        {item.profileType}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 italic mt-1 leading-relaxed">
                      &quot;{item.roastTeaser}&quot;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Challenge invite card */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-brand-purple/20 via-slate-900 to-brand-pink/20 border border-slate-800 text-center">
          <h3 className="text-lg font-black mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-brand-cyan fill-brand-cyan/10" /> Think you can beat the best?
          </h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
            Upload your screenshot now, optimize your layouts, and score 90+ to get featured on the weekly leaderboard.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 mx-auto"
          >
            Submit Profile <UserCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
