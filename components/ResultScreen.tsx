"use client";

import React, { useState, useEffect } from "react";
import { BIRTHDAY_CONFIG, getRoastMessage } from "@/config/birthday";
import { BIRTHDAY_CONTENT } from "@/src/content/birthday-content";
import { KuromiSkullIcon, SparkleStar } from "./KuromiDecorations";

interface ResultScreenProps {
  tapCount: number;
  onProceed: () => void;
}

export function ResultScreen({ tapCount, onProceed }: ResultScreenProps) {
  const content = BIRTHDAY_CONTENT.result;
  const roast = getRoastMessage(tapCount);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  // Lock button for configured duration to avoid accidental clicks from rapid tapping
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocked(false);
    }, BIRTHDAY_CONFIG.resultButtonLockoutMs);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] safe-area-padding w-full max-w-md mx-auto text-center px-5 py-8 select-none">
      {/* Top Header Decor */}
      <div className="flex flex-col items-center w-full pt-2">
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full bg-[#321359] border-4 border-[#ff70a6] flex items-center justify-center shadow-[0_0_35px_rgba(255,112,166,0.6)] animate-pulse">
            <KuromiSkullIcon className="w-16 h-16 text-[#ff70a6]" />
          </div>
          <div className="absolute -top-2 -right-2">
            <SparkleStar className="w-6 h-6 text-[#ff70a6]" />
          </div>
        </div>

        {/* Failure Header */}
        <h1 className="text-4xl sm:text-5xl font-black text-[#ff70a6] tracking-tight mb-2 drop-shadow-[0_5px_15px_rgba(255,112,166,0.5)]">
          {content.status}
        </h1>

        <p className="text-sm font-bold text-[#d4b8fc] uppercase tracking-widest">
          Time ran out • Adulthood has arrived
        </p>
      </div>

      {/* Stats Card */}
      <div className="w-full my-6 p-6 rounded-2xl bg-gradient-to-b from-[#24103f] to-[#180a2b] border border-[#ff70a6]/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-[#8538e1]/30">
          <span className="text-sm font-medium text-[#d4b8fc]">{content.recoveredLabel}:</span>
          <span className="text-lg font-black text-[#ff70a6] font-mono">{content.recoveredValue}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#8538e1]/30">
          <span className="text-sm font-medium text-[#d4b8fc]">{content.attemptsLabel}:</span>
          <span className="text-lg font-black text-white font-mono">{tapCount}</span>
        </div>

        {/* Dynamic Roast (Status Evaluation label removed) */}
        <div className="pt-2">
          <p className="text-base sm:text-lg font-bold text-[#f4e8ff] italic bg-[#170928] py-3 px-4 rounded-lg border border-[#8538e1]/30">
            &ldquo;{roast}&rdquo;
          </p>
        </div>
      </div>

      {/* Bottom Action Area: User-controlled Proceed Button with Lockout Protection */}
      <div className="w-full pb-4">
        <button
          type="button"
          onClick={onProceed}
          disabled={isLocked}
          className={`touch-mash-button group relative w-full py-4 px-6 rounded-2xl text-lg sm:text-xl font-extrabold transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 ${
            isLocked
              ? "bg-[#281545]/60 text-[#d4b8fc]/40 border border-[#8538e1]/30 cursor-not-allowed opacity-60 shadow-none"
              : "bg-gradient-to-r from-[#ff70a6] via-[#d81b60] to-[#9f5cf0] text-white shadow-[0_10px_25px_-5px_rgba(255,112,166,0.5)] active:scale-[0.98] cursor-pointer"
          }`}
        >
          {/* Subtle sheen highlight */}
          {!isLocked && (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />
          )}

          <span className="relative">Proceed</span>
          <span className="relative text-xl group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}
