import {
  BedDouble,
  Maximize2,
  Users,
  Wifi,
} from 'lucide-react';
import type { RoomCategory } from '@/src/data/roomsData';
import { RoomImageSlider } from '@/src/components/RoomImageSlider';

interface RoomCardProps {
  room: RoomCategory;
  onOpenLightbox: (room: RoomCategory, photoIndex: number) => void;
  onViewDetails: (room: RoomCategory) => void;
  onBookRoom: (room: RoomCategory) => void;
  onContactRoom: (room: RoomCategory) => void;
}

export function RoomCard({
  room,
  onOpenLightbox,
  onViewDetails,
  onBookRoom,
  onContactRoom,
}: RoomCardProps) {
  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-black/8 bg-white text-[#111113] shadow-[0_10px_34px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.11)]">
      <div>
        {/* Card Header Media: Independent 4-6 Photo Slider */}
        <div className="p-3 pb-0">
          <RoomImageSlider
            photos={room.photos}
            roomName={room.name}
            autoPlayIntervalMs={3000}
            aspectClassName="aspect-[4/3]"
            onImageClick={(photoIndex) => onOpenLightbox(room, photoIndex)}
          />
        </div>

        {/* Card Content */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#8A6D3B]">
                {room.categoryLabel}
              </p>
              <h3 className="font-display mt-1 text-2xl sm:text-[1.7rem] font-semibold leading-tight text-[#111113]">
                {room.name}
              </h3>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block rounded bg-[#8A6D3B]/12 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-[#8A6D3B]">
                50% OFF
              </span>
              <p className="mt-0.5 flex items-baseline justify-end gap-1.5 tabular-nums">
                <span className="text-xs font-medium text-[#6B6B72] line-through">
                  {room.currencySymbol}1,999
                </span>
                <span className="text-xs text-[#6B6B72]" aria-hidden="true">
                  →
                </span>
                <span className="font-display text-2xl font-semibold text-[#111113]">
                  {room.currencySymbol}
                  {room.pricePerNight.toLocaleString('en-IN')}
                </span>
              </p>
              <p className="text-[11px] font-medium text-[#6B6B72]">
                per night
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#4E4E55]">
            {room.shortDescription}
          </p>

          {/* Clean Unboxed Key Facilities Row */}
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-black/8 pt-4 text-xs font-medium text-[#3D3D42]">
            <div className="flex items-center gap-2">
              <Maximize2
                className="h-3.5 w-3.5 shrink-0 text-[#8A6D3B]"
                aria-hidden="true"
              />
              <span className="truncate tabular-nums">{room.cardFacilities[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble
                className="h-3.5 w-3.5 shrink-0 text-[#8A6D3B]"
                aria-hidden="true"
              />
              <span className="truncate">{room.cardFacilities[1]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users
                className="h-3.5 w-3.5 shrink-0 text-[#8A6D3B]"
                aria-hidden="true"
              />
              <span className="truncate">{room.cardFacilities[2]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi
                className="h-3.5 w-3.5 shrink-0 text-[#8A6D3B]"
                aria-hidden="true"
              />
              <span className="truncate">{room.cardFacilities[3]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Three Distinct Action Buttons */}
      <div className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-3 gap-2.5 border-t border-black/8 pt-4">
          <button
            type="button"
            onClick={() => onViewDetails(room)}
            className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[#141417]/25 bg-transparent px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#111113] whitespace-nowrap transition-all duration-200 hover:border-[#8A6D3B] hover:text-[#8A6D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6D3B] cursor-pointer"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onBookRoom(room)}
            className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#C9A96E] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#0A0A0B] whitespace-nowrap transition-all duration-200 hover:bg-[#D8BA82] hover:shadow-[0_6px_18px_rgba(201,169,110,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6D3B] cursor-pointer"
          >
            Book Now
          </button>

          <button
            type="button"
            onClick={() => onContactRoom(room)}
            className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#141417] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-white whitespace-nowrap transition-all duration-200 hover:bg-[#2A2A30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141417] cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </div>
    </article>
  );
}
