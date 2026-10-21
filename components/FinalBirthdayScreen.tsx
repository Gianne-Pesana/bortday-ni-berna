"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { BIRTHDAY_CONTENT } from "@/src/content/birthday-content";
import { KuromiSkullIcon, KuromiJesterHat, SparkleStar, CuteBow } from "./KuromiDecorations";

interface FinalBirthdayScreenProps {
  onReplay: () => void;
}

export function FinalBirthdayScreen({ onReplay }: FinalBirthdayScreenProps) {
  const content = BIRTHDAY_CONTENT.final;

  useEffect(() => {
    // Fire festive Kuromi birthday confetti
    const fireConfetti = () => {
      // First burst from sides
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6, x: 0.2 },
        colors: ["#ff70a6", "#d4b8fc", "#9f5cf0", "#ffffff", "#ffb3ce"],
      });
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6, x: 0.8 },
        colors: ["#ff70a6", "#d4b8fc", "#9f5cf0", "#ffffff", "#ffb3ce"],
      });

      // Center sparkle burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.4, x: 0.5 },
          colors: ["#ff70a6", "#bb8cf7", "#ffe5f1", "#f72585"],
        });
      }, 300);
    };

    fireConfetti();
  }, []);

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] safe-area-padding w-full max-w-md mx-auto text-center px-5 py-8">
      {/* Top Header Decor */}
      <div className="flex flex-col items-center w-full pt-2">
        <div className="flex items-center gap-3 mb-3 animate-float">
          <SparkleStar className="w-5 h-5 text-[#ff70a6]" />
          <KuromiJesterHat className="w-16 h-10 text-[#d4b8fc]" />
          <SparkleStar className="w-5 h-5 text-[#ff70a6]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#321359] border border-[#ff70a6]/50 text-[#ffb3ce] text-xs font-bold tracking-wider uppercase mb-3">
          <CuteBow className="w-4 h-3 text-[#ff70a6]" />
          OCTOBER 22, 2026
          <CuteBow className="w-4 h-3 text-[#ff70a6]" />
        </div>

        {/* Happy 20th Birthday Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff70a6] via-[#f4e8ff] to-[#bb8cf7] tracking-tight leading-tight mb-2">
          {content.heading}
        </h1>

        <p className="text-sm font-semibold text-[#ffb3ce]">
          {content.tagline}
        </p>
      </div>

      {/* Main Heartfelt Message Card */}
      <div className="relative w-full my-6 p-6 rounded-2xl bg-gradient-to-b from-[#24103f]/95 to-[#1c0c32]/95 border-2 border-[#ff70a6]/40 shadow-[0_15px_35px_rgba(255,112,166,0.25)] text-left space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#8538e1]/30">
          <KuromiSkullIcon className="w-6 h-6 text-[#ff70a6]" />
          <span className="text-xs font-bold tracking-wider uppercase text-[#d4b8fc]">
            {content.cardHeader}
          </span>
        </div>

        <p className="text-sm sm:text-base text-[#f4e8ff] leading-relaxed font-normal">
          {content.mainParagraph}
        </p>
      </div>

      {/* Bottom Replay Action */}
      <div className="w-full pb-4">
        <button
          type="button"
          onClick={onReplay}
          className="touch-mash-button w-full py-4 px-6 rounded-2xl bg-[#24103f] hover:bg-[#32155a] border-2 border-[#8538e1]/60 text-[#f4e8ff] font-bold text-sm sm:text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🔄</span>
          <span>{content.replayButton}</span>
        </button>
      </div>
    </div>
  );
}
