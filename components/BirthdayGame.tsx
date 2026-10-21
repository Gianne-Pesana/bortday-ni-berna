"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getPhotos,
  preloadPhotos,
  arePhotosPreloaded,
  getPreloadCount,
  subscribePreloadProgress,
  PhotoManifestItem,
} from "@/src/lib/photos";
import { LandingScreen } from "./LandingScreen";
import { CountdownOverlay } from "./CountdownOverlay";
import { ActiveGameScreen } from "./ActiveGameScreen";
import { ResultScreen } from "./ResultScreen";
import { FinalBirthdayScreen } from "./FinalBirthdayScreen";

type GamePhase = "landing" | "countdown" | "playing" | "result" | "final";

export function BirthdayGame() {
  const [phase, setPhase] = useState<GamePhase>("landing");
  const [photos] = useState<PhotoManifestItem[]>(getPhotos);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);
  const [finalTapCount, setFinalTapCount] = useState<number>(0);
  const [preloadState, setPreloadState] = useState(() => getPreloadCount());

  // Immediately preload & pre-decode all photos upon opening the website
  useEffect(() => {
    const unsubscribe = subscribePreloadProgress((loaded, total) => {
      setPreloadState({
        loaded,
        total,
        isReady: loaded >= total,
      });
    });

    preloadPhotos(photos).then(() => {
      setPreloadState({
        loaded: photos.length,
        total: photos.length,
        isReady: true,
      });
    });

    return () => unsubscribe();
  }, [photos]);

  // Handle start from landing screen:
  // If photos are already preloaded, transition instantly.
  // Otherwise wait for the active preload promise to settle.
  const handleStartMission = async () => {
    if (arePhotosPreloaded() || preloadState.isReady) {
      setPhase("countdown");
      return;
    }

    setIsLoadingPhotos(true);
    try {
      await preloadPhotos(photos);
    } catch (err) {
      console.warn("Error preloading photos:", err);
    } finally {
      setIsLoadingPhotos(false);
      setPhase("countdown");
    }
  };

  // Transition from countdown to active gameplay
  const handleCountdownComplete = useCallback(() => {
    setPhase("playing");
  }, []);

  // Transition from active gameplay to brief result screen
  const handleGameEnd = useCallback((taps: number) => {
    setFinalTapCount(taps);
    setPhase("result");
  }, []);

  // Transition from result screen to final birthday screen
  const handleResultProceed = useCallback(() => {
    setPhase("final");
  }, []);

  // Replay resets all state
  const handleReplay = useCallback(() => {
    setFinalTapCount(0);
    setPhase("landing");
  }, []);

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#150926]">
      {/* Background ambient lighting accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full bg-[#8538e1]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full bg-[#ff70a6]/15 blur-3xl pointer-events-none" />

      {/* Screen flow */}
      {phase === "landing" && (
        <LandingScreen
          onStart={handleStartMission}
          isLoading={isLoadingPhotos}
          loadedCount={preloadState.loaded}
          totalCount={preloadState.total}
          isReady={preloadState.isReady}
        />
      )}

      {phase === "countdown" && (
        <CountdownOverlay onComplete={handleCountdownComplete} countFrom={3} />
      )}

      {phase === "playing" && (
        <ActiveGameScreen photos={photos} onGameEnd={handleGameEnd} />
      )}

      {phase === "result" && (
        <ResultScreen tapCount={finalTapCount} onProceed={handleResultProceed} />
      )}

      {phase === "final" && <FinalBirthdayScreen onReplay={handleReplay} />}
    </main>
  );
}
