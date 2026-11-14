import { useState } from 'react';
import type { RoomCategory } from '@/src/data/roomsData';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import { RoomCard } from '@/src/components/RoomCard';
import { RoomLightboxModal } from '@/src/components/RoomLightboxModal';
import { RoomDetailsModal } from '@/src/components/RoomDetailsModal';
import { RoomContactModal } from '@/src/components/RoomContactModal';

interface RoomsSectionProps {
  onBookRoom: (room: RoomCategory) => void;
}

export function RoomsSection({ onBookRoom }: RoomsSectionProps) {
  const { activePublicRooms } = useHotelStore();
  const [lightboxState, setLightboxState] = useState<{
    room: RoomCategory;
    photoIndex: number;
  } | null>(null);
  const [detailsRoom, setDetailsRoom] = useState<RoomCategory | null>(null);
  const [contactRoom, setContactRoom] = useState<RoomCategory | null>(null);

  return (
    <section
      id="rooms"
      className="bg-[#F6F4EF] text-[#111113] py-24 lg:py-32 border-t border-black/5"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A6D3B]">
              Our Rooms
            </p>
            <h2 className="font-display mt-4 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1.12] text-[#111113] [text-wrap:balance]">
              Sanctuaries of Space, Light &amp; Restraint
            </h2>
          </div>

          <p className="max-w-md text-sm sm:text-base leading-relaxed text-[#4E4E55]">
            Explore our curated room categories—each appointed with bespoke
            joinery, tranquil lighting, and attentive five-star hospitality.
          </p>
        </div>

        {/* Room Cards Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
        {activePublicRooms.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-black/10 bg-white p-12 text-center">
            <p className="font-display text-2xl text-[#111113]">
              No rooms currently published
            </p>
            <p className="mt-2 text-sm text-[#5C5C63]">
              Rooms activated in the Admin Dashboard will appear here
              automatically.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {activePublicRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onOpenLightbox={(selectedRoom, photoIndex) =>
                  setLightboxState({ room: selectedRoom, photoIndex })
                }
                onViewDetails={(selectedRoom) => setDetailsRoom(selectedRoom)}
                onBookRoom={(selectedRoom) => onBookRoom(selectedRoom)}
                onContactRoom={(selectedRoom) => setContactRoom(selectedRoom)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Modals for Rooms */}
      <RoomDetailsModal
        room={detailsRoom}
        onClose={() => setDetailsRoom(null)}
        onBookRoom={(selectedRoom) => onBookRoom(selectedRoom)}
        onOpenLightbox={(selectedRoom, photoIndex) =>
          setLightboxState({ room: selectedRoom, photoIndex })
        }
      />

      <RoomContactModal
        room={contactRoom}
        onClose={() => setContactRoom(null)}
        onOpenLightbox={(selectedRoom, photoIndex) =>
          setLightboxState({ room: selectedRoom, photoIndex })
        }
      />

      <RoomLightboxModal
        room={lightboxState?.room ?? null}
        initialIndex={lightboxState?.photoIndex ?? 0}
        onClose={() => setLightboxState(null)}
      />
    </section>
  );
}
