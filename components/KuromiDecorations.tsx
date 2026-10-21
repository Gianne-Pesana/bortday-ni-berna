import React from "react";

/**
 * Kuromi Skull Bow Icon
 * Iconic pink skull with black/pink bow
 */
export function KuromiSkullIcon({ className = "w-6 h-6", color = "#FF70A6" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Little crossbones / ears behind */}
      <circle cx="28" cy="30" r="14" fill="#241442" stroke={color} strokeWidth="3" />
      <circle cx="72" cy="30" r="14" fill="#241442" stroke={color} strokeWidth="3" />
      {/* Skull head */}
      <ellipse cx="50" cy="54" rx="34" ry="30" fill="#FFF5FA" stroke="#241442" strokeWidth="4" />
      {/* Left eye (cute tilted heart or circle) */}
      <ellipse cx="38" cy="52" rx="6" ry="8" fill="#241442" />
      {/* Right eye */}
      <ellipse cx="62" cy="52" rx="6" ry="8" fill="#241442" />
      {/* Little nose */}
      <path d="M48 60 L52 60 L50 63 Z" fill="#241442" />
      {/* Skull teeth stitches */}
      <line x1="42" y1="72" x2="42" y2="78" stroke="#241442" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="71" x2="50" y2="79" stroke="#241442" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="72" x2="58" y2="78" stroke="#241442" strokeWidth="3" strokeLinecap="round" />
      {/* Kuromi Bow in center top */}
      <path
        d="M50 32 C42 24 32 26 34 38 C36 46 48 40 50 38 C52 40 64 46 66 38 C68 26 58 24 50 32 Z"
        fill={color}
        stroke="#241442"
        strokeWidth="2"
      />
      <circle cx="50" cy="36" r="4.5" fill="#FFE5F1" stroke="#241442" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Kuromi Jester Ears Silhouette
 */
export function KuromiJesterHat({ className = "w-12 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left ear curving outward */}
      <path
        d="M35 60 C30 35 12 25 15 10 C18 4 28 8 36 28 C42 42 46 55 48 60 Z"
        fill="#1F0D36"
        stroke="#D8B4F8"
        strokeWidth="2"
      />
      {/* Left pink bell */}
      <circle cx="15" cy="10" r="7" fill="#FF70A6" stroke="#FFE3EC" strokeWidth="1.5" />

      {/* Right ear curving outward */}
      <path
        d="M85 60 C90 35 108 25 105 10 C102 4 92 8 84 28 C78 42 74 55 72 60 Z"
        fill="#1F0D36"
        stroke="#D8B4F8"
        strokeWidth="2"
      />
      {/* Right pink bell */}
      <circle cx="105" cy="10" r="7" fill="#FF70A6" stroke="#FFE3EC" strokeWidth="1.5" />

      {/* Center forehead crown arc */}
      <path d="M45 60 Q60 52 75 60" stroke="#FF70A6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Sparkle Star (✦)
 */
export function SparkleStar({ className = "w-4 h-4", color = "#FF70A6" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 0C12 7 7 12 0 12C7 12 12 17 12 24C12 17 17 12 24 12C17 12 12 7 12 0Z" />
    </svg>
  );
}

/**
 * Cute Little Bow
 */
export function CuteBow({ className = "w-6 h-4", color = "#FF85A1" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M25 15 C18 7 4 9 7 20 C9 26 21 21 25 18 C29 21 41 26 43 20 C46 9 32 7 25 15 Z"
        fill={color}
        stroke="#241442"
        strokeWidth="2"
      />
      <circle cx="25" cy="16" r="4" fill="#FFF0F5" stroke="#241442" strokeWidth="1.5" />
    </svg>
  );
}
