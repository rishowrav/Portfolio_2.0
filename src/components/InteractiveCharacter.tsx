"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { portfolioConfig } from "@/config/portfolio";

export const InteractiveCharacter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Fully-decoded frame bitmaps: fetched + validated once, then kept for
  // instant paints with zero decode churn during interaction.
  const bitmapsRef = useRef<Map<number, ImageBitmap>>(new Map());
  // Frames currently being decoded (prevents duplicate work).
  const decodingRef = useRef<Set<number>>(new Set());
  // Keep hard references to in-flight <img> elements so the GC can never
  // collect them mid-decode (another source of partial/corrupt draws).
  const pendingImagesRef = useRef<HTMLImageElement[]>([]);
  // Last frame index actually painted — used as last-good-frame fallback.
  const lastDrawnRef = useRef<number | null>(null);

  const currentFrameRef = useRef<number>(portfolioConfig.character.neutralFrame);
  const targetFrameRef = useRef<number>(portfolioConfig.character.neutralFrame);
  const isInteractingRef = useRef<boolean>(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Frame URL generator (001 to 160). The ?v= cache-buster forces browsers
  // to fetch fresh bytes whenever the frame assets are repaired/edited.
  const getFrameUrl = useCallback((frameIndex: number) => {
    const padded = String(Math.round(frameIndex)).padStart(3, "0");
    return `/facemovement/frame-${padded}.webp?v=${portfolioConfig.character.frameVersion}`;
  }, []);

  // Snap a frame index to the nearest USABLE frame: clamped to [1,160] and
  // steered around source frames with cutout-mast holes (config.excludedFrames).
  // Neighbors are visually identical (same video, 1 frame apart), so the
  // substitution is imperceptible — but the white blocks are gone.
  const sanitizeFrame = useCallback((frameIndex: number) => {
    let rounded = Math.max(1, Math.min(160, Math.round(frameIndex)));
    const excluded = portfolioConfig.character.excludedFrames;
    if (!excluded.includes(rounded)) return rounded;
    for (let step = 1; step <= 160; step++) {
      if (!excluded.includes(rounded - step) && rounded - step >= 1) return rounded - step;
      if (!excluded.includes(rounded + step) && rounded + step <= 160) return rounded + step;
    }
    return rounded;
  }, []);

  // Decode a single frame fully, then cache the bitmap. Never throws.
  //
  // Loading pipeline: fetch() -> Blob -> createImageBitmap().
  // - fetch() REJECTS on truncated bodies (Content-Length mismatch), so a
  //   half-downloaded file can never enter the cache.
  // - createImageBitmap(blob) decodes the complete bytes off-main-thread and
  //   REJECTS on invalid data.
  // Together this makes partially-decoded "white block" frames impossible,
  // unlike <img> + decode() which may resolve while macroblocks are missing.
  const loadFrame = useCallback(
    async (frameIndex: number) => {
      const rounded = sanitizeFrame(frameIndex);
      if (bitmapsRef.current.has(rounded) || decodingRef.current.has(rounded)) return;
      decodingRef.current.add(rounded);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (typeof w.createImageBitmap === "function" && typeof window.fetch === "function") {
          const res = await window.fetch(getFrameUrl(rounded));
          if (!res.ok) throw new Error(`frame ${rounded} HTTP ${res.status}`);
          const blob = await res.blob();
          if (blob.size === 0) throw new Error(`frame ${rounded} empty body`);
          const bmp: ImageBitmap = await w.createImageBitmap(blob);
          if (bmp.width === 0 || bmp.height === 0) {
            try {
              bmp.close();
            } catch {
              /* noop */
            }
            throw new Error(`frame ${rounded} zero-size bitmap`);
          }
          bitmapsRef.current.set(rounded, bmp);
        } else {
          // Legacy fallback for browsers without fetch/createImageBitmap.
          const img = new window.Image();
          pendingImagesRef.current.push(img);
          try {
            img.src = getFrameUrl(rounded);
            if (typeof img.decode === "function") {
              await img.decode();
            } else {
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("image load failed"));
              });
            }
            const off = document.createElement("canvas");
            off.width = img.naturalWidth;
            off.height = img.naturalHeight;
            if (off.width === 0 || off.height === 0) throw new Error("empty image");
            const octx = off.getContext("2d");
            if (!octx) throw new Error("no 2d context");
            octx.drawImage(img, 0, 0);
            const bmp: ImageBitmap = await w.createImageBitmap(off);
            bitmapsRef.current.set(rounded, bmp);
          } finally {
            pendingImagesRef.current = pendingImagesRef.current.filter((el) => el !== img);
          }
        }
      } catch {
        // Ignore: frame simply stays uncached and last-good-frame is used.
      } finally {
        decodingRef.current.delete(rounded);
      }
    },
    [getFrameUrl, sanitizeFrame]
  );

  // Draw a frame on canvas. Draws ONLY fully-decoded bitmaps; if the
  // requested frame is not ready yet, the last successfully painted frame
  // is kept on screen (no clear, no flash, no partial image).
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const rounded = sanitizeFrame(frameIndex);
    let key = rounded;
    if (!bitmapsRef.current.has(key)) {
      // Request it for next time, but paint last-good-frame (or nothing yet).
      if (lastDrawnRef.current === null) return;
      key = lastDrawnRef.current;
    }
    const bmp = bitmapsRef.current.get(key);
    if (!bmp || bmp.width === 0) return;

    // Skip redundant repaints of the identical bitmap.
    if (lastDrawnRef.current === key && key === rounded) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Aspect ratio fit (anchored strictly to bottom-center)
    const imgRatio = bmp.width / bmp.height;
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

    // Pixel-snap the destination rect: fractional offsets force the sampler
    // to blend transparent cutout edges with the page behind them, which
    // produced the faint white fringe on hair / arms during motion.
    drawX = Math.round(drawX);
    drawY = Math.round(drawY);
    drawWidth = Math.round(drawWidth);
    drawHeight = Math.round(drawHeight);

    ctx.drawImage(bmp, drawX, drawY, drawWidth, drawHeight);
    lastDrawnRef.current = key;

    // opportunistically start decoding the requested frame if missing
    if (key !== rounded) void loadFrame(rounded);
  }, [loadFrame, sanitizeFrame]);

  // Size the canvas backing store to its EXACT displayed size (x device-pixel
  // ratio). A backing store whose aspect differs from the displayed box forces
  // the GPU compositor to rescale this repainted-every-frame layer, which
  // produces intermittent solid-white raster blocks on hair / belt / watch.
  // Matching backing to display 1:1 removes the rescale — and the blocks.
  const sizeCanvasToDisplay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch) return false;
    const w = Math.max(1, Math.round(cw * dpr));
    const h = Math.max(1, Math.round(ch * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      return true; // resized => must repaint (resize clears the canvas)
    }
    return false;
  }, []);

  // Preload frames progressively (instant neutral frame first)
  useEffect(() => {
    let isCancelled = false;
    const { neutralFrame, leftMaxFrame, rightMaxFrame } = portfolioConfig.character;

    // Backing store matches the displayed box exactly (falls back to the
    // 9:16 frame aspect when layout is not measurable yet).
    if (!sizeCanvasToDisplay()) {
      const canvas = canvasRef.current;
      if (canvas && (canvas.width === 300 || canvas.height === 150)) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        // Match frame aspect ratio exactly (1080x1920 = 9:16) to avoid distortion artifacts
        canvas.width = 540 * dpr;
        canvas.height = 960 * dpr;
      }
    }

    // 1. Immediately decode + render neutral frame (zero layout shift)
    void (async () => {
      await loadFrame(neutralFrame);
      if (isCancelled) return;
      if (bitmapsRef.current.has(neutralFrame)) {
        setIsLoaded(true);
        drawFrame(neutralFrame);
      }
    })();

    // 2. Preload range 40 (left max) to 120 (right max) from center outwards.
    // Mask-hole frames are skipped entirely (never fetched, never shown).
    const { excludedFrames } = portfolioConfig.character;
    const framesToLoad: number[] = [];
    for (let offset = 1; offset <= 40; offset++) {
      if (neutralFrame - offset >= leftMaxFrame && !excludedFrames.includes(neutralFrame - offset))
        framesToLoad.push(neutralFrame - offset);
      if (neutralFrame + offset <= rightMaxFrame && !excludedFrames.includes(neutralFrame + offset))
        framesToLoad.push(neutralFrame + offset);
    }

    framesToLoad.forEach((frameIdx) => {
      void loadFrame(frameIdx);
    });

    return () => {
      isCancelled = true;
      // Allow a re-mounted instance (e.g. React StrictMode double-effects in
      // dev) to decode frames again instead of being blocked forever.
      decodingRef.current.clear();
      pendingImagesRef.current = [];
    };
  }, [getFrameUrl, drawFrame, loadFrame, sizeCanvasToDisplay]);

  // Keep the backing store glued to the displayed size (responsive resizes,
  // zoom changes, DPR changes). Repaints the current frame after a resize
  // since resizing clears the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (sizeCanvasToDisplay()) {
          lastDrawnRef.current = null;
          drawFrame(currentFrameRef.current);
        }
      });
    });
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [sizeCanvasToDisplay, drawFrame]);

  // Main 60fps render loop using requestAnimationFrame + lerp
  // ZERO CSS translation, ZERO layout shift - purely updating canvas pixels.
  // Repaints only when the rounded frame index actually changes, so two
  // adjacent frames never shimmer back-and-forth within one stopped pose.
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!prefersReducedMotion) {
        const frameDiff = targetFrameRef.current - currentFrameRef.current;
        if (Math.abs(frameDiff) > 0.05) {
          currentFrameRef.current += frameDiff * 0.12;
          const rounded = sanitizeFrame(currentFrameRef.current);
          if (rounded !== lastDrawnRef.current) {
            drawFrame(rounded);
          }
        } else if (sanitizeFrame(currentFrameRef.current) !== sanitizeFrame(targetFrameRef.current)) {
          // Snap to the exact target when close enough, then paint once.
          currentFrameRef.current = targetFrameRef.current;
          drawFrame(sanitizeFrame(currentFrameRef.current));
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [drawFrame, sanitizeFrame]);

  // Release GPU bitmap memory on unmount.
  useEffect(() => {
    const cache = bitmapsRef.current;
    return () => {
      cache.forEach((bmp) => {
        try {
          bmp.close();
        } catch {
          /* noop */
        }
      });
      cache.clear();
    };
  }, []);

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

      targetFrameRef.current = sanitizeFrame(targetF);
    };

    const resetToNeutral = () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      targetFrameRef.current = sanitizeFrame(portfolioConfig.character.neutralFrame);
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
  }, [sanitizeFrame]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-end justify-center w-[340px] sm:w-[440px] md:w-[500px] lg:w-[380px] xl:w-[520px] 2xl:w-[600px] h-[480px] sm:h-[580px] md:h-[660px] lg:h-[620px] xl:h-[700px] 2xl:h-[780px] select-none pointer-events-none"
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
