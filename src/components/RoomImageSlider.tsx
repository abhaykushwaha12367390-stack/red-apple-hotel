import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import type { RoomPhoto } from '@/src/data/roomsData';

interface RoomImageSliderProps {
  photos: RoomPhoto[];
  roomName: string;
  autoPlayIntervalMs?: number;
  aspectClassName?: string;
  onImageClick?: (currentIndex: number) => void;
  showExpandHint?: boolean;
}

export function RoomImageSlider({
  photos,
  roomName,
  autoPlayIntervalMs = 3000,
  aspectClassName = 'aspect-[4/3]',
  onImageClick,
  showExpandHint = true,
}: RoomImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const total = photos.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(goToNext, autoPlayIntervalMs);
    return () => window.clearInterval(timer);
  }, [total, isPaused, autoPlayIntervalMs, goToNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  if (total === 0) return null;

  return (
    <div
      className={`group/slider relative w-full overflow-hidden rounded-xl bg-[#EAE6DF] select-none ${aspectClassName}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label={`${roomName} photo gallery`}
    >
      {/* Slides with smooth cross-fade */}
      <button
        type="button"
        onClick={() => onImageClick?.(currentIndex)}
        aria-label={`Open full gallery for ${roomName}, viewing ${photos[currentIndex].caption}`}
        className={`relative block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
          onImageClick ? 'cursor-zoom-in' : 'cursor-default'
        }`}
      >
        {photos.map((photo, index) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            referrerPolicy="no-referrer"
            loading={index === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              index === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-[1.02] pointer-events-none'
            }`}
          />
        ))}

        {/* Bottom gradient scrim for legible dots & caption */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
        />
      </button>

      {/* Expand Lightbox Affordance */}
      {onImageClick && showExpandHint && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick(currentIndex);
          }}
          aria-label={`Enlarge ${roomName} photographs`}
          className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/90 backdrop-blur-sm opacity-0 transition-all duration-200 group-hover/slider:opacity-100 hover:bg-black/75 hover:text-[#E2CFA4] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] cursor-pointer"
        >
          <Expand className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Previous & Next Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label={`Previous photograph of ${roomName}`}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-85 md:opacity-0 md:group-hover/slider:opacity-100 transition-all duration-200 hover:bg-black/80 hover:text-[#E2CFA4] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label={`Next photograph of ${roomName}`}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-85 md:opacity-0 md:group-hover/slider:opacity-100 transition-all duration-200 hover:bg-black/80 hover:text-[#E2CFA4] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Caption & Indicator Dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex items-center justify-between gap-3 px-3.5">
        <span className="truncate text-[11px] font-medium tracking-wide text-white/90 drop-shadow-sm">
          {photos[currentIndex].caption}
        </span>

        {total > 1 && (
          <div
            className="pointer-events-auto flex items-center gap-1.5 shrink-0"
            role="tablist"
            aria-label={`${roomName} slide indicators`}
          >
            {photos.map((photo, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={photo.src}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`View photo ${index + 1} of ${total}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
                    isActive
                      ? 'w-5 bg-[#E2CFA4]'
                      : 'w-1.5 bg-white/55 hover:bg-white/90'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
