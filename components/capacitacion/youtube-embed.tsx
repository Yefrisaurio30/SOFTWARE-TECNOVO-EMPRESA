"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

/**
 * Portada + iframe bajo demanda: no carga el player de YouTube hasta que el
 * usuario hace clic. Usa youtube-nocookie (sin cookies de terceros).
 */
export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[20px] border border-white/10 bg-graphite">
      {playing ? (
        <iframe
          src={`${youtubeEmbedUrl(videoId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir video: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youtubeThumbnailUrl(videoId)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
          <span
            className="absolute inset-0 grid place-items-center"
            style={{ background: "rgba(0,0,0,.35)" }}
            aria-hidden
          >
            <span className="grid size-14 place-items-center rounded-full bg-steel text-[#000] transition group-hover:scale-110">
              <Play size={24} fill="currentColor" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}