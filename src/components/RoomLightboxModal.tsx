import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { RoomCategory } from '@/src/data/roomsData';

interface RoomLightboxModalProps {
  room: RoomCategory | null;
  initialIndex: number;
  onClose: () => void;
}

export function RoomLightboxModal({
  room,
  initialIndex,
  onClose,
}: RoomLightboxModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex, room]);

  const total = room?.photos.length ?? 0;

  const goToNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!room) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [room, onClose, goToNext, goToPrev]);

  if (!room) return null;

  const currentPhoto = room.photos[activeIndex] ?? room.photos[0];

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${room.name} full-screen photo gallery`}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-4 sm:p-6 text-white backdrop-blur-md"
    >
      {/* Top Bar */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A96E]">
            {room.categoryLabel}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-white">
            {room.name}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-white/70 tabular-nums">
            {activeIndex + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo gallery"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Photo Viewport */}
      <div
        className="relative mx-auto my-4 flex w-full max-w-5xl flex-1 items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto.src}
          alt={currentPhoto.alt}
          referrerPolicy="no-referrer"
          className="max-h-[68vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 border border-white/20 text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 border border-white/20 text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Caption & Thumbnail Strip */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4">
        <p className="text-sm font-medium text-white/85">
          {currentPhoto.caption}
        </p>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {room.photos.map((photo, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={photo.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Select ${photo.caption}`}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#C9A96E] opacity-100 scale-105'
                    : 'border-transparent opacity-55 hover:opacity-90'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
