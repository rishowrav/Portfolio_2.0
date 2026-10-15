"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if intro has already been shown in this browser session
    const hasSeenIntro = sessionStorage.getItem("showrav_intro_seen");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (hasSeenIntro === "true" || prefersReducedMotion) {
      onComplete();
      return;
    }

    // First time in session: prepare to render intro
    setShouldRender(true);
  }, [onComplete]);

  useEffect(() => {
    if (!shouldRender || !containerRef.current || !logoWrapperRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("showrav_intro_seen", "true");
          setShouldRender(false);
          onComplete();
        },
      });

      // Initial state
      gsap.set(logoWrapperRef.current, { opacity: 0, scale: 0.85 });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.6 });

      // Step 1: Smooth appearance (0.25s)
      tl.to([logoWrapperRef.current, glowRef.current], {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
      // Step 2: Hold logo on screen for ~0.5s with a subtle breathing pulse
      .to(glowRef.current, {
        scale: 1.25,
        opacity: 0.8,
        duration: 0.5,
        ease: "sine.inOut",
      })
      // Step 3: Logo expands smoothly and fades out
      .to(logoWrapperRef.current, {
        opacity: 0,
        scale: 1.12,
        duration: 0.4,
        ease: "power2.inOut",
      }, "+=0.1")
      // Step 4: Curtain fades out
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.inOut",
      }, "-=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, [shouldRender, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFCFF]"
      aria-label="Loading Intro"
      role="status"
    >
      <div className="relative flex items-center justify-center">
        {/* Soft radial blue glow */}
        <div
          ref={glowRef}
          className="absolute -inset-10 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"
        />

        {/* Centered logo container */}
        <div
          ref={logoWrapperRef}
          className="relative z-10 w-32 h-16 sm:w-44 sm:h-20 flex items-center justify-center"
        >
          <Image
            src="/logo.png"
            alt="Showrav Logo"
            width={180}
            height={80}
            className="w-auto h-12 sm:h-14 object-contain filter drop-shadow-sm"
            priority
          />
        </div>
      </div>
    </div>
  );
};
