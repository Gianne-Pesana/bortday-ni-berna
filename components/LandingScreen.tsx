"use client";

import React from "react";
import { BIRTHDAY_CONTENT } from "@/src/content/birthday-content";
import { KuromiSkullIcon, KuromiJesterHat, SparkleStar, CuteBow } from "./KuromiDecorations";

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  isReady: boolean;
}

export function LandingScreen({
  onStart,
  isLoading,
  loadedCount,
  totalCount,
  isReady,
}: LandingScreenProps) {
  const content = BIRTHDAY_CONTENT.landing;
  const percent = totalCount > 0 ? Math.min(100, Math.round((loadedCount / totalCount) * 100)) : 100;

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] safe-area-padding w-full max-w-md mx-auto text-center px-4 py-8">
      {/* Top Header Decor */}
      <div className="flex flex-col items-center w-full pt-4">
        <div className="flex items-center gap-2 mb-3 animate-float">
          <SparkleStar className="w-5 h-5 text-[#ff70a6]" />
          <KuromiJesterHat className="w-16 h-10 text-[#d4b8fc]" />
          <SparkleStar className="w-5 h-5 text-[#d4b8fc]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#f4e8ff] tracking-tight leading-tight">
          {content.title}
        </h1>
        <p className="text-sm sm:text-base text-[#d4b8fc] mt-1.5 font-medium">
          {content.subtitle}
        </p>
      </div>

      {/* Center Card with Kuromi aesthetic */}
      <div className="relative w-full my-6 p-6 rounded-2xl bg-gradient-to-b from-[#24103f] to-[#1c0c32] border border-[#8538e1]/30 shadow-2xl backdrop-blur-sm">
        {/* Decorative corner bows */}
        <div className="absolute -top-3 -left-2 rotate-[-15deg]">
          <CuteBow className="w-7 h-5 text-[#ff70a6]" />
        </div>
        <div className="absolute -top-3 -right-2 rotate-[15deg]">
          <CuteBow className="w-7 h-5 text-[#ff70a6]" />
        </div>

        {/* Center skull badge */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#32155a] border-2 border-[#ff70a6]/50 flex items-center justify-center mb-4 shadow-lg">
          <KuromiSkullIcon className="w-11 h-11" />
        </div>

        <p className="text-sm sm:text-base text-[#f0e4ff] leading-relaxed mb-4">
          {content.description}
        </p>

        {/* Visual Memory Preload Status Bar */}
        <div className="pt-3 border-t border-[#8538e1]/30">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5 px-1">
            <span className="text-[#ffb3ce] flex items-center gap-1">
              <SparkleStar className="w-3.5 h-3.5 text-[#ff70a6]" />
              {isReady ? "All Memories Loaded" : "Preloading Memories..."}
            </span>
            <span className="font-mono text-[#d4b8fc]">
              {loadedCount}/{totalCount} ({percent}%)
            </span>
          </div>

          <div className="relative w-full h-2.5 rounded-full bg-[#170928] overflow-hidden border border-[#8538e1]/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff70a6] via-[#d81b60] to-[#bb8cf7] transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="w-full pb-4">
        <button
          type="button"
          onClick={onStart}
          disabled={isLoading || !isReady}
          className="touch-mash-button group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ff70a6] via-[#d81b60] to-[#9f5cf0] text-white font-extrabold text-lg sm:text-xl shadow-[0_10px_25px_-5px_rgba(255,112,166,0.5)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait overflow-hidden cursor-pointer"
        >
          {/* Sheen highlight */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />

          <span className="relative flex items-center justify-center gap-2">
            {!isReady || isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading Memories ({percent}%)...</span>
              </>
            ) : (
              <>
                <span>{content.startButton}</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">⚡</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
