"use client";

import React, { useEffect } from "react";
import { BIRTHDAY_CONFIG, getRoastMessage } from "@/config/birthday";
import { BIRTHDAY_CONTENT } from "@/src/content/birthday-content";
import { KuromiSkullIcon, SparkleStar } from "./KuromiDecorations";

interface ResultScreenProps {
  tapCount: number;
  onTimeout: () => void;
  durationMs?: number;
}

export function ResultScreen({
  tapCount,
  onTimeout,
  durationMs = BIRTHDAY_CONFIG.resultDurationMs,
}: ResultScreenProps) {
  const content = BIRTHDAY_CONTENT.result;
  const roast = getRoastMessage(tapCount);

  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [onTimeout, durationMs]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] safe-area-padding w-full max-w-md mx-auto text-center px-5 py-6 select-none">
      {/* Skull Icon with shaking / alert animation */}
      <div className="relative mb-6">
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

      <p className="text-sm font-bold text-[#d4b8fc] uppercase tracking-widest mb-6">
        Time ran out • Adulthood has arrived
      </p>

      {/* Stats Card */}
      <div className="w-full p-5 rounded-2xl bg-gradient-to-b from-[#24103f] to-[#180a2b] border border-[#ff70a6]/40 shadow-2xl space-y-4 mb-6">
        <div className="flex items-center justify-between py-2 border-b border-[#8538e1]/30">
          <span className="text-sm font-medium text-[#d4b8fc]">{content.recoveredLabel}:</span>
          <span className="text-lg font-black text-[#ff70a6] font-mono">{content.recoveredValue}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#8538e1]/30">
          <span className="text-sm font-medium text-[#d4b8fc]">{content.attemptsLabel}:</span>
          <span className="text-lg font-black text-white font-mono">{tapCount}</span>
        </div>

        {/* Dynamic Roast */}
        <div className="pt-2">
          <p className="text-xs uppercase tracking-wider text-[#ffb3ce] font-semibold mb-1">
            Status Evaluation:
          </p>
          <p className="text-base sm:text-lg font-bold text-[#f4e8ff] italic bg-[#170928] py-2 px-3 rounded-lg border border-[#8538e1]/30">
            &ldquo;{roast}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#d4b8fc]/80 font-medium">
        <span className="w-2 h-2 rounded-full bg-[#ff70a6] animate-ping" />
        <span>Transitioning to official ceremony...</span>
      </div>
    </div>
  );
}
