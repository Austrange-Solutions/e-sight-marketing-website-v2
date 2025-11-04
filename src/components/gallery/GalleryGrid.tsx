"use client";

import React, { useEffect, useState, useCallback } from "react";

type ImageItem = { url: string; alt?: string };

export default function GalleryGrid({ images }: { images: ImageItem[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.url}
            alt={img.alt || `image-${i}`}
            className="w-full h-56 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openAt(i)}
          />
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-[90vw] max-h-[90vh] w-full">
            <button
              className="absolute top-2 right-2 bg-black/50 text-white rounded px-2 py-1 z-20"
              onClick={close}
              aria-label="Close"
            >
              ✕
            </button>

            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded px-3 py-2 z-20"
              onClick={prev}
              aria-label="Previous"
            >
              ‹
            </button>

            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded px-3 py-2 z-20"
              onClick={next}
              aria-label="Next"
            >
              ›
            </button>

            <div className="w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[index].url} alt={images[index].alt || `image-${index}`} className="max-w-full max-h-[80vh] rounded" />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-white text-sm">
              {index + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
