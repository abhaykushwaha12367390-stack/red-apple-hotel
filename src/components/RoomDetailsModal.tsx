import { useEffect } from 'react';
import {
  Bath,
  BedDouble,
  Check,
  ConciergeBell,
  Maximize2,
  Snowflake,
  Tv,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import type { RoomCategory } from '@/src/data/roomsData';
import { RoomImageSlider } from '@/src/components/RoomImageSlider';

interface RoomDetailsModalProps {
  room: RoomCategory | null;
  onClose: () => void;
  onBookRoom: (room: RoomCategory) => void;
  onOpenLightbox: (room: RoomCategory, photoIndex: number) => void;
}

export function RoomDetailsModal({
  room,
  onClose,
  onBookRoom,
  onOpenLightbox,
}: RoomDetailsModalProps) {
  useEffect(() => {
    if (!room) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [room, onClose]);

  if (!room) return null;

  const specifications = [
    { icon: Maximize2, label: 'Room Size', value: room.roomSize },
    { icon: BedDouble, label: 'Bed Type', value: room.bedType },
    { icon: Users, label: 'Maximum Guests', value: room.maxGuests },
    { icon: Bath, label: 'Bathroom', value: room.bathroomInfo },
    { icon: Snowflake, label: 'Climate & AC', value: room.acAvailability },
    { icon: Tv, label: 'Smart TV', value: room.smartTv },
    { icon: Wifi, label: 'Free Wi-Fi', value: room.wifi },
    { icon: ConciergeBell, label: 'Room Service', value: room.roomService },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#FAF9F6] text-[#111113] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        {/* Sticky Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-white px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#8A6D3B]">
              {room.categoryLabel}
            </p>
            <h2
              id="room-details-title"
              className="font-display mt-1 text-3xl sm:text-4xl font-medium text-[#111113]"
            >
              {room.name}
            </h2>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <div className="hidden sm:block text-right">
              <p className="font-display text-2xl font-semibold text-[#111113] tabular-nums">
                {room.currencySymbol}
                {room.pricePerNight}
              </p>
              <p className="text-xs text-[#6B6B72]">per night</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close room details"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-[#111113] transition-colors hover:border-[#8A6D3B] hover:text-[#8A6D3B] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-8">
          {/* Large Interactive Photo Slider */}
          <RoomImageSlider
            photos={room.photos}
            roomName={room.name}
            autoPlayIntervalMs={3500}
            aspectClassName="aspect-[16/9]"
            onImageClick={(photoIndex) => onOpenLightbox(room, photoIndex)}
          />

          {/* Description & Mobile Price */}
          <div>
            <div className="mb-4 flex items-baseline justify-between border-b border-black/10 pb-3 sm:hidden">
              <span className="text-xs font-medium uppercase tracking-wider text-[#6B6B72]">
                Nightly Rate
              </span>
              <span className="font-display text-2xl font-semibold text-[#111113] tabular-nums">
                {room.currencySymbol}
                {room.pricePerNight}{' '}
                <span className="font-sans text-xs font-normal text-[#6B6B72]">
                  / night
                </span>
              </span>
            </div>

            <h3 className="font-display text-2xl font-medium text-[#111113]">
              Residence Overview
            </h3>
            <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#45454A]">
              {room.fullDescription}
            </p>
          </div>

          {/* Room Specifications */}
          <div>
            <h3 className="font-display text-2xl font-medium text-[#111113]">
              Room Specifications &amp; Core Facilities
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {specifications.map((spec) => {
                const IconComponent = spec.icon;
                return (
                  <div
                    key={spec.label}
                    className="flex items-start gap-3.5 rounded-xl border border-black/8 bg-white p-4"
                  >
                    <IconComponent
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6D3B]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold tracking-wide uppercase text-[#6B6B72]">
                        {spec.label}
                      </p>
                      <p className="mt-1 text-sm text-[#111113]">{spec.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other Facilities & Amenities */}
          <div className="grid grid-cols-1 gap-8 border-t border-black/10 pt-7 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-xl font-medium text-[#111113]">
                Additional Facilities
              </h3>
              <ul className="mt-3 space-y-2.5">
                {room.otherFacilities.map((facility) => (
                  <li
                    key={facility}
                    className="flex items-start gap-2.5 text-sm text-[#45454A]"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6D3B]"
                      aria-hidden="true"
                    />
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-xl font-medium text-[#111113]">
                Included Amenities
              </h3>
              <ul className="mt-3 space-y-2.5">
                {room.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-start gap-2.5 text-sm text-[#45454A]"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6D3B]"
                      aria-hidden="true"
                    />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="flex flex-col-reverse gap-3 border-t border-black/10 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-[#6B6B72]">
            {room.roomSize} · {room.bedType} · {room.maxGuests}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-full border border-black/20 px-6 py-2.5 text-xs font-semibold tracking-wide text-[#111113] transition-colors hover:border-black/45 cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onBookRoom(room);
              }}
              className="min-h-[44px] rounded-full bg-[#C9A96E] px-7 py-2.5 text-xs font-semibold tracking-[0.05em] text-[#0A0A0B] transition-all duration-200 hover:bg-[#D8BA82] hover:shadow-[0_6px_20px_rgba(201,169,110,0.35)] cursor-pointer"
            >
              Book This Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
