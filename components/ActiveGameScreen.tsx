"use client";

import React, { useEffect, useRef, useState } from "react";
import { PhotoManifestItem } from "@/src/lib/photos";
import { BIRTHDAY_CONFIG } from "@/config/birthday";
import { BIRTHDAY_CONTENT } from "@/src/content/birthday-content";
import { KuromiSkullIcon } from "./KuromiDecorations";
import { PolaroidCardStack } from "./PolaroidCardStack";

interface ActiveGameScreenProps {
  photos: PhotoManifestItem[];
  onGameEnd: (finalTapCount: number) => void;
  durationMs?: number;
  transitionDelayMs?: number;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
}

export function ActiveGameScreen({
  photos,
  onGameEnd,
  durationMs = BIRTHDAY_CONFIG.gameDurationMs,
  transitionDelayMs = BIRTHDAY_CONFIG.gameToResultDelayMs,
}: ActiveGameScreenProps) {
  const content = BIRTHDAY_CONTENT.game;

  // Game state
  const [tapCount, setTapCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [buttonSquishKey, setButtonSquishKey] = useState<number>(0);
  const [flashKey, setFlashKey] = useState<number>(0);

  // High-frequency synchronized timer & progress state
  const [progress, setProgress] = useState<number>(1); // 1 -> 0

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef<number>(0);
  const hasEndedRef = useRef<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Timer loop via requestAnimationFrame to guarantee smooth, drift-free synchronization
  useEffect(() => {
    startTimeRef.current = performance.now();
    hasEndedRef.current = false;

    const tick = (now: number) => {
      if (!startTimeRef.current) return;

      const elapsed = now - startTimeRef.current;
      const clampedElapsed = Math.min(elapsed, durationMs);

      // Direct mathematical relationship:
      // progress = 1 at start (elapsed = 0)
      // progress = 0.5 at midpoint (elapsed = durationMs / 2)
      // progress = 0 at end (elapsed >= durationMs)
      const currentProgress = Math.max(0, 1 - clampedElapsed / durationMs);
      setProgress(currentProgress);

      if (elapsed >= durationMs) {
        // Guarantee failure outcome: exactly progress 0, age 20
        setProgress(0);
        setIsGameOver(true);
        hasEndedRef.current = true;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Auto-transition to results screen after the configured delay
        transitionTimerRef.current = setTimeout(() => {
          onGameEnd(tapCountRef.current);
        }, transitionDelayMs);
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [durationMs, transitionDelayMs, onGameEnd]);

  // Derived mathematical values (guaranteed lockstep)
  const age = BIRTHDAY_CONFIG.targetAge * (1 - progress);
  const progressPercent = progress * 100;

  // Format age: clean integer display without decimals, guaranteed 20 when finished
  const formattedAge =
    isGameOver || progress <= 0.0001
      ? "20"
      : Math.min(BIRTHDAY_CONFIG.targetAge, Math.floor(age)).toString();

  // Tap handler: no debouncing, no throttling, unique ripple per tap
  const handleTap = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Stop accepting taps immediately once game has ended
    if (isGameOver || hasEndedRef.current) return;

    e.preventDefault();

    // 1. Increment tap counter (drives both score and card stack fling)
    setTapCount((prev) => {
      const next = prev + 1;
      tapCountRef.current = next;
      return next;
    });

    // 2. Trigger button squish feedback
    setButtonSquishKey((k) => k + 1);

    // 3. Trigger shutter flash overlay
    setFlashKey((k) => k + 1);

    // 4. Create visible ripple effect with unique identifier
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 75;
    const y = rect ? e.clientY - rect.top : 75;

    const newRipple: Ripple = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);
  };

  const removeRipple = (id: string) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] safe-area-padding w-full max-w-md mx-auto px-4 py-3 select-none touch-none overflow-hidden">
      {/* 1. Header: Age Counter, Taps, and Progress Bar */}
      <div className="w-full space-y-2.5">
        {/* Age display with urgency styling as age approaches 20 */}
        <div className="flex items-baseline justify-between bg-gradient-to-r from-[#24103f] to-[#1c0c32] p-3 rounded-xl border border-[#8538e1]/40 shadow-md">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#ffb3ce]">
              {content.ageLabel}
            </p>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f4e8ff] via-[#d4b8fc] to-[#ff70a6]">
              {formattedAge} <span className="text-sm font-semibold text-[#d4b8fc]">yrs</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#d4b8fc]">
              {content.tapsLabel}
            </p>
            <div className="text-3xl font-black text-[#ff70a6] font-mono">
              {tapCount}
            </div>
          </div>
        </div>

        {/* Mathematically Synchronized Progress Bar */}
        <div className="relative w-full h-4 bg-[#1b082e] rounded-full overflow-hidden border border-[#ff70a6]/40 p-[2px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff70a6] via-[#d81b60] to-[#9f5cf0] transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Photo Display: Instagram-style Physical Polaroid Card Stack */}
      <div className="relative w-full my-auto flex items-center justify-center py-2">
        <PolaroidCardStack photos={photos} tapCount={tapCount} />

        {/* Instant Camera Shutter Flash overlay on tap */}
        <div
          key={flashKey}
          className="absolute inset-0 bg-white/30 pointer-events-none rounded-3xl animate-photo-flash opacity-0 z-30"
        />
      </div>

      {/* 3. Bottom Action Zone: Giant Ergonomic Mash Button */}
      <div className="w-full flex flex-col items-center justify-center pt-1 pb-3">
        <div className="relative flex items-center justify-center">
          {/* Active Ripples container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                onAnimationEnd={() => removeRipple(ripple.id)}
                className="animate-ripple border-4 border-[#ff70a6]/80 bg-[#ff70a6]/20"
                style={{
                  width: "160px",
                  height: "160px",
                  left: "50%",
                  top: "50%",
                }}
              />
            ))}
          </div>

          {/* Giant Circular Touch-optimized Mash Button */}
          <button
            ref={buttonRef}
            type="button"
            onPointerDown={handleTap}
            disabled={isGameOver}
            key={buttonSquishKey}
            className={`touch-mash-button relative w-36 h-36 sm:w-40 sm:h-40 rounded-full shadow-[0_12px_30px_rgba(255,112,166,0.6)] flex flex-col items-center justify-center transition-transform cursor-pointer border-4 border-[#ffb3ce] ${
              buttonSquishKey > 0 ? "animate-squish" : ""
            } ${
              isGameOver
                ? "bg-gray-600 opacity-60 cursor-not-allowed"
                : "bg-gradient-to-tr from-[#d81b60] via-[#ff70a6] to-[#bb8cf7] active:scale-95"
            }`}
            style={{
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-1.5 rounded-full border-2 border-[#ff70a6]/50 animate-pulse pointer-events-none" />

            {/* Inner button content */}
            <KuromiSkullIcon className="w-8 h-8 text-white mb-1 drop-shadow" />
            <span className="text-white font-black text-xl tracking-wider leading-none drop-shadow-md">
              {isGameOver ? "TIME UP!" : "MASH!"}
            </span>
            <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest mt-1">
              {isGameOver ? "RESCUE OVER" : "KEEP HER YOUNG"}
            </span>
          </button>
        </div>

        <p className="text-xs font-semibold text-[#ffb3ce] mt-2.5 tracking-wide">
          {isGameOver ? "Calculating results..." : "Tap rapidly to fling memories! 📸"}
        </p>
      </div>
    </div>
  );
}
