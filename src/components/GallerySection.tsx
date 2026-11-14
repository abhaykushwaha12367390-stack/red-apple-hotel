import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { GALLERY_CATEGORIES } from '@/src/data/hotelSectionsData';
import type { AdminGalleryCategory } from '@/src/types/hotel';
import { useHotelStore } from '@/src/context/HotelStoreContext';

type PublicGalleryFilter = 'All Photos' | AdminGalleryCategory;

const PUBLIC_GALLERY_CATEGORIES: PublicGalleryFilter[] = [
  ...GALLERY_CATEGORIES,
  'Exterior',
];

export function GallerySection() {
  const { galleryPhotos } = useHotelStore();
  const [selectedCategory, setSelectedCategory] =
    useState<PublicGalleryFilter>('All Photos');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'All Photos') {
      return galleryPhotos;
    }
    return galleryPhotos.filter(
      (photo) => photo.category === selectedCategory
    );
  }, [galleryPhotos, selectedCategory]);

  const totalFiltered = filteredPhotos.length;

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goToNext = useCallback(() => {
    if (totalFiltered === 0) return;
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + 1) % totalFiltered
    );
  }, [totalFiltered]);

  const goToPrev = useCallback(() => {
    if (totalFiltered === 0) return;
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev - 1 + totalFiltered) % totalFiltered
    );
  }, [totalFiltered]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
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
  }, [lightboxIndex, closeLightbox, goToNext, goToPrev]);

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

  const activeLightboxPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] ?? null : null;

  return (
    <section
      id="gallery"
      className="bg-[#F3F1EC] text-[#111113] py-24 lg:py-32 border-t border-black/5"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Heading & Subtitle */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A6D3B]">
              Photo Gallery
            </p>
            <h2 className="font-display mt-3 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1.12] text-[#111113] [text-wrap:balance]">
              Explore Our Hotel
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#4E4E55]">
              Take a closer look at our rooms, facilities and hospitality.
            </p>
          </div>

          <p className="text-xs font-medium text-[#5C5C63] tabular-nums">
            Showing {filteredPhotos.length} photograph
            {filteredPhotos.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter hotel photo gallery by category"
          className="mt-10 flex flex-wrap items-center gap-2 border-b border-black/10 pb-5"
        >
          {PUBLIC_GALLERY_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setSelectedCategory(category);
                  setLightboxIndex(null);
                }}
                className={`min-h-[40px] rounded-full px-5 py-2 text-xs font-semibold tracking-[0.04em] whitespace-nowrap transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6D3B] ${
                  isActive
                    ? 'bg-[#111113] text-white shadow-sm'
                    : 'bg-white text-[#3F3F46] border border-black/10 hover:border-[#8A6D3B] hover:text-[#111113]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Responsive Photo Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`View ${photo.title} in full-screen gallery`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white text-left shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6D3B] cursor-zoom-in"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E5E1D8]">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3.5 right-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
                >
                  <Expand className="h-4 w-4" />
                </span>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#8A6D3B]">
                    {photo.category}
                  </span>
                </div>
                <h3 className="font-display mt-1 text-xl font-semibold text-[#111113]">
                  {photo.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5C5C63] line-clamp-1">
                  {photo.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Full-Screen Gallery Lightbox */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Hotel photo lightbox: ${activeLightboxPhoto.title}`}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-4 sm:p-6 text-white backdrop-blur-md"
        >
          {/* Top Bar */}
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A96E]">
                {activeLightboxPhoto.category}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-medium text-white">
                {activeLightboxPhoto.title}
              </h3>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs font-medium text-white/75 tabular-nums">
                {lightboxIndex + 1} / {totalFiltered}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close gallery lightbox"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Image Viewport with Swipe */}
          <div
            className="relative mx-auto my-4 flex w-full max-w-5xl flex-1 items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={activeLightboxPhoto.src}
              alt={activeLightboxPhoto.alt}
              referrerPolicy="no-referrer"
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-2xl transition-opacity duration-300"
            />

            {totalFiltered > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous gallery photo"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 border border-white/20 text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next gallery photo"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 border border-white/20 text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Caption & Thumbnail Strip */}
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3">
            <p className="text-sm text-white/80 text-center">
              {activeLightboxPhoto.description}
            </p>

            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
              {filteredPhotos.map((thumb, idx) => {
                const isSelected = idx === lightboxIndex;
                return (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    aria-label={`View ${thumb.title}`}
                    className={`relative h-12 w-18 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#C9A96E] opacity-100 scale-105'
                        : 'border-transparent opacity-50 hover:opacity-85'
                    }`}
                  >
                    <img
                      src={thumb.src}
                      alt={thumb.alt}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
