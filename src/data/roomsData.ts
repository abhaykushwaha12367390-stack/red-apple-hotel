import stdInterior from '@/src/assets/images/WhatsApp_image38.jpg.jpeg';
import stdBed from '@/src/assets/images/WhatsApp_image37.jpg.jpeg';
import stdBathroom from '@/src/assets/images/WhatsApp_image36.jpg.jpeg';
import stdWindow from '@/src/assets/images/WhatsApp_image39.jpg.jpeg';

import dlxInterior from '@/src/assets/images/WhatsApp_image12.jpg.jpeg';
import dlxBathroom from '@/src/assets/images/fam_room_interior_1794603130520.jpg.jpeg';
import dlxBalcony from '@/src/assets/images/dlx_room_bathroom_1794603126630.jpg-1.jpeg';

import sdlxInterior from '@/src/assets/images/WhatsApp_image33.jpg.jpeg';
import sdlxBed from '@/src/assets/images/WhatsApp_image32.jpg.jpeg';
import sdlxBathroom from '@/src/assets/images/WhatsApp_image31.jpg.jpeg';
import sdlxLounge from '@/src/assets/images/WhatsApp_image34.jpg.jpeg';

import execInterior from '@/src/assets/images/WhatsApp_image15.jpg.jpeg';
import execBed from '@/src/assets/images/WhatsApp_image14.jpg.jpeg';
import execWorkspace from '@/src/assets/images/WhatsApp_image16.jpg.jpeg';
import execBathroom from '@/src/assets/images/WhatsApp_image13.jpg.jpeg';

import famInterior from '@/src/assets/images/WhatsApp_image19.jpg.jpeg';
import famBeds from '@/src/assets/images/WhatsApp_image18.jpg.jpeg';
import famLounge from '@/src/assets/images/WhatsApp_image20.jpg.jpeg';
import famBathroom from '@/src/assets/images/fam_room_bathroom_1794603131630.jpg';

import premLiving from '@/src/assets/images/WhatsApp_image29.jpg.jpeg';
import premBedroom from '@/src/assets/images/WhatsApp_image28.jpg.jpeg';
import premBath from '@/src/assets/images/WhatsApp_image27.jpg.jpeg';
import premTerrace from '@/src/assets/images/WhatsApp_image30.jpg.jpeg';

export interface RoomPhoto {
  src: string;
  alt: string;
  caption: string;
}

export interface RoomCategory {
  id: string;
  name: string;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  pricePerNight: number;
  currencySymbol: string;
  roomSize: string;
  bedType: string;
  maxGuests: string;
  bathroomInfo: string;
  acAvailability: string;
  smartTv: string;
  wifi: string;
  roomService: string;
  cardFacilities: string[];
  otherFacilities: string[];
  amenities: string[];
  photos: RoomPhoto[];
}

/**
 * Editable Room Catalog
 * Update room names, nightly rates, dimensions, amenities, or image paths below.
 */
export const ROOMS_DATA: RoomCategory[] = [
  {
    id: 'standard-room',
    name: 'Standard Room',
    categoryLabel: 'Courtyard Wing',
    shortDescription:
      'Refined quiet comfort featuring warm walnut joinery, a serene window alcove, and bespoke limestone bath.',
    fullDescription:
      'Thoughtfully proportioned for solo travelers and couples, the Standard Room balances warm alabaster finishes with handcrafted walnut furniture. Tall courtyard windows draw soft natural light across a dedicated reading nook and an inviting queen-size bed dressed in crisp Egyptian cotton.',
    pricePerNight: 999,
    currencySymbol: '₹',
    roomSize: '30 m² / 323 sq ft',
    bedType: '1 Queen Bed',
    maxGuests: '2 Adults',
    bathroomInfo: 'Honed limestone vanity with frameless walk-in rain shower',
    acAvailability: 'Individual climate-controlled air conditioning & heating',
    smartTv: '50-inch 4K Smart TV with wireless casting',
    wifi: 'Complimentary high-speed fiber Wi-Fi',
    roomService: '24-hour in-room dining & evening turndown service',
    cardFacilities: ['30 m²', 'Queen Bed', 'Max 2 Guests', 'Free Wi-Fi'],
    otherFacilities: [
      'Blackout linen drapery',
      'In-room laptop safe',
      'Soundproofed windows',
      'Writing desk & brass lamp',
    ],
    amenities: [
      'Egyptian cotton linens',
      'Artisanal espresso machine',
      'Organic bath botanicals',
      'Plush bathrobes & slippers',
      'Curated minibar',
      'Daily housekeeping',
    ],
    photos: [
      {
        src: stdInterior,
        alt: 'Standard Room full interior with walnut desk and sunlit window',
        caption: 'Room Interior & Writing Desk',
      },
      {
        src: stdBed,
        alt: 'Standard Room queen-size bed with champagne accent pillows',
        caption: 'Queen-Size Bed & Cotton Linens',
      },
      {
        src: stdBathroom,
        alt: 'Standard Room honed limestone bathroom with rain shower',
        caption: 'Limestone Walk-In Rain Shower',
      },
      {
        src: stdWindow,
        alt: 'Standard Room window seating alcove overlooking courtyard greenery',
        caption: 'Courtyard Window Alcove',
      },
    ],
  },
  {
    id: 'deluxe-room',
    name: 'Deluxe Room',
    categoryLabel: 'Garden & Skyline',
    shortDescription:
      'Elevated oak-paneled retreat with a plush king bed, private sunset balcony, and dark marble bath.',
    fullDescription:
      'Set on upper floors for tranquil garden and city views, the Deluxe Room welcomes guests with warm oak wall paneling, a sculpted leather armchair, and sliding glass doors opening onto a furnished private balcony.',
    pricePerNight: 999,
    currencySymbol: '₹',
    roomSize: '42 m² / 452 sq ft',
    bedType: '1 King Bed',
    maxGuests: '2 Adults · 1 Child',
    bathroomInfo: 'Dark veined marble double vanity & glass rainfall enclosure',
    acAvailability: 'Dual-zone silent climate control',
    smartTv: '55-inch 4K OLED Smart TV & soundbar',
    wifi: 'Complimentary high-speed fiber Wi-Fi',
    roomService: '24-hour in-room dining & laundry press service',
    cardFacilities: ['42 m²', 'King Bed', 'Private Balcony', 'Smart TV'],
    otherFacilities: [
      'Furnished private sunset balcony',
      'Caramel leather reading lounge',
      'USB-C & international bedside outlets',
      'Electronic privacy controls',
    ],
    amenities: [
      'Cashmere bed throw',
      'Nespresso & loose-leaf tea bar',
      'Heated bathroom mirror',
      'Signature bathrobes',
      'Evening turndown chocolate',
      'Complimentary pressed garment (2 items)',
    ],
    photos: [
      {
        src: dlxInterior,
        alt: 'Deluxe Room oak-paneled interior with leather armchair and smart TV',
        caption: 'Oak-Paneled Living Space',
      },
      {
        src: dlxBathroom,
        alt: 'Deluxe Room dark veined marble bathroom with recessed cove lighting',
        caption: 'Veined Marble Vanity & Shower',
      },
      {
        src: dlxBalcony,
        alt: 'Deluxe Room private balcony terrace overlooking gardens at sunset',
        caption: 'Private Sunset Balcony',
      },
    ],
  },
  {
    id: 'super-deluxe-room',
    name: 'Super Deluxe Room',
    categoryLabel: 'Corner Panorama',
    shortDescription:
      'Expansive corner sanctuary offering floor-to-ceiling twilight vistas, curved lounge, and spa soaking tub.',
    fullDescription:
      'Positioned along our signature glass corners, the Super Deluxe Room pairs an elevated timber sleeping platform with an intimate bouclé seating salon and a spa-inspired bathroom anchored by a deep sculpted soaking tub.',
    pricePerNight: 999,
    currencySymbol: '₹',
    roomSize: '56 m² / 603 sq ft',
    bedType: '1 Grand King Bed',
    maxGuests: '3 Adults',
    bathroomInfo: 'Sculpted stone soaking tub, double vessel sinks & rain shower',
    acAvailability: 'Smart thermostat with automated air purification',
    smartTv: '65-inch 4K Smart TV with streaming suite',
    wifi: 'Dedicated high-bandwidth Wi-Fi 6 network',
    roomService: '24-hour butler pantry & private dining service',
    cardFacilities: ['56 m²', 'Grand King', 'Soaking Tub', 'Corner View'],
    otherFacilities: [
      'Floor-to-ceiling corner glazing',
      'Curved bouclé lounge sofa',
      'Illuminated walnut bar cabinet',
      'Motorized sheer & blackout shades',
    ],
    amenities: [
      'Deep soaking bath salts',
      'Silk pillow menu',
      'Private cocktail glassware',
      'Wireless bedside charging',
      'Priority spa reservations',
      'Welcome seasonal fruit & sparkling water',
    ],
    photos: [
      {
        src: sdlxInterior,
        alt: 'Super Deluxe Room corner suite interior with panoramic city view',
        caption: 'Corner Panoramic Living Area',
      },
      {
        src: sdlxBed,
        alt: 'Super Deluxe Room grand king bed beneath cove-lit ceiling',
        caption: 'Platform King Bed Sanctuary',
      },
      {
        src: sdlxBathroom,
        alt: 'Super Deluxe Room spa bathroom with deep sculpted soaking tub',
        caption: 'Sculpted Soaking Tub & Dual Sinks',
      },
      {
        src: sdlxLounge,
        alt: 'Super Deluxe Room curved ivory sofa beside illuminated minibar',
        caption: 'Evening Skyline Lounge & Bar',
      },
    ],
  },
  {
    id: 'executive-room',
    name: 'Executive Room',
    categoryLabel: 'Business & Club Floor',
    shortDescription:
      'Tailored dark-walnut residence with dedicated skyline workspace, espresso bar, and steam shower.',
    fullDescription:
      'Designed for extended stays and executive travel, the Executive Room features smoked-oak architectural millwork, a separate skyline work desk with ergonomic leather seating, and direct privileges to the private Executive Club Lounge.',
    pricePerNight: 999,
    currencySymbol: '₹',
    roomSize: '62 m² / 667 sq ft',
    bedType: '1 Executive King Bed',
    maxGuests: '2 Adults · 1 Child',
    bathroomInfo: 'Statuario marble bathroom with glass steam shower & deep tub',
    acAvailability: 'Whisper-quiet zone climate & humidity control',
    smartTv: '65-inch 4K Smart TV with HDMI & AirPlay conference link',
    wifi: 'Enterprise-grade private VLAN Wi-Fi & wired Ethernet',
    roomService: '24-hour express executive dining & valet pressing',
    cardFacilities: ['62 m²', 'Executive Desk', 'Steam Shower', 'Club Access'],
    otherFacilities: [
      'Dedicated smoked-oak office desk',
      'Acoustic privacy walls',
      'Private boardroom access (2 hrs/stay)',
      'Ambient linear fireplace feature',
    ],
    amenities: [
      'Nespresso Vertuo & milk frother',
      'Charcoal waffle spa robes',
      'Heated marble towel rail',
      'Daily international press (digital)',
      'Complimentary shoe shine',
      'Evening Executive Club canapés',
    ],
    photos: [
      {
        src: execInterior,
        alt: 'Executive Room evening interior with velvet sofa and walnut media wall',
        caption: 'Executive Salon & Fireplace Wall',
      },
      {
        src: execBed,
        alt: 'Executive Room king bed with dark saddle-leather headboard',
        caption: 'Leather-Paneled King Bedroom',
      },
      {
        src: execWorkspace,
        alt: 'Executive Room smoked oak desk overlooking illuminated city skyline',
        caption: 'Skyline Private Workspace',
      },
      {
        src: execBathroom,
        alt: 'Executive Room Statuario marble bathroom with steam shower',
        caption: 'Statuario Marble Steam Bath',
      },
    ],
  },
  {
    id: 'family-room',
    name: 'Family Room',
    categoryLabel: 'Two-Zone Residence',
    shortDescription:
      'Sunlit two-zone family suite uniting a master king bedroom, twin alcove, and dining balcony.',
    fullDescription:
      'Crafted so families never compromise on tranquility or space, the Family Room pairs a primary king bedroom and private twin sleeping alcove with a generous living and dining salon opening onto a sunlit balcony.',
    pricePerNight: 999,
    currencySymbol: '₹',
    roomSize: '84 m² / 904 sq ft',
    bedType: '1 King Bed + Twin Alcove',
    maxGuests: '2 Adults · 2 Children',
    bathroomInfo: 'Spacious double-vanity travertine bath with tub & glass shower',
    acAvailability: 'Multi-zone independent bedroom & lounge AC',
    smartTv: '65-inch Smart TV + secondary alcove screen',
    wifi: 'High-speed multi-device family Wi-Fi',
    roomService: '24-hour family dining & children’s menu available',
    cardFacilities: ['84 m²', 'King + Twin', 'Max 4 Guests', 'Dining Nook'],
    otherFacilities: [
      'Four-seat oak dining table',
      'Modular family sectional sofa',
      'Sunlit furnished terrace',
      'Child-safe balcony lock system',
    ],
    amenities: [
      'Complimentary children’s welcome kit',
      'Hypoallergenic bedding available',
      'Full-size bathtub & step stool',
      'Board games upon request',
      'Mini refrigerator & bottle warmer',
      'Connecting room option',
    ],
    photos: [
      {
        src: famInterior,
        alt: 'Family Room bright limestone open-plan suite with smart TV wall',
        caption: 'Sunlit Open-Plan Family Suite',
      },
      {
        src: famBeds,
        alt: 'Family Room master king bed with adjoining twin sleeping alcove',
        caption: 'Master King & Twin Alcove',
      },
      {
        src: famLounge,
        alt: 'Family Room sectional sofa, oak dining table, and sunlit balcony',
        caption: 'Living Salon & Dining Terrace',
      },
      {
        src: famBathroom,
        alt: 'Family Room double-vanity travertine bathroom with tub and shower',
        caption: 'Double-Vanity Family Bath',
      },
    ],
  },
  {
    id: 'premium-suite',
    name: 'Premium Suite',
    categoryLabel: 'Signature Penthouse',
    shortDescription:
      'Our flagship skyline residence featuring a marble fireplace salon, spa bath, and private rooftop terrace.',
    fullDescription:
      'Crowning the top floor of RED APPLE HOTEL, the Premium Suite delivers residential grandeur at its finest: a chandelier-lit living salon with black marble fireplace, a silk-draped master bedroom, a skyline soaking bath, and an exclusive rooftop terrace.',
    pricePerNight: 999,
    currencySymbol: '₹',
    roomSize: '135 m² / 1,453 sq ft',
    bedType: '1 Bespoke Emperor King Bed',
    maxGuests: '4 Guests',
    bathroomInfo: 'Panoramic marble spa bath with oval soaking tub & twin bronze vanities',
    acAvailability: 'Whisper-quiet architectural climate & air filtration',
    smartTv: '75-inch 4K Art-Frame Smart TV + bedroom display',
    wifi: 'Dedicated private gigabit fiber Wi-Fi',
    roomService: '24-hour dedicated private butler & chef dining',
    cardFacilities: ['135 m²', 'Emperor King', 'Rooftop Terrace', 'Butler Service'],
    otherFacilities: [
      'Private landscaped rooftop terrace',
      'Nero Marquina marble fireplace',
      'Separate guest powder room',
      'Private VIP elevator access',
    ],
    amenities: [
      'Complimentary round-trip chauffeur transfer',
      'Sommelier-curated bar selection',
      'Bespoke pillow & fragrance menu',
      'Daily pressed garments (unlimited)',
      'Private rooftop lantern dining setup',
      'Late check-out priority until 4:00 PM',
    ],
    photos: [
      {
        src: premLiving,
        alt: 'Premium Suite presidential living salon with marble fireplace and skyline view',
        caption: 'Fireplace Salon & Skyline View',
      },
      {
        src: premBedroom,
        alt: 'Premium Suite master bedroom with bespoke velvet king bed and silk curtains',
        caption: 'Master Penthouse Bedroom',
      },
      {
        src: premBath,
        alt: 'Premium Suite marble spa bathroom with oval soaking tub beside skyline windows',
        caption: 'Panoramic Marble Spa Bath',
      },
      {
        src: premTerrace,
        alt: 'Premium Suite private rooftop terrace with daybed and bronze lanterns at dusk',
        caption: 'Private Rooftop Twilight Terrace',
      },
    ],
  },
];
