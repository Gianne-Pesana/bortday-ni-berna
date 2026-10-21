"use client";

import React, { useEffect, useState, useRef } from "react";
import { PhotoManifestItem } from "@/src/lib/photos";
import { KuromiSkullIcon, SparkleStar, CuteBow } from "./KuromiDecorations";

interface PolaroidCardStackProps {
  photos: PhotoManifestItem[];
  tapCount: number;
}

interface FlungCard {
  id: number;
  tapNumber: number;
  direction: "left" | "right";
  photo: PhotoManifestItem;
}

// Preset stack rotations and offsets for the physical deck feel
const STACK_PRESETS = [
  { rotate: 0, translateY: 0, scale: 1, zIndex: 10, opacity: 1 },
  { rotate: -2.5, translateY: 4, scale: 0.97, zIndex: 9, opacity: 0.96 },
  { rotate: 3, translateY: 8, scale: 0.94, zIndex: 8, opacity: 0.88 },
  { rotate: -1.5, translateY: 12, scale: 0.91, zIndex: 7, opacity: 0.75 },
  { rotate: 2, translateY: 16, scale: 0.88, zIndex: 6, opacity: 0.6 },
];

export function PolaroidCardStack({ photos, tapCount }: PolaroidCardStackProps) {
  const [flungCards, setFlungCards] = useState<FlungCard[]>([]);
  const prevTapCountRef = useRef<number>(tapCount);

  // When tapCount increases, fling the previous top card
  useEffect(() => {
    const prevTap = prevTapCountRef.current;
    if (tapCount > prevTap && photos.length > 0) {
      // For every tap gained, schedule a fling
      const newlyFlung: FlungCard[] = [];
      for (let t = prevTap; t < tapCount; t++) {
        const photo = photos[t % photos.length];
        const direction: "left" | "right" = t % 2 === 0 ? "right" : "left";
        newlyFlung.push({
          id: t,
          tapNumber: t,
          direction,
          photo,
        });
      }

      setFlungCards((prev) => [...prev, ...newlyFlung]);

      // Automatically clean up flung cards after the fling animation finishes (350ms)
      const cleanupTimer = setTimeout(() => {
        setFlungCards((current) => current.filter((c) => c.tapNumber >= tapCount - 2));
      }, 350);

      prevTapCountRef.current = tapCount;
      return () => clearTimeout(cleanupTimer);
    }
    prevTapCountRef.current = tapCount;
  }, [tapCount, photos]);

  if (photos.length === 0) {
    return (
      <div className="w-64 h-80 rounded-2xl bg-[#f7f0fc] p-4 flex flex-col items-center justify-center border-4 border-[#ffb3ce] shadow-2xl">
        <KuromiSkullIcon className="w-14 h-14 text-[#ff70a6] mb-2" />
        <p className="text-xs font-bold text-[#42127e]">No memories found</p>
      </div>
    );
  }

  // Sliding window of exactly 5 cards underneath
  const stackCards = [0, 1, 2, 3, 4].map((depth) => {
    const currentTapNumber = tapCount + depth;
    const photo = photos[currentTapNumber % photos.length];
    return {
      depth,
      tapNumber: currentTapNumber,
      photo,
      preset: STACK_PRESETS[depth],
    };
  });

  return (
    <div className="relative w-64 sm:w-72 h-[340px] sm:h-[360px] mx-auto select-none pointer-events-none flex items-center justify-center">
      {/* 1. Flung Cards Animating Off-Screen */}
      {flungCards.map((flung) => {
        const isRight = flung.direction === "right";
        return (
          <div
            key={`flung-${flung.id}`}
            className="absolute inset-0 transition-all duration-300 ease-out"
            style={{
              transform: isRight
                ? "translate3d(140%, -50px, 0) rotate(28deg) scale(0.9)"
                : "translate3d(-140%, -50px, 0) rotate(-28deg) scale(0.9)",
              opacity: 0,
              zIndex: 25,
            }}
          >
            <PolaroidCard
              photo={flung.photo}
              index={(flung.tapNumber % photos.length) + 1}
              total={photos.length}
            />
          </div>
        );
      })}

      {/* 2. Physical 5-Card Stack (Sliding Window Buffer) */}
      {stackCards
        .slice()
        .reverse()
        .map(({ tapNumber, photo, preset }) => {
          return (
            <div
              key={`stack-${tapNumber}`}
              className="absolute inset-0 transition-all duration-200 ease-out"
              style={{
                transform: `translate3d(0, ${preset.translateY}px, 0) scale(${preset.scale}) rotate(${preset.rotate}deg)`,
                zIndex: preset.zIndex,
                opacity: preset.opacity,
              }}
            >
              <PolaroidCard
                photo={photo}
                index={(tapNumber % photos.length) + 1}
                total={photos.length}
              />
            </div>
          );
        })}
    </div>
  );
}

interface PolaroidCardProps {
  photo: PhotoManifestItem;
  index: number;
  total: number;
}

function PolaroidCard({ photo, index, total }: PolaroidCardProps) {
  return (
    <div className="w-full h-full p-3 pb-5 rounded-2xl bg-[#faf7f2] border-2 border-[#f0e3f5] shadow-[0_12px_28px_rgba(0,0,0,0.45)] flex flex-col justify-between overflow-hidden relative">
      {/* Cute Decorative Sticker on Top Right */}
      <div className="absolute top-1.5 right-2 z-10 rotate-[12deg] pointer-events-none">
        {index % 3 === 0 ? (
          <KuromiSkullIcon className="w-6 h-6 text-[#ff70a6] drop-shadow-sm" />
        ) : index % 3 === 1 ? (
          <CuteBow className="w-6 h-4 text-[#ff70a6] drop-shadow-sm" />
        ) : (
          <SparkleStar className="w-4 h-4 text-[#bb8cf7]" />
        )}
      </div>

      {/* Photo Frame Window */}
      <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-[#24103f] border border-black/5 flex items-center justify-center">
        {/* Direct eager-loaded image using decoded in-memory cache */}
        {photo.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.src}
            alt={photo.filename}
            loading="eager"
            decoding="sync"
            className="w-full h-full object-cover select-none pointer-events-none"
            onError={(e) => {
              // Graceful fallback if a single image fails
              (e.currentTarget as HTMLImageElement).src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%2332155a'/><text x='200' y='210' font-size='40' text-anchor='middle'>💖</text></svg>";
            }}
          />
        ) : (
          <div className="text-center p-4">
            <KuromiSkullIcon className="w-10 h-10 mx-auto text-[#ff70a6]" />
          </div>
        )}

        {/* Date Stamp Overlay if dated */}
        {photo.isDated && photo.dateTaken && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-mono text-[#ffb3ce] pointer-events-none border border-white/10">
            📅 {photo.dateTaken.split("T")[0]}
          </div>
        )}
      </div>

      {/* Polaroid Bottom Caption Area */}
      <div className="w-full flex items-center justify-between pt-2.5 px-1">
        <span className="flex items-center gap-1 text-xs font-black text-[#321359] tracking-tight">
          <span className="text-[#ff70a6]">★</span>
          Berna Memory #{index}
        </span>
        <span className="text-[11px] font-bold text-[#8538e1] font-mono">
          {index}/{total}
        </span>
      </div>
    </div>
  );
}
