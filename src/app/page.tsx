"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BackgroundDecorations } from "@/components/BackgroundDecorations";
import { IntroAnimation } from "@/components/IntroAnimation";
import { RotateCcw } from "lucide-react";

export default function Home() {
  const [isIntroFinished, setIsIntroFinished] = useState(false);

  // Helper to re-trigger intro animation for testing anytime
  const handleReplayIntro = () => {
    sessionStorage.removeItem("showrav_intro_seen");
    window.location.reload();
  };

  return (
    <main className="relative min-h-screen bg-[#FAFBFD] overflow-x-hidden flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* 0.5s Logo Intro Animation on first page load */}
      <IntroAnimation onComplete={() => setIsIntroFinished(true)} />

      {/* Mockup Background Graphic Elements (Curves, Arcs, Dot Grid) */}
      <BackgroundDecorations />

      {/* Main Header with Centered Logo and Left/Right Nav */}
      <Header activeSection="Home" />

      {/* Hero Section */}
      <Hero isIntroFinished={isIntroFinished} />

      {/* Discreet Replay Intro Control */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={handleReplayIntro}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs font-medium text-slate-500 hover:text-brand-600 shadow-sm border border-slate-200/80 backdrop-blur-md transition-all hover:shadow-md"
          title="Replay the 0.5s logo intro animation"
        >
          <RotateCcw className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-90" />
          <span className="hidden sm:inline">Replay Intro</span>
        </button>
      </div>
    </main>
  );
}
