import heroPosterImage from '@/src/assets/images/hero_hotel_poster_1794602841540.jpg';
import heroHotelVideo from '@/src/assets/images/hero_hotel_video.mp4.mp4';
import aboutArchitectureImage from '@/src/assets/images/about_hotel_architecture_1794602842204.jpg';

export interface NavItem {
  label: string;
  href: string;
  sectionId: string;
}

/**
 * Editable Hotel Contact Placeholders
 * Replace these placeholders with your actual hotel contact details.
 */
export const HOTEL_NAME = 'RED APPLE HOTEL';
export const HOTEL_PHONE = '01145730170';
export const HOTEL_WHATSAPP = '+91 88601 51690';
export const HOTEL_EMAIL = 'reservations@redapplehotel.com';
export const HOTEL_ADDRESS =
  'FLOOR. T.A. 102, Tughlakabad Extension Opposite of Khana Khazana';
export const HOTEL_DESCRIPTION =
  'An intimate sanctuary blending thoughtful comfort, well-appointed rooms, and attentive round-the-clock hospitality.';

/**
 * Optional: Paste your custom Google Maps Embed URL here.
 * Leave empty to automatically embed using HOTEL_ADDRESS above.
 */
export const HOTEL_MAPS_EMBED_URL = '';

export const WHATSAPP_DEFAULT_MESSAGE =
  'Hello, I am interested in booking a room at your hotel. Please share the details.';

export function getWhatsAppUrl(customMessage = WHATSAPP_DEFAULT_MESSAGE): string {
  const cleanDigits = HOTEL_WHATSAPP.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(customMessage)}`;
}

export function getGoogleMapsSearchUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL_ADDRESS)}`;
}

export function getGoogleMapsDirectionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(HOTEL_ADDRESS)}`;
}

export function getGoogleMapsEmbedSrc(): string {
  if (HOTEL_MAPS_EMBED_URL.trim()) {
    return HOTEL_MAPS_EMBED_URL.trim();
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    HOTEL_ADDRESS
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export const HOTEL_CONFIG = {
  hotelName: HOTEL_NAME,
  tagline: 'Five-Star Sanctuary · Architectural Hospitality',
  description: HOTEL_DESCRIPTION,
  heroVideoSrc: heroHotelVideo,
  heroPosterSrc: heroPosterImage,
  aboutImageSrc: aboutArchitectureImage,
  heroHeading: 'Experience Luxury. Feel at Home.',
  heroSubtitle:
    'Discover exceptional comfort, beautiful rooms and unforgettable hospitality.',
  contact: {
    address: HOTEL_ADDRESS,
    cityCountry: 'Tughlakabad Extension, New Delhi',
    phone: HOTEL_PHONE,
    whatsappNumber: HOTEL_WHATSAPP,
    email: HOTEL_EMAIL,
    checkIn: '3:00 PM',
    checkOut: '12:00 PM',
  },
} as const;

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home', sectionId: 'home' },
  { label: 'Rooms', href: '#rooms', sectionId: 'rooms' },
  { label: 'About Us', href: '#about', sectionId: 'about' },
  { label: 'Services', href: '#services', sectionId: 'services' },
  { label: 'Gallery', href: '#gallery', sectionId: 'gallery' },
  { label: 'Contact Us', href: '#contact', sectionId: 'contact' },
];
