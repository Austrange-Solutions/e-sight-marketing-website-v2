"use client";

import * as React from "react";

type Props = {
  images: { url: string; alt?: string }[];
};

export default function EventImageCarousel({ images }: Props) {
  const [index, setIndex] = React.useState(0);
  const count = images.length;

  React.useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index].url}
        alt={images[index].alt || `Slide ${index + 1}`}
        className="w-full h-80 sm:h-96 object-cover"
      />
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setIndex((index - 1 + count) % count)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((index + 1) % count)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
            aria-label="Next"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />)
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
