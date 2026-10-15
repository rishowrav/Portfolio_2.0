"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { portfolioConfig } from "@/config/portfolio";

export const InteractiveCharacter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // References for continuous tracking state
  const imagesCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(portfolioConfig.character.neutralFrame);
  const targetFrameRef = useRef<number>(portfolioConfig.character.neutralFrame);
  const isInteractingRef = useRef<boolean>(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Frame URL generator (001 to 160)
  const getFrameUrl = useCallback((frameIndex: number) => {
    const padded = String(Math.round(frameIndex)).padStart(3, "0");
    return `/facemovement/frame-${padded}.webp`;
  }, []);

  // Draw current frame on canvas with high-DPI Retina crispness
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const rounded = Math.max(1, Math.min(160, Math.round(frameIndex)));
    let img = imagesCacheRef.current.get(rounded);
    if (!img || !img.complete) {
      img = imagesCacheRef.current.get(portfolioConfig.character.neutralFrame);
    }
    if (!img || !img.complete) return;

    // Clear with fully transparent pixels to avoid ghosting
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use high quality smoothing to reduce edge artifacts
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Aspect ratio fit (anchored strictly to bottom-center)
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = canvas.height - drawHeight;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = canvas.height - drawHeight;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }, []);

  // Preload frames progressively (instant neutral frame first)
  useEffect(() => {
    let isCancelled = false;
    const { neutralFrame, leftMaxFrame, rightMaxFrame } = portfolioConfig.character;

    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Match frame aspect ratio exactly (1080x1920 = 9:16) to avoid distortion artifacts
      canvas.width = 540 * dpr;
      canvas.height = 960 * dpr;
    }

    // 1. Immediately load neutral frame (instant render, zero layout shift)
    const neutralImg = new window.Image();
    neutralImg.src = getFrameUrl(neutralFrame);
    neutralImg.onload = () => {
      if (isCancelled) return;
      imagesCacheRef.current.set(neutralFrame, neutralImg);
      setIsLoaded(true);
      drawFrame(neutralFrame);
    };

    // 2. Preload range 40 (left max) to 120 (right max) from center outwards
    const framesToLoad: number[] = [];
    for (let offset = 1; offset <= 40; offset++) {
      if (neutralFrame - offset >= leftMaxFrame) framesToLoad.push(neutralFrame - offset);
      if (neutralFrame + offset <= rightMaxFrame) framesToLoad.push(neutralFrame + offset);
    }

    framesToLoad.forEach((frameIdx) => {
      const img = new window.Image();
      img.src = getFrameUrl(frameIdx);
      img.onload = () => {
        if (isCancelled) return;
        imagesCacheRef.current.set(frameIdx, img);
      };
    });

    return () => {
      isCancelled = true;
    };
  }, [getFrameUrl, drawFrame]);

  // Main 60fps render loop using requestAnimationFrame + lerp
  // ZERO CSS translation, ZERO layout shift - purely updating canvas pixels
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!prefersReducedMotion) {
        const frameDiff = targetFrameRef.current - currentFrameRef.current;
        if (Math.abs(frameDiff) > 0.05) {
          currentFrameRef.current += frameDiff * 0.12;
          drawFrame(currentFrameRef.current);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [drawFrame]);

  // Full-Screen Pointer & Touch Tracking (Zero layout shift, 100% stable body position)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handlePointerAction = (clientX: number, clientY: number) => {
      isInteractingRef.current = true;
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }

      const winW = window.innerWidth;

      // Character center horizontally in viewport
      let faceX = winW * 0.5;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        faceX = rect.left + rect.width * 0.5;
      }

      // Normalized horizontal coordinate relative to character face:
      // When cursor is at faceX -> 0
      // When cursor is far left (clientX = 0) -> -1
      // When cursor is far right (clientX = winW) -> +1
      let normX = 0;
      if (clientX < faceX) {
        normX = -Math.min(1, (faceX - clientX) / Math.max(1, faceX));
      } else {
        normX = Math.min(1, (clientX - faceX) / Math.max(1, winW - faceX));
      }

      const { neutralFrame, leftMaxFrame, rightMaxFrame } = portfolioConfig.character;

      // Horizontal facial direction mapping:
      // Left (-1) => Frame 40 (looking left toward text)
      // Center (0) => Frame 80 (looking straight ahead at user)
      // Right (+1) => Frame 120 (looking right toward doodle)
      let targetF: number;
      if (normX < 0) {
        targetF = neutralFrame - Math.abs(normX) * (neutralFrame - leftMaxFrame);
      } else {
        targetF = neutralFrame + normX * (rightMaxFrame - neutralFrame);
      }

      targetFrameRef.current = targetF;
    };

    const resetToNeutral = () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      targetFrameRef.current = portfolioConfig.character.neutralFrame;
      isInteractingRef.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      handlePointerAction(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerAction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // Reset when pointer leaves the document/viewport
    const onDocumentMouseLeave = (e: MouseEvent) => {
      // document mouseleave fires when the cursor leaves the document area
      resetToNeutral();
    };

    // Fallback: mouseout on document with relatedTarget null means cursor left the window
    const onDocumentMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget === null || (e.relatedTarget as Node)?.nodeName === "HTML") {
        resetToNeutral();
      }
    };

    const onTouchEnd = () => {
      resetToNeutral();
    };

    // Track pointer/touch movement across entire viewport
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    // Viewport exit detection — multiple strategies for reliable cross-browser behavior
    document.addEventListener("mouseleave", onDocumentMouseLeave);
    document.addEventListener("mouseout", onDocumentMouseOut);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("mouseleave", onDocumentMouseLeave);
      document.removeEventListener("mouseout", onDocumentMouseOut);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-end justify-center w-[340px] sm:w-[440px] md:w-[500px] lg:w-[560px] xl:w-[600px] h-[480px] sm:h-[580px] md:h-[660px] lg:h-[740px] xl:h-[780px] select-none pointer-events-none"
    >
      {/* Organic Soft-Blue Backdrop Blob matching mockup exactly */}
      <div
        className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] sm:w-[94%] h-[76%] sm:h-[78%] bg-[#E8F2FD] rounded-[46%_54%_62%_38%_/_48%_52%_48%_52%] pointer-events-none z-0"
        style={{
          boxShadow: "0 20px 50px -15px rgba(200, 222, 255, 0.5)",
        }}
      />

      {/* Main Canvas: Perfectly fixed dimensions, zero layout shift */}
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full object-contain"
      />
    </div>
  );
};
