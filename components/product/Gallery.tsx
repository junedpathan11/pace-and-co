"use client";

import Image from "next/image";
import { useState } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { ChevronLeft, ChevronRight, CloseIcon } from "@/components/ui/icons";

export default function Gallery({
  images,
  alt,
  priority = true,
}: {
  images: string[];
  alt: string;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const lbRef = useFocusTrap(lightbox, () => setLightbox(false));

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-grey">
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${alt} — view ${index + 1}`}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 600px"
          className="animate-fade-in object-cover"
        />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Open full-size image"
          className="absolute inset-0 cursor-zoom-in"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-chip bg-surface/90 text-ink shadow-[var(--shadow-card)] hover:bg-surface"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-chip bg-surface/90 text-ink shadow-[var(--shadow-card)] hover:bg-surface"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={`relative h-20 w-16 overflow-hidden rounded-img border-2 transition-colors ${
                i === index ? "border-ink" : "border-transparent"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/80"
            onClick={() => setLightbox(false)}
          />
          <div
            ref={lbRef}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="relative max-h-[90vh] w-full max-w-3xl"
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={images[index]}
                alt={`${alt} — enlarged view ${index + 1}`}
                fill
                sizes="90vw"
                className="rounded-card object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close viewer"
              className="absolute -top-2 right-0 grid h-11 w-11 place-items-center rounded-chip bg-surface text-ink shadow-[var(--shadow-card)]"
            >
              <CloseIcon />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-chip bg-surface text-ink"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-chip bg-surface text-ink"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
