import type { ReactNode } from 'react';
import { AboutSection } from '@/src/components/AboutSection';
import { ServicesSection } from '@/src/components/ServicesSection';
import { GallerySection } from '@/src/components/GallerySection';
import { ContactSection } from '@/src/components/ContactSection';

interface SectionFoundationProps {
  onOpenBooking: (preferredSuite?: string) => void;
  onNavigate: (sectionId: string) => void;
  roomsSlot?: ReactNode;
}

export function SectionFoundation({
  onOpenBooking,
  onNavigate,
  roomsSlot,
}: SectionFoundationProps) {
  return (
    <>
      {/* 1. ABOUT OUR HOTEL */}
      <AboutSection onExploreRooms={() => onNavigate('rooms')} />

      {/* 2. OUR ROOMS */}
      {roomsSlot}

      {/* 3. HOTEL SERVICES */}
      <ServicesSection />

      {/* 4. PHOTO GALLERY */}
      <GallerySection />

      {/* 5. CONTACT US & GOOGLE MAPS */}
      <ContactSection onOpenBooking={onOpenBooking} />
    </>
  );
}
