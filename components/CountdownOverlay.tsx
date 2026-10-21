"use client";

import React, { useEffect, useState } from "react";
import { SparkleStar, KuromiSkullIcon } from "./KuromiDecorations";

interface CountdownOverlayProps {
  onComplete: () => void;
  countFrom?: number;
}

export function CountdownOverlay({ onComplete, countFrom = 3 }: CountdownOverlayProps) {
  const [currentStep, setCurrentStep] = useState<number>(countFrom); // 3, 2, 1, 0 (GO)

  useEffect(() => {
    if (currentStep > 0) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      // Step 0 is "GO!" - show briefly then complete
      const timer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const displayLabel = currentStep > 0 ? currentStep.toString() : "GO!";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#150926]/95 backdrop-blur-md safe-area-padding px-4 select-none touch-none">
      {/* Decorative stars */}
      <div className="absolute top-12 left-10 animate-float">
        <SparkleStar className="w-8 h-8 text-[#ff70a6]" />
      </div>
      <div className="absolute top-20 right-10 animate-float" style={{ animationDelay: "1s" }}>
        <SparkleStar className="w-6 h-6 text-[#d4b8fc]" />
      </div>
      <div className="absolute bottom-20 left-12 animate-float" style={{ animationDelay: "1.5s" }}>
        <KuromiSkullIcon className="w-10 h-10" />
      </div>

      <div className="text-center">
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#d4b8fc] uppercase mb-4">
          RESCUE COUNTDOWN INITIATED
        </p>

        {/* Large animated number key-framed by currentStep */}
        <div
          key={currentStep}
          className="animate-countdown text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ff70a6] via-[#f4e8ff] to-[#9f5cf0] drop-shadow-[0_15px_30px_rgba(255,112,166,0.6)]"
        >
          {displayLabel}
        </div>

        <p className="text-sm font-semibold text-[#ffb3ce] mt-6">
          {currentStep > 0 ? "Get your thumbs ready!" : "MASH AS FAST AS YOU CAN!"}
        </p>
      </div>
    </div>
  );
}
