import { useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { HOTEL_CONFIG } from '@/src/config/hotelConfig';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface HeroSectionProps {
  onExploreRooms: () => void;
  onBookStay: () => void;
  onScrollNext: () => void;
}

export function HeroSection({
  onExploreRooms,
  onBookStay,
  onScrollNext,
}: HeroSectionProps) {
  const { hotelInfo } = useHotelStore();
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section
      id="home"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A0A0B]"
    >
      {/* Persistent high-resolution poster backdrop so initial frame or fallback is always seamless */}
      <img
        src={HOTEL_CONFIG.heroPosterSrc}
        alt={`${hotelInfo.hotelName} architectural grand lobby`}
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Cinematic 6-second promotional video background */}
      {!videoFailed && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          src={HOTEL_CONFIG.heroVideoSrc}
          poster={HOTEL_CONFIG.heroPosterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        />
      )}

      {/* Measured dark contrast scrim for crisp text legibility across all video luminance */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-[#0A0A0B]/90"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,10,11,0.18)_0%,rgba(10,10,11,0.58)_100%)]"
      />

      {/* Center Editorial Content Over Video */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-24 pb-20 text-center sm:px-8">
        <p className="mb-5 text-xs sm:text-sm font-medium tracking-[0.22em] uppercase text-[#E2CFA4]">
          {HOTEL_CONFIG.tagline}
        </p>

        <h1 className="font-display max-w-4xl text-[clamp(2.65rem,6vw,4.75rem)] font-medium leading-[1.06] tracking-[-0.01em] text-white [text-wrap:balance] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
          {HOTEL_CONFIG.heroHeading}
        </h1>

        <div
          aria-hidden="true"
          className="my-7 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent"
        />

        <p className="max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-white/88 [text-wrap:pretty]">
          {HOTEL_CONFIG.heroSubtitle}
        </p>

        {/* Primary & Secondary Action Buttons */}
        <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-5">
          <button
            type="button"
            onClick={onExploreRooms}
            className="group inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#C9A96E] px-8 py-3.5 text-sm font-semibold tracking-[0.06em] text-[#0A0A0B] whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#E2CFA4] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(201,169,110,0.32)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] cursor-pointer"
          >
            <span>Explore Rooms</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={onBookStay}
            className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-full border border-white/45 bg-black/35 px-8 py-3.5 text-sm font-semibold tracking-[0.06em] text-white backdrop-blur-sm whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#C9A96E] hover:bg-[#C9A96E]/15 hover:text-[#E2CFA4] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] cursor-pointer"
          >
            Book Your Stay
          </button>
        </div>
      </div>

      {/* Bottom Scroll Anchor Cue */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
        <button
          type="button"
          onClick={onScrollNext}
          aria-label="Scroll to About Our Hotel section"
          className="group flex flex-col items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-white/75 transition-colors duration-200 hover:text-[#E2CFA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-md px-3 py-1 cursor-pointer"
        >
          <span>Discover</span>
          <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-1" />
        </button>
      </div>
    </section>
  );
}
