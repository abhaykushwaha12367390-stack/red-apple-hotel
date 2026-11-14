import type { RoomCategory, RoomPhoto } from '@/src/data/roomsData';
import type {
  GalleryCategory,
  ServiceIconKey,
} from '@/src/data/hotelSectionsData';

export type RoomAvailabilityStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface AdminRoomCategory extends RoomCategory {
  isActive: boolean;
  availabilityStatus: RoomAvailabilityStatus;
  totalUnits: number;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed';

export type NotificationChannelStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'not_configured';

export interface NotificationChannelLog {
  status: NotificationChannelStatus;
  attempts: number;
  lastAttemptAt: string | null;
  deliveredAt: string | null;
  recipient: string;
  providerMessageId?: string;
  errorMessage?: string;
  missingConfigKeys?: string[];
}

export interface BookingNotificationSummary {
  bookingId: string;
  idempotencyKey: string;
  roomName: string;
  guestName: string;
  estimatedAmountFormatted: string;
  createdAt: string;
  updatedAt: string;
  whatsapp: NotificationChannelLog;
  email: NotificationChannelLog;
}

export interface NotificationConfigStatus {
  ownerWhatsapp: string;
  ownerEmail: string;
  whatsapp: {
    configured: boolean;
    missingEnvVars: string[];
    templateMode: string;
  };
  email: {
    configured: boolean;
    missingEnvVars: string[];
    provider: string;
  };
}

export interface BookingRecord {
  id: string;
  guestName: string;
  mobileNumber: string;
  emailAddress?: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  estimatedAmount: number;
  currencySymbol: string;
  adults: number;
  children: number;
  guestsCount: number;
  bookingDate: string;
  status: BookingStatus;
  specialRequests?: string;
  arrivalWindow?: string;
  idDocumentType?: string;
  idDocumentMasked?: string;
  hasPrivateIdAttachment?: boolean;
  whatsappNotificationStatus?: NotificationChannelStatus;
  emailNotificationStatus?: NotificationChannelStatus;
  isDemoData?: boolean;
}

export type AdminGalleryCategory =
  | Exclude<GalleryCategory, 'All Photos'>
  | 'Exterior';

export interface AdminGalleryPhoto {
  id: string;
  category: AdminGalleryCategory;
  title: string;
  description: string;
  src: string;
  alt: string;
}

export interface AdminServiceItem {
  id: string;
  title: string;
  description: string;
  iconKey: ServiceIconKey;
  available: boolean;
  availabilityNote?: string;
  customImageSrc?: string;
}

export interface SocialMediaLinks {
  instagram: string;
  facebook: string;
  twitter: string;
}

export interface HotelSettingsInfo {
  hotelName: string;
  hotelLogoUrl: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  googleMapsUrl: string;
  checkInTime: string;
  checkOutTime: string;
  socialLinks: SocialMediaLinks;
}

export type EnquiryStatus = 'Unread' | 'Read' | 'Resolved';

export interface EnquiryRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  subject: string;
  message: string;
  enquiryDate: string;
  status: EnquiryStatus;
  roomContext?: string;
  isDemoData?: boolean;
}

export interface AdminSession {
  email: string;
  role: 'Hotel Owner';
  loggedInAt: string;
  rememberMe: boolean;
  authMode: 'local-demo';
}

export type AdminPhotoUpload = RoomPhoto;
