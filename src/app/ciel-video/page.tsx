"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const VideoPage: React.FC = () => {
  // Use a flexible any ref so it is compatible with the react-youtube ref type
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Player options: request autoplay. Many browsers will only autoplay muted videos,
  // so we'll try to unmute programmatically and show a fallback overlay if blocked.
  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      mute: 0, // request unmuted autoplay (browsers may still block this)
      rel: 0,
      modestbranding: 1,
      fs: 1,
    },
  };

  const tryUnmuteAndPlay = async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      console.debug("tryUnmuteAndPlay: attempting to unmute/play", { player });
      // Attempt multiple rapid attempts to unmute and play (best-effort).
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          if (typeof player.unMute === "function") player.unMute();
          if (typeof player.setVolume === "function") player.setVolume(100);
          if (typeof player.playVideo === "function") await player.playVideo();
        } catch (e) {
          // ignore per-attempt error
        }
        // short delay between attempts
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 150));
      }

      // Check whether the player is playing (PlayerState.PLAYING === 1)
      try {
        const state = typeof player.getPlayerState === "function" ? player.getPlayerState() : null;
        console.debug("player state after play attempts", state);
        if (state !== 1) {
          // Not playing — browser likely blocked autoplay
          setIsPlaying(false);
          setIsMuted(true);
          return;
        }
      } catch (e) {
        // ignore getPlayerState errors
      }

      setIsMuted(false);
      setIsPlaying(true);
    } catch (err) {
      console.debug("tryUnmuteAndPlay: failed to unmute/play", err);
      setIsMuted(true);
      setIsPlaying(false);
    }
  };

  const onReady = (event: any): void => {
    // This onReady is from react-youtube; when using iframe API we won't use this.
  };

  const onPlay = () => {
    setIsPlaying(true);
  };

  const onPause = () => {
    setIsPlaying(false);
  };

  const handleOverlayClick = async () => {
    // kept for compatibility but not used — prefer global interaction listener
    const player = playerRef.current;
    if (!player) return;
    try {
      if (typeof player.unMute === "function") player.unMute();
      if (typeof player.setVolume === "function") player.setVolume(100);
      if (typeof player.playVideo === "function") await player.playVideo();
    } catch (e) {
      // ignore
    }
    setIsMuted(false);
    setIsPlaying(true);
  };

  // In case the iframe player instance changes, try to unmute once more
  // Load YouTube IFrame API and create player
  useEffect(() => {
    let ytScript: HTMLScriptElement | null = null;
    let player: any = null;

    const onYouTubeIframeAPIReady = () => {
      // @ts-ignore - YT comes from global script
      if (typeof window.YT === "undefined") return;
      // Create the player attached to the container
      // @ts-ignore
      player = new window.YT.Player("yt-player", {
        height: "100%",
        width: "100%",
        videoId: "uREbbhqztMs",
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          modestbranding: 1,
          fs: 1,
        },
        events: {
          onReady: async (e: any) => {
            playerRef.current = e.target;
            console.debug("YT iframe onReady:", e.target);
            try {
              // ensure player is muted initially and try to play
              if (typeof e.target.mute === "function") e.target.mute();
              if (typeof e.target.playVideo === "function") e.target.playVideo();
            } catch (err) {
              console.debug("onReady: play attempt failed", err);
            }

            // small delay then attempt to unmute/play and check state
            setTimeout(() => tryUnmuteAndPlay(), 250);
          },
          onStateChange: (e: any) => {
            // YT PlayerState.PLAYING === 1
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2) setIsPlaying(false);
          },
        },
      });
    };

    // Install global listener to attempt unmute on first interaction
    const onFirstInteraction = async () => {
      await tryUnmuteAndPlay();
    };
    document.addEventListener("pointerdown", onFirstInteraction, { once: true });
    document.addEventListener("click", onFirstInteraction, { once: true });

    // Inject script if YT not present
    if (typeof window !== "undefined" && typeof (window as any).YT === "undefined") {
      ytScript = document.createElement("script");
      ytScript.src = "https://www.youtube.com/iframe_api";
      ytScript.async = true;
      // The API will call window.onYouTubeIframeAPIReady when loaded
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      document.body.appendChild(ytScript);
    } else {
      // already available
      onYouTubeIframeAPIReady();
    }

    return () => {
      // cleanup
      document.removeEventListener("pointerdown", onFirstInteraction);
      document.removeEventListener("click", onFirstInteraction);
      try {
        if (player && typeof player.destroy === "function") player.destroy();
      } catch (e) {
        // ignore
      }
      if (ytScript && ytScript.parentNode) ytScript.parentNode.removeChild(ytScript);
      // @ts-ignore
      if ((window as any).onYouTubeIframeAPIReady) delete (window as any).onYouTubeIframeAPIReady;
    };
  }, []);

  return (
    <div className="pt-0 min-h-screen">
      <section className="py-20 bg-background min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-[min(420px,95vw)] aspect-[9/16] rounded-lg overflow-hidden shadow-lg relative -translate-x-2">
            {/* IFrame-based YouTube player container (phone-sized, responsive) */}
            <div id="yt-player" className="w-full h-full flex justify-center items-center" />

            {/* Overlay buttons: phone-style (centered & stacked) on all screens */}
            <div className="absolute z-20 bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">

              <Link
                href={process.env.NODE_ENV === "development" ? "http://donate.localhost:3000" : "https://donate." + process.env.NEXT_PUBLIC_HOSTNAME}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 hover:from-rose-600 hover:via-pink-600 hover:to-indigo-600 text-white font-semibold px-3 py-2 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300"
                aria-label="Donate"
                title="Donate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 21s-6-4.35-9-7.02C1.6 11.9 2 7.75 5.5 5.5 8 3.9 10.5 4 12 6c1.5-2 4-2.1 6.5-.5C22 7.75 22.4 11.9 21 13.98 18 16.65 12 21 12 21z" />
                </svg>
                <span className="text-sm">Donate</span>
              </Link>
            </div>

          </div>
            
        </div>
      </section>
    </div>
  );
};

export default VideoPage;
