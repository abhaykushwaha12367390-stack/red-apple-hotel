import {
  Bath,
  BedDouble,
  Car,
  ConciergeBell,
  Droplets,
  Shirt,
  Snowflake,
  Sparkles,
  Tv,
  UserCheck,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react';
import {
  SERVICE_FEATURE_PHOTOS,
  type ServiceIconKey,
} from '@/src/data/hotelSectionsData';
import { useHotelStore } from '@/src/context/HotelStoreContext';

const SERVICE_ICONS: Record<ServiceIconKey, typeof Wifi> = {
  ac: Snowflake,
  wifi: Wifi,
  tv: Tv,
  bathroom: Bath,
  water: Droplets,
  'room-service': ConciergeBell,
  restaurant: UtensilsCrossed,
  housekeeping: Sparkles,
  bed: BedDouble,
  parking: Car,
  laundry: Shirt,
  reception: UserCheck,
};

export function ServicesSection() {
  const { activePublicServices } = useHotelStore();

  return (
    <section
      id="services"
      className="bg-white text-[#111113] py-24 lg:py-32 border-t border-black/5"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A6D3B]">
              Hotel Services &amp; Facilities
            </p>
            <h2 className="font-display mt-3 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1.12] text-[#111113] [text-wrap:balance]">
              Hospitality Tailored Around Every Hour
            </h2>
          </div>

          <p className="max-w-md text-sm sm:text-base leading-relaxed text-[#4E4E55]">
            Thoughtful room comforts and attentive guest services designed to
            keep every moment of your stay effortless.
          </p>
        </div>

        {/* Curated Hospitality Photography Strip */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {SERVICE_FEATURE_PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              className="group overflow-hidden rounded-2xl border border-black/8 bg-[#FAF9F6]"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#EAE6DF]">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="px-5 py-4">
                <p className="font-display text-xl font-medium text-[#111113]">
                  {photo.title}
                </p>
                <p className="mt-1 text-xs text-[#5C5C63]">{photo.subtitle}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Editable Services & Facilities Grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activePublicServices.map((service) => {
            const IconComponent = SERVICE_ICONS[service.iconKey] ?? Sparkles;
            return (
              <div
                key={service.id}
                className="group flex items-start gap-4 rounded-2xl border border-black/8 bg-[#FAF9F6] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A96E]/60 hover:bg-white hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
              >
                {service.customImageSrc ? (
                  <img
                    src={service.customImageSrc}
                    alt={service.title}
                    className="h-11 w-11 shrink-0 rounded-xl object-cover border border-[#C9A96E]/35"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C9A96E]/35 bg-white text-[#8A6D3B] transition-colors duration-200 group-hover:bg-[#C9A96E] group-hover:text-[#0A0A0B]">
                    <IconComponent className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold leading-snug text-[#111113]">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4E4E55]">
                    {service.description}
                  </p>
                  {service.availabilityNote && (
                    <p className="mt-2 text-[11px] font-medium tracking-wide text-[#8A6D3B]">
                      {service.availabilityNote}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
