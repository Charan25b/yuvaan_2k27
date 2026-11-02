"use client";

import React from "react";

// ============================================================================
// ⚠️ TEMPORARY PLACEHOLDER: 4x HATSUNE MIKU VIDEO GRID
// To reverse/remove this placeholder entirely:
// 1. In OpenComicBookModal.tsx, set `ENABLE_PLACEHOLDER_VIDEOS = false`
// 2. Or delete this file when production rulebook content is ready.
// ============================================================================

const MIKU_VIDEO_ID = "_-2dIuV34cs";
const START_SECONDS = 60; // 0:59 min mark

export const stopAllPlaceholderVideos = () => {
  if (typeof document === "undefined") return;
  const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe[data-placeholder-video]");
  iframes.forEach((f) => {
    try {
      f.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
      f.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', "*");
    } catch {}
  });
};

const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
  try {
    const iframe = e.currentTarget;
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "seekTo", args: [START_SECONDS, true] }),
      "*"
    );
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "unMute", args: "" }),
      "*"
    );
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: "" }),
      "*"
    );
  } catch {}
};

interface VideoPanelProps {
  panelNumber: number;
}

function VideoPanel({ panelNumber }: VideoPanelProps) {
  return (
    <div className="relative flex-1 w-full rounded-xl border-2 border-[#1C1917] overflow-hidden bg-black shadow-[3px_3px_0px_#1C1917] min-h-[140px]">
      <div className="absolute top-1 left-2 z-10 px-2 py-0.5 rounded bg-[#FDE047] text-[#1C1917] border border-[#1C1917] font-black text-[9px] uppercase tracking-wider shadow-sm pointer-events-none">
        PANEL #{panelNumber}
      </div>
      <iframe
        data-placeholder-video="true"
        src={`https://www.youtube.com/embed/${MIKU_VIDEO_ID}?autoplay=1&start=${START_SECONDS}&enablejsapi=1&playsinline=1&panel=${panelNumber}`}
        title={`Miku Panel ${panelNumber}`}
        className="w-full h-full border-0 block"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleIframeLoad}
      />
    </div>
  );
}

export function PlaceholderLeftPage() {
  return (
    <div className="w-full h-full flex flex-col gap-3 justify-between">
      <VideoPanel panelNumber={1} />
      <VideoPanel panelNumber={2} />
    </div>
  );
}

export function PlaceholderRightPage() {
  return (
    <div className="w-full h-full flex flex-col gap-3 justify-between">
      <VideoPanel panelNumber={3} />
      <VideoPanel panelNumber={4} />
    </div>
  );
}
