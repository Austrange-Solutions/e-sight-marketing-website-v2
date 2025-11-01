'use client';
import React, { useEffect, useState, useRef } from 'react';

type Slide = {
  id: string;
  key: string;
  url: string;
  altText?: string;
};

export default function Carousel({ autoplay = true, interval = 4000 }: { autoplay?: boolean; interval?: number }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchSlides() {
      try {
        const res = await fetch('/api/carousel');
        const data = await res.json();
        if (!mounted) return;
        if (data && data.success) {
          setSlides(data.data || []);
        } else {
          console.warn('Failed to load carousel images', data);
        }
      } catch (err) {
        console.error('Error fetching carousel images', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (slides.length ? (i + 1) % slides.length : 0));
    }, interval) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides, autoplay, interval]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-card rounded-2xl">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-card rounded-2xl">
        <div className="text-muted-foreground">No images configured for carousel</div>
      </div>
    );
  }

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <div className="w-full h-96 relative rounded-2xl overflow-hidden bg-card">
      {slides.map((s, i) => (
        <img
          key={s.id}
          src={s.url}
          alt={s.altText || `Slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transitionProperty: 'opacity, transform'
          }}
        />
      ))}

      {/* Prev / Next */}
      <button
        aria-label="Previous"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/40"
      >
        ‹
      </button>
      <button
        aria-label="Next"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/40"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
