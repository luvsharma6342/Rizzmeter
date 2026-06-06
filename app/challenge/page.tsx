"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  ShieldAlert, 
  UserCheck, 
  Zap, 
  Share2 
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

interface FamousRoast {
  name: string;
  type: string;
  score: number;
  roast: string;
  strength: string;
  weakness: string;
  avatar: string;
}

const FAMOUS_ROASTS: FamousRoast[] = [
  {
    name: "Tech Billionaire Elon",
    type: "LinkedIn / X",
    score: 82,
    roast: "Bro, your feed looks like a 14-year-old discovered Photoshop and cryptocurrency on the same day. We get it, you own rockets. Stop tweeting anime memes at 3 AM while your stock values are fighting for their life.",
    strength: "Massive reach, occasionally posts actually cool rocket blueprints.",
    weakness: "Severe lack of sleep, emoji hygiene is nonexistent.",
    avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150"
  },
  {
    name: "Agile Enforcer Chad",
    type: "Hinge",
    score: 95,
    roast: "The absolute gold standard of dating profiles. Cute golden retriever in slide 1, outdoor hiking in slide 2, cooking video in slide 3. You are a walking cheat code. Relax your jaw, we know you spent 4 hours choosing this angle.",
    strength: "Dog is cute, outfits match, you look like you bathe daily.",
    weakness: "Zero personality indicators other than 'likes outdoors'.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  },
  {
    name: "Meta Master Zuck",
    type: "Instagram",
    score: 74,
    roast: "Vibe shift detected. You swapped the gray t-shirts for gold chains and oversized streetwear. It's a solid glow-up, but the sunscreen-slathered surfing photo is permanently burned into our collective retina.",
    strength: "High-budget lighting, premium MMA sparring reels.",
    weakness: "Gives 'I am learning human emotions' energy.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  },
  {
    name: "Corporate Buzzword Brenda",
    type: "LinkedIn",
    score: 41,
    roast: "Your headline is literally longer than the US constitution. 'Synergistic Agile Evangelist & Strategic Thought Catalyst | Ex-Meta Intern | Aspiring VC'. Stop speaking in tongues. Speak like a real human being.",
    strength: "Open To Work banner is extremely high resolution.",
    weakness: "Using 'synergy' and 'learnings' 40 times in your summary.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  }
];

export default function ChallengePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 bg-[#020617] text-white py-12 px-6 justify-start items-center relative min-h-screen">
      {/* Decorative Overlays */}
      <div className="absolute top-[5%] left-[5%] w-[35%] h-[35%] bg-purple-900/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[5%] w-[35%] h-[35%] bg-pink-900/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-12 z-10">
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

      {/* Main Content */}
      <div className="w-full max-w-4xl z-10 text-center">
        <div className="mb-10">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-brand-cyan/30 flex items-center justify-center mb-4 mx-auto shadow-lg shadow-cyan-500/5">
            <Sparkles className="w-6 h-6 text-brand-cyan animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">AI Challenge: Score 90+</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Only 3.4% of uploaded profiles hit the elite 90+ mark. Do you have the style, the bio, and the layout to join the halls of fame?
          </p>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="glass-panel p-4 rounded-xl border-slate-800 text-center">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Average Score</span>
            <span className="text-xl font-extrabold text-white">71.4 / 100</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border-slate-800 text-center">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pass Rate (&gt;80)</span>
            <span className="text-xl font-extrabold text-brand-pink">18.6%</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border-slate-800 text-center">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Elite Rank (&gt;90)</span>
            <span className="text-xl font-extrabold text-yellow-500">3.4%</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border-slate-800 text-center">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Roasted</span>
            <span className="text-xl font-extrabold text-brand-cyan">12,480+</span>
          </div>
        </div>

        {/* Challenge Action Button */}
        <div className="mb-16">
          <button
            onClick={() => {
              router.push("/");
              setTimeout(() => {
                const el = document.getElementById("roaster");
                el?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="px-8 py-4.5 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-transform mx-auto max-w-xs"
          >
            <Zap className="w-4 h-4 fill-white" /> Take the Challenge
          </button>
        </div>

        {/* Famous Roasts Section */}
        <h2 className="text-xl font-black mb-8 text-left border-b border-white/5 pb-4">
          Showcase: Hall of Roasts
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
          {FAMOUS_ROASTS.map((r, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{r.name}</h3>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{r.type}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded text-xs font-extrabold text-brand-pink">
                    Score: {r.score}
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-xs text-slate-300 italic mb-4 leading-relaxed">
                  &quot;{r.roast}&quot;
                </div>

                <div className="space-y-2 text-[11px]">
                  <p className="text-slate-400">
                    <span className="font-bold text-emerald-400">✔ Strength:</span> {r.strength}
                  </p>
                  <p className="text-slate-400">
                    <span className="font-bold text-rose-400">✖ Weakness:</span> {r.weakness}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
