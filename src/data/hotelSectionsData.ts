import aboutArchitectureImage from '@/src/assets/images/Whatsapp_image40.jpg.png';
import heroLobbyImage from '@/src/assets/images/hero_hotel_poster_1794602841540.jpg';

import stdInterior from '@/src/assets/images/WhatsApp_image38.jpg.jpeg';
import stdBathroom from '@/src/assets/images/WhatsApp_image35.jpg.jpeg';
import dlxInterior from '@/src/assets/images/WhatsApp_image12.jpg.jpeg';
import sdlxBathroom from '@/src/assets/images/WhatsApp_image31.jpg.jpeg';
import famLounge from '@/src/assets/images/WhatsApp_image20.jpg.jpeg';
import premLiving from '@/src/assets/images/WhatsApp_image29.jpg.jpeg';
import premBath from '@/src/assets/images/WhatsApp_image27.jpg.jpeg';
import premTerrace from '@/src/assets/images/WhatsApp_image30.jpg.jpeg';

import receptionDeskImg from '@/src/assets/images/WhatsApp_image23.jpg.jpeg';
import receptionFoyerImg from '@/src/assets/images/WhatsApp_image24.jpg.jpeg';
import restaurantDiningImg from '@/src/assets/images/WhatsApp_image26.jpg.jpeg';
import restaurantBarImg from '@/src/assets/images/WhatsApp_image25.jpg.jpeg';
import facilitySpaImg from '@/src/assets/images/WhatsApp_image22.jpg.jpeg';
import facilityEntranceImg from '@/src/assets/images/WhatsApp_image21.jpg.jpeg';

/**
 * Editable About Us Content & Placeholder Counters
 * Replace placeholder figures and narrative copy with your property's actual details.
 */
export const ABOUT_SECTION_DATA = {
  heading: 'About Our Hotel',
  subtitle: 'Where Comfort Meets Luxury',
  photoSrc: aboutArchitectureImage,
  photoAlt: 'Sunlit limestone courtyard and bespoke walnut library salon at RED APPLE HOTEL',
  photoCaption: 'Courtyard Library & Architectural Terrace',
  introduction:
    'Thoughtfully designed around sunlit courtyards, warm natural stone, and tailored timber joinery, our hotel offers an intimate sanctuary for discerning travelers seeking quiet residential comfort.',
  hospitality:
    'Every arrival is greeted with unhurried personal attention—combining timeless hospitality traditions with discreet, modern convenience.',
  mission:
    'Our mission is to create a restorative haven where thoughtful architecture, restful sleep, and attentive service make every stay memorable.',
  comfortCommitment:
    'From acoustic room engineering and Egyptian cotton bedding to round-the-clock room and reception care, guest comfort guides every detail.',
  whyChooseUs: [
    'Quiet, sound-insulated rooms with curated natural materials',
    'Attentive 24-hour reception, housekeeping, and dining care',
    'Central promenade location with serene private courtyard lounges',
  ],
  // Editable placeholder counters — replace with your hotel's actual figures
  highlights: [
    { id: 'rooms', value: '60+', label: 'Comfortable Rooms' },
    { id: 'services', value: '12+', label: 'Premium Services' },
    { id: 'satisfaction', value: '99%', label: 'Guest Satisfaction' },
  ],
};

export type ServiceIconKey =
  | 'ac'
  | 'wifi'
  | 'tv'
  | 'bathroom'
  | 'water'
  | 'room-service'
  | 'restaurant'
  | 'housekeeping'
  | 'bed'
  | 'parking'
  | 'laundry'
  | 'reception';

export interface HotelServiceItem {
  id: string;
  title: string;
  description: string;
  iconKey: ServiceIconKey;
  available: boolean;
  availabilityNote?: string;
}

/**
 * Centralized Editable Hotel Services & Facilities
 * Set `available: false` to hide any service not offered at your property.
 */
export const HOTEL_SERVICES_DATA: HotelServiceItem[] = [
  {
    id: 'air-conditioning',
    title: 'Air Conditioning',
    description: 'Whisper-quiet individual climate control in every room and suite.',
    iconKey: 'ac',
    available: true,
  },
  {
    id: 'free-wifi',
    title: 'Free Wi-Fi',
    description: 'Complimentary high-speed fiber internet throughout all guest spaces.',
    iconKey: 'wifi',
    available: true,
  },
  {
    id: 'smart-led-tv',
    title: 'Smart LED Television',
    description: '4K Smart LED displays with streaming access and wireless casting.',
    iconKey: 'tv',
    available: true,
  },
  {
    id: 'attached-bathroom',
    title: 'Attached Bathroom',
    description: 'Private stone-finished en-suite bathrooms with rain showers.',
    iconKey: 'bathroom',
    available: true,
  },
  {
    id: 'hot-cold-water',
    title: 'Hot and Cold Water',
    description: 'Continuous temperature-regulated hot and cold water supply.',
    iconKey: 'water',
    available: true,
  },
  {
    id: 'room-service',
    title: '24/7 Room Service',
    description: 'Round-the-clock in-room dining and attentive guest assistance.',
    iconKey: 'room-service',
    available: true,
  },
  {
    id: 'restaurant-dining',
    title: 'Restaurant and Dining',
    description: 'Seasonal dining room and evening champagne lounge on property.',
    iconKey: 'restaurant',
    available: true,
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping',
    description: 'Daily room care, fresh linens, and optional evening turndown.',
    iconKey: 'housekeeping',
    available: true,
  },
  {
    id: 'king-size-beds',
    title: 'Comfortable King-Size Beds',
    description: 'Plush orthopedic mattresses dressed in breathable cotton linens.',
    iconKey: 'bed',
    available: true,
  },
  {
    id: 'free-parking',
    title: 'Free Parking',
    description: 'Dedicated on-site guest parking and valet bay when spaces permit.',
    iconKey: 'parking',
    available: true,
    availabilityNote: 'Subject to on-site availability',
  },
  {
    id: 'laundry-service',
    title: 'Laundry Service',
    description: 'Same-day garment washing, steam pressing, and dry-cleaning care.',
    iconKey: 'laundry',
    available: true,
    availabilityNote: 'Available upon request',
  },
  {
    id: 'reception-assistance',
    title: 'Reception Assistance',
    description: '24-hour front desk support for check-in, transfers, and local guidance.',
    iconKey: 'reception',
    available: true,
  },
];

export const SERVICE_FEATURE_PHOTOS = [
  {
    id: 'dining-showcase',
    title: 'Restaurant & Dining',
    subtitle: 'Seasonal cuisine and curated cellar pairings',
    src: restaurantDiningImg,
    alt: 'Fine-dining hotel restaurant interior with warm evening table lamps',
  },
  {
    id: 'wellness-showcase',
    title: 'Thermal Sanctuary & Comfort',
    subtitle: 'Tranquil heated limestone pool and relaxation deck',
    src: facilitySpaImg,
    alt: 'Indoor heated thermal pool with warm limestone arches',
  },
  {
    id: 'reception-showcase',
    title: 'Reception & Arrival Care',
    subtitle: 'Attentive 24-hour front desk and concierge support',
    src: receptionDeskImg,
    alt: 'Marble and champagne-brass hotel reception desk',
  },
];

export type GalleryCategory =
  | 'All Photos'
  | 'Rooms'
  | 'Bathrooms'
  | 'Reception'
  | 'Restaurant'
  | 'Facilities';

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'All Photos',
  'Rooms',
  'Bathrooms',
  'Reception',
  'Restaurant',
  'Facilities',
];

export interface GalleryPhoto {
  id: string;
  category: Exclude<GalleryCategory, 'All Photos'>;
  title: string;
  description: string;
  src: string;
  alt: string;
}

/**
 * Editable Hotel Photo Gallery
 * Every entry uses a distinct photograph—no image is repeated across the gallery.
 */
export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-room-standard',
    category: 'Rooms',
    title: 'Standard Room Interior',
    description: 'Walnut writing desk, tailored armchair, and sunlit courtyard glass',
    src: stdInterior,
    alt: 'Standard Room interior with walnut desk and sunlit courtyard windows',
  },
  {
    id: 'gal-room-deluxe',
    category: 'Rooms',
    title: 'Deluxe Room Interior',
    description: 'Oak-paneled retreat with plush king comfort and warm lighting',
    src: dlxInterior,
    alt: 'Deluxe Room interior at RED APPLE HOTEL',
  },
  {
    id: 'gal-room-family',
    category: 'Rooms',
    title: 'Family Living & Dining Terrace',
    description: 'Bright open-plan family lounge opening onto a sunlit balcony',
    src: famLounge,
    alt: 'Family Suite living and dining space with sunlit balcony doors',
  },
  {
    id: 'gal-room-premium',
    category: 'Rooms',
    title: 'Premium Suite Living Salon',
    description: 'Chandelier-lit fireplace salon with panoramic skyline views',
    src: premLiving,
    alt: 'Premium Suite living salon with black marble fireplace at twilight',
  },
  {
    id: 'gal-bath-standard',
    category: 'Bathrooms',
    title: 'Limestone Rain Shower',
    description: 'Honed limestone vanity with frameless glass walk-in shower',
    src: stdBathroom,
    alt: 'Boutique hotel bathroom with honed limestone vanity and rain shower',
  },
  {
    id: 'gal-bath-super-deluxe',
    category: 'Bathrooms',
    title: 'Sculpted Stone Soaking Bath',
    description: 'Deep freestanding soaking tub with double vessel stone sinks',
    src: sdlxBathroom,
    alt: 'Spa-inspired hotel bathroom with sculpted stone soaking tub',
  },
  {
    id: 'gal-bath-premium',
    category: 'Bathrooms',
    title: 'Penthouse Panoramic Spa Bath',
    description: 'Marble spa bath overlooking illuminated evening skyline',
    src: premBath,
    alt: 'Penthouse marble spa bathroom with oval soaking tub beside skyline windows',
  },
  {
    id: 'gal-reception-desk',
    category: 'Reception',
    title: 'Main Reception Desk',
    description: 'Nero marble and brushed brass front desk open 24 hours',
    src: receptionDeskImg,
    alt: 'Luxury hotel marble reception desk with warm limestone wall backdrop',
  },
  {
    id: 'gal-reception-foyer',
    category: 'Reception',
    title: 'Arrival Foyer & Concierge Lounge',
    description: 'Sunlit travertine arrival hall and private guest check-in salon',
    src: receptionFoyerImg,
    alt: 'Sunlit travertine arrival foyer and guest concierge lounge',
  },
  {
    id: 'gal-reception-lobby',
    category: 'Reception',
    title: 'Grand Reflecting Lobby',
    description: 'Double-height evening lounge beside the illuminated reflecting pool',
    src: heroLobbyImage,
    alt: 'Grand hotel lobby lounge at dusk overlooking reflecting pool',
  },
  {
    id: 'gal-restaurant-dining',
    category: 'Restaurant',
    title: 'Main Dining Salon',
    description: 'Candlelit linen tables and glass-enclosed wine cellar showcase',
    src: restaurantDiningImg,
    alt: 'Five-star hotel restaurant dining salon at twilight',
  },
  {
    id: 'gal-restaurant-bar',
    category: 'Restaurant',
    title: 'Onyx Champagne & Cocktail Lounge',
    description: 'Evening aperitifs and curated spirits in a warm velvet salon',
    src: restaurantBarImg,
    alt: 'Illuminated onyx cocktail bar and velvet lounge seating',
  },
  {
    id: 'gal-facility-spa',
    category: 'Facilities',
    title: 'Indoor Thermal Pool & Spa',
    description: 'Heated limestone colonnade pool and serene relaxation loungers',
    src: facilitySpaImg,
    alt: 'Indoor heated hotel thermal pool with limestone arches',
  },
  {
    id: 'gal-facility-entrance',
    category: 'Facilities',
    title: 'Porte-Cochère & Valet Courtyard',
    description: 'Private arrival driveway with evening lantern illumination',
    src: facilityEntranceImg,
    alt: 'Luxury hotel porte-cochere arrival courtyard and valet driveway at dusk',
  },
  {
    id: 'gal-facility-terrace',
    category: 'Facilities',
    title: 'Rooftop Evening Terrace',
    description: 'Open-air twilight seating overlooking the city skyline',
    src: premTerrace,
    alt: 'Private rooftop terrace with daybed and bronze lanterns at twilight',
  },
];
