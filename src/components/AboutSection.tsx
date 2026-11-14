import { ArrowRight, Check } from 'lucide-react';
import { ABOUT_SECTION_DATA } from '@/src/data/hotelSectionsData';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface AboutSectionProps {
  onExploreRooms: () => void;
}

export function AboutSection({ onExploreRooms }: AboutSectionProps) {
  const { hotelInfo } = useHotelStore();
  return (
    <section
      id="about"
      className="bg-[#FAF9F6] text-[#111113] py-24 lg:py-32 border-t border-black/5"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Side: Large Hotel Photograph */}
          <div className="lg:col-span-6">
            <div className="group relative h-full min-h-[380px] overflow-hidden rounded-2xl bg-[#EAE6DF] shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
              <img
                src={ABOUT_SECTION_DATA.photoSrc}
                alt={ABOUT_SECTION_DATA.photoAlt}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 via-black/20 to-transparent"
              />
              <p className="absolute bottom-5 left-6 right-6 text-xs font-medium tracking-[0.14em] uppercase text-white/90">
                {hotelInfo.hotelName} · {ABOUT_SECTION_DATA.photoCaption}
              </p>
            </div>
          </div>

          {/* Right Side: Hotel Introduction, Mission, Hospitality & Counters */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A6D3B]">
                {ABOUT_SECTION_DATA.subtitle}
              </p>
              <h2 className="font-display mt-3 text-[clamp(2.1rem,3.8vw,3.25rem)] font-medium leading-[1.1] text-[#111113] [text-wrap:balance]">
                {ABOUT_SECTION_DATA.heading}
              </h2>

              <div
                aria-hidden="true"
                className="my-6 h-px w-16 bg-[#C9A96E]"
              />

              <p className="text-base leading-[1.75] text-[#3F3F46]">
                {ABOUT_SECTION_DATA.introduction}
              </p>

              {/* Editorial Pillars: Hospitality, Mission & Comfort */}
              <div className="mt-7 grid grid-cols-1 gap-5 border-t border-black/10 pt-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.14em] uppercase text-[#8A6D3B]">
                    Our Hospitality
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4E4E55]">
                    {ABOUT_SECTION_DATA.hospitality}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold tracking-[0.14em] uppercase text-[#8A6D3B]">
                    Our Mission
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4E4E55]">
                    {ABOUT_SECTION_DATA.mission}
                  </p>
                </div>
              </div>

              {/* Commitment & Why Choose Our Hotel */}
              <div className="mt-6 border-t border-black/10 pt-6">
                <h3 className="text-xs font-semibold tracking-[0.14em] uppercase text-[#8A6D3B]">
                  Guest Comfort &amp; Why Choose Us
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4E4E55]">
                  {ABOUT_SECTION_DATA.comfortCommitment}
                </p>

                <ul className="mt-4 space-y-2">
                  {ABOUT_SECTION_DATA.whyChooseUs.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2.5 text-sm text-[#27272A]"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6D3B]"
                        aria-hidden="true"
                      />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Highlight Counters & Explore Our Rooms CTA */}
            <div className="mt-9 border-t border-black/10 pt-8">
              <div className="grid grid-cols-3 gap-6">
                {ABOUT_SECTION_DATA.highlights.map((item) => (
                  <div key={item.id}>
                    <p className="font-display text-3xl sm:text-4xl font-semibold text-[#111113] tabular-nums">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium tracking-wide text-[#5C5C63]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={onExploreRooms}
                  className="group inline-flex min-h-[46px] items-center gap-2.5 rounded-full bg-[#C9A96E] px-7 py-3 text-sm font-semibold tracking-[0.04em] text-[#0A0A0B] transition-all duration-200 hover:bg-[#D8BA82] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(201,169,110,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6D3B] cursor-pointer"
                >
                  <span>Explore Our Rooms</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
