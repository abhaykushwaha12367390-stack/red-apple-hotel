import type {
  AdminGalleryPhoto,
  AdminRoomCategory,
  AdminServiceItem,
  AdminSession,
  BookingRecord,
  EnquiryRecord,
  HotelSettingsInfo,
} from '@/src/types/hotel';

const STORAGE_KEYS = {
  session: 'hotel_admin_session_v1',
  rooms: 'hotel_demo_rooms_v1',
  bookings: 'hotel_demo_bookings_v1',
  gallery: 'hotel_demo_gallery_v1',
  services: 'hotel_demo_services_v1',
  settings: 'hotel_demo_settings_v1',
  enquiries: 'hotel_demo_enquiries_v1',
} as const;

export interface AuthResult {
  success: boolean;
  session?: AdminSession;
  error?: string;
}

/**
 * Backend Integration Service Layer (Prepared for Part 6)
 * Currently operates in transparent Frontend Demonstration Mode using browser storage.
 * Replace each method with authenticated fetch() calls to your backend API in Part 6.
 */
export const hotelApiService = {
  isBackendConnected: false,

  async loginAdmin(
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid admin email address.' };
    }
    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters.',
      };
    }

    // TODO(Part 6): POST /api/admin/login and receive HttpOnly session cookie / JWT.
    const session: AdminSession = {
      email: cleanEmail,
      role: 'Hotel Owner',
      loggedInAt: new Date().toISOString(),
      rememberMe,
      authMode: 'local-demo',
    };

    try {
      const serialized = JSON.stringify(session);
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.session, serialized);
        sessionStorage.removeItem(STORAGE_KEYS.session);
      } else {
        sessionStorage.setItem(STORAGE_KEYS.session, serialized);
        localStorage.removeItem(STORAGE_KEYS.session);
      }
    } catch {
      // Fallback safely if storage is restricted
    }

    return { success: true, session };
  },

  getStoredSession(): AdminSession | null {
    try {
      const raw =
        sessionStorage.getItem(STORAGE_KEYS.session) ||
        localStorage.getItem(STORAGE_KEYS.session);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AdminSession;
      if (parsed && typeof parsed.email === 'string') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  logoutAdmin(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.session);
      localStorage.removeItem(STORAGE_KEYS.session);
    } catch {
      // Ignore storage errors
    }
  },

  loadState<T>(key: keyof typeof STORAGE_KEYS, fallback: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS[key]);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  saveState<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch {
      // Ignore quota exceeded errors for large uploaded images
    }
  },

  clearDemoData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.rooms);
      localStorage.removeItem(STORAGE_KEYS.bookings);
      localStorage.removeItem(STORAGE_KEYS.gallery);
      localStorage.removeItem(STORAGE_KEYS.services);
      localStorage.removeItem(STORAGE_KEYS.settings);
      localStorage.removeItem(STORAGE_KEYS.enquiries);
    } catch {
      // Ignore storage errors
    }
  },

  // Backend Booking Notification Endpoints (WhatsApp Cloud API + Formspree)
  async fetchNotificationConfigStatus(): Promise<
    import('@/src/types/hotel').NotificationConfigStatus | null
  > {
    try {
      const res = await fetch('/api/notifications/config-status');
      if (!res.ok) return null;
      return (await res.json()) as import('@/src/types/hotel').NotificationConfigStatus;
    } catch {
      return null;
    }
  },

  async fetchNotificationLogs(): Promise<
    import('@/src/types/hotel').BookingNotificationSummary[]
  > {
    try {
      const res = await fetch('/api/notifications/logs');
      if (!res.ok) return [];
      const data = (await res.json()) as {
        logs?: import('@/src/types/hotel').BookingNotificationSummary[];
      };
      return Array.isArray(data.logs) ? data.logs : [];
    } catch {
      return [];
    }
  },

  async sendBookingNotifications(
    booking: BookingRecord,
    idempotencyKey: string
  ): Promise<{
    log?: import('@/src/types/hotel').BookingNotificationSummary;
    deduplicated?: boolean;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/notifications/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          idempotencyKey,
          customerName: booking.guestName,
          customerPhone: booking.mobileNumber,
          customerEmail: booking.emailAddress || '',
          roomName: booking.roomName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights,
          adults: booking.adults,
          children: booking.children,
          estimatedAmount: booking.estimatedAmount,
          currencySymbol: booking.currencySymbol,
          bookingStatus: booking.status.toUpperCase(),
        }),
      });
      if (!res.ok) {
        return { error: `Notification endpoint returned HTTP ${res.status}` };
      }
      return (await res.json()) as {
        log?: import('@/src/types/hotel').BookingNotificationSummary;
        deduplicated?: boolean;
      };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Unable to reach notification server',
      };
    }
  },

  async retryBookingNotifications(booking: BookingRecord): Promise<{
    log?: import('@/src/types/hotel').BookingNotificationSummary;
    error?: string;
  }> {
    try {
      const res = await fetch(
        `/api/notifications/booking/${encodeURIComponent(booking.id)}/retry`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            idempotencyKey: booking.id,
            customerName: booking.guestName,
            customerPhone: booking.mobileNumber,
            customerEmail: booking.emailAddress || '',
            roomName: booking.roomName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights,
            adults: booking.adults,
            children: booking.children,
            estimatedAmount: booking.estimatedAmount,
            currencySymbol: booking.currencySymbol,
            bookingStatus: booking.status.toUpperCase(),
          }),
        }
      );
      if (!res.ok) {
        return { error: `Retry endpoint returned HTTP ${res.status}` };
      }
      return (await res.json()) as {
        log?: import('@/src/types/hotel').BookingNotificationSummary;
      };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Unable to reach notification server for retry',
      };
    }
  },
};

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
