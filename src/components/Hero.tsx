"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { portfolioConfig } from "@/config/portfolio";
import { InteractiveCharacter } from "./InteractiveCharacter";
import { DoodleArrow, ShoulderSparks } from "./DoodleArrow";

interface HeroProps {
  isIntroFinished: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isIntroFinished }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Reveal Animation
  useEffect(() => {
    if (!isIntroFinished || !heroRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Left text stagger
      if (leftContentRef.current) {
        tl.fromTo(
          leftContentRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
          }
        );
      }

      // Character smooth fade in
      if (characterRef.current) {
        tl.fromTo(
          characterRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        );
      }

      // Doodle arrow pop
      if (rightContentRef.current) {
        tl.fromTo(
          rightContentRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isIntroFinished]);

  const { personal } = portfolioConfig;

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative z-10 w-full max-w-[1580px] mx-auto px-6 sm:px-12 lg:px-16 flex-1 min-h-[calc(100vh-90px)] flex flex-col justify-end pb-0 overflow-hidden"
    >
      <div className="relative w-full h-[calc(100vh-95px)] min-h-[640px] max-h-[920px] flex items-end justify-center">

        {/* Left Side: Typography & CTA Buttons (Exact vertical alignment from mockup) */}
        <div
          ref={leftContentRef}
          className="relative lg:absolute left-0 lg:left-4 xl:left-8 top-12 lg:top-[15%] xl:top-[17%] z-20 flex flex-col items-start justify-start max-w-lg text-left"
        >
          {/* Top-Left Dot Grid (2 rows x 4 dots matching mockup) */}
          <div className="flex flex-col gap-2.5 mb-5 opacity-80 select-none pointer-events-none">
            <div className="flex gap-2.5">
              {[...Array(4)].map((_, i) => (
                <span key={`r1-${i}`} className="w-[6px] h-[6px] rounded-full bg-[#9DBFF2]" />
              ))}
            </div>
            <div className="flex gap-2.5">
              {[...Array(4)].map((_, i) => (
                <span key={`r2-${i}`} className="w-[6px] h-[6px] rounded-full bg-[#9DBFF2]" />
              ))}
            </div>
          </div>

          {/* Greeting */}
          <p className="text-slate-500 text-[17px] sm:text-[19px] font-medium tracking-tight mb-2">
            {personal.greeting}
          </p>

          {/* Name Display matching mockup fonts & colors */}
          <h1 className="text-5xl sm:text-6xl xl:text-[66px] font-extrabold leading-[1.06] tracking-tight mb-2">
            <span className="block text-[#0F172A]">{personal.firstName}</span>
            <span className="block text-brand-500">{personal.lastName}</span>
          </h1>

          {/* Role / Subheading */}
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1E293B] mt-2 mb-4 tracking-tight">
            {personal.role}
          </h2>

          {/* Bio text */}
          <p className="text-base sm:text-[17px] text-slate-500 font-normal leading-[1.65] max-w-[430px] lg:max-w-[360px] xl:max-w-[400px] mb-8">
            {personal.bio}
          </p>

          {/* Two CTA Buttons: stacked on lg-xl so they never cover the character; side-by-side elsewhere matching mockup */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 lg:flex-col lg:items-start 2xl:flex-row 2xl:items-center">
            {/* Primary CTA */}
            <a
              href={personal.primaryCta.href}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full bg-brand-500 text-white font-semibold text-base shadow-md shadow-brand-500/25 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/35 active:translate-y-0.5 transition-all duration-200"
            >
              <span>{personal.primaryCta.label}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Secondary CTA */}
            <a
              href={personal.secondaryCta.href}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full bg-white text-brand-500 font-semibold text-base border-2 border-brand-500 hover:bg-blue-50/70 active:translate-y-0.5 transition-all duration-200 shadow-xs"
            >
              <span>{personal.secondaryCta.label}</span>
            </a>
          </div>
        </div>

        {/* Center: Main Character with Head directly beneath logo & Zero Layout Shift */}
        <div
          ref={characterRef}
          className="relative lg:absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex items-end justify-center pointer-events-none"
        >
          {/* Shoulder Action Burst Marks */}
          <ShoulderSparks />

          {/* Interactive Character */}
          <InteractiveCharacter />
        </div>

        {/* Right Side: Whimsical Handwritten Phrase & Arrow (Exact alignment with chest/shoulder) */}
        <div
          ref={rightContentRef}
          className="hidden lg:block absolute right-4 xl:right-16 top-[33%] xl:top-[35%] z-20 pointer-events-none"
        >
          <DoodleArrow />
        </div>

      </div>
    </section>
  );
};
