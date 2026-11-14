import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ROOMS_DATA } from '@/src/data/roomsData';
import {
  GALLERY_PHOTOS,
  HOTEL_SERVICES_DATA,
} from '@/src/data/hotelSectionsData';
import {
  HOTEL_ADDRESS,
  HOTEL_DESCRIPTION,
  HOTEL_EMAIL,
  HOTEL_MAPS_EMBED_URL,
  HOTEL_NAME,
  HOTEL_PHONE,
  HOTEL_WHATSAPP,
} from '@/src/config/hotelConfig';
import { hotelApiService } from '@/src/services/hotelApiService';
import {
  auth,
  googleAuthProvider,
  saveBookingToFirestore,
  saveEnquiryToFirestore,
  subscribeToBookingsAsAdmin,
  updateBookingStatusInFirestore,
  updateEnquiryStatusInFirestore,
} from '@/src/lib/firebase';
import type {
  AdminGalleryPhoto,
  AdminRoomCategory,
  AdminServiceItem,
  AdminSession,
  BookingNotificationSummary,
  BookingRecord,
  BookingStatus,
  EnquiryRecord,
  EnquiryStatus,
  HotelSettingsInfo,
  NotificationConfigStatus,
  RoomAvailabilityStatus,
} from '@/src/types/hotel';

function buildInitialRooms(): AdminRoomCategory[] {
  return ROOMS_DATA.map((room, index) => ({
    ...room,
    isActive: true,
    availabilityStatus: index === 3 ? 'Occupied' : 'Available',
    totalUnits: index === 5 ? 1 : 4,
  }));
}

function buildInitialSettings(): HotelSettingsInfo {
  return {
    hotelName: HOTEL_NAME,
    hotelLogoUrl: '',
    description: HOTEL_DESCRIPTION,
    address: HOTEL_ADDRESS,
    phone: HOTEL_PHONE,
    whatsapp: HOTEL_WHATSAPP,
    email: HOTEL_EMAIL,
    googleMapsUrl: HOTEL_MAPS_EMBED_URL,
    checkInTime: '3:00 PM',
    checkOutTime: '12:00 PM',
    socialLinks: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://x.com',
    },
  };
}

function buildInitialDemoBookings(): BookingRecord[] {
  const offsetDay = (days: number) =>
    new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'DEMO-BK-1001',
      guestName: 'Sample Guest A',
      mobileNumber: '+00 000 000 0101',
      emailAddress: 'sample.guest.a@example.com',
      roomId: 'deluxe-room',
      roomName: 'Deluxe Room',
      checkIn: offsetDay(2),
      checkOut: offsetDay(5),
      nights: 3,
      estimatedAmount: 660,
      currencySymbol: '$',
      adults: 2,
      children: 0,
      guestsCount: 2,
      bookingDate: offsetDay(-1),
      status: 'Pending',
      specialRequests: 'High floor courtyard view requested (Demo entry)',
      arrivalWindow: 'Standard (3:00 PM – 6:00 PM)',
      idDocumentType: 'Passport',
      idDocumentMasked: '••••4821',
      hasPrivateIdAttachment: false,
      isDemoData: true,
    },
    {
      id: 'DEMO-BK-1002',
      guestName: 'Sample Guest B',
      mobileNumber: '+00 000 000 0102',
      emailAddress: 'sample.guest.b@example.com',
      roomId: 'executive-room',
      roomName: 'Executive Room',
      checkIn: offsetDay(0),
      checkOut: offsetDay(3),
      nights: 3,
      estimatedAmount: 960,
      currencySymbol: '$',
      adults: 1,
      children: 0,
      guestsCount: 1,
      bookingDate: offsetDay(-3),
      status: 'Confirmed',
      specialRequests: 'Early workspace access (Demo entry)',
      arrivalWindow: 'Early (12:00 PM – 3:00 PM)',
      idDocumentType: 'National ID Card',
      idDocumentMasked: '••••9034',
      hasPrivateIdAttachment: true,
      isDemoData: true,
    },
    {
      id: 'DEMO-BK-1003',
      guestName: 'Sample Guest C',
      mobileNumber: '+00 000 000 0103',
      emailAddress: 'sample.guest.c@example.com',
      roomId: 'family-room',
      roomName: 'Family Room',
      checkIn: offsetDay(7),
      checkOut: offsetDay(10),
      nights: 3,
      estimatedAmount: 1050,
      currencySymbol: '$',
      adults: 2,
      children: 2,
      guestsCount: 4,
      bookingDate: offsetDay(-2),
      status: 'Pending',
      specialRequests: 'Extra child pillow set (Demo entry)',
      arrivalWindow: 'Evening (6:00 PM – 10:00 PM)',
      idDocumentType: 'Provide at Hotel Check-In',
      idDocumentMasked: 'Will be verified at check-in',
      hasPrivateIdAttachment: false,
      isDemoData: true,
    },
    {
      id: 'DEMO-BK-1004',
      guestName: 'Sample Guest D',
      mobileNumber: '+00 000 000 0104',
      roomId: 'standard-room',
      roomName: 'Standard Room',
      checkIn: offsetDay(-5),
      checkOut: offsetDay(-2),
      nights: 3,
      estimatedAmount: 480,
      currencySymbol: '$',
      adults: 2,
      children: 0,
      guestsCount: 2,
      bookingDate: offsetDay(-8),
      status: 'Completed',
      arrivalWindow: 'Standard (3:00 PM – 6:00 PM)',
      idDocumentType: 'Passport',
      idDocumentMasked: '••••1190',
      isDemoData: true,
    },
  ];
}

function buildInitialDemoEnquiries(): EnquiryRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'DEMO-ENQ-201',
      customerName: 'Sample Visitor 1',
      phoneNumber: '+00 000 000 0201',
      email: 'visitor1@example.com',
      subject: 'Group stay availability (Demo)',
      message:
        'Enquiring about three adjoining Deluxe Rooms for an upcoming weekend stay.',
      enquiryDate: today,
      status: 'Unread',
      isDemoData: true,
    },
    {
      id: 'DEMO-ENQ-202',
      customerName: 'Sample Visitor 2',
      phoneNumber: '+00 000 000 0202',
      email: 'visitor2@example.com',
      subject: 'Airport transfer & late check-in (Demo)',
      message:
        'Could you confirm airport pickup options for a 10:30 PM arrival?',
      enquiryDate: today,
      status: 'Read',
      isDemoData: true,
    },
  ];
}

function calculateStayNights(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 1;
  }
  return Math.max(1, Math.round((end - start) / 86400000));
}

export interface AddBookingInput {
  guestName: string;
  mobileNumber: string;
  emailAddress?: string;
  roomId: string;
  roomName: string;
  pricePerNight: number;
  currencySymbol: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests?: string;
  arrivalWindow?: string;
  idDocumentType?: string;
  idDocumentMasked?: string;
  hasPrivateIdAttachment?: boolean;
}

export interface AddEnquiryInput {
  customerName: string;
  phoneNumber: string;
  email: string;
  subject: string;
  message: string;
  roomContext?: string;
}

export interface ConfirmBookingResult {
  ok: boolean;
  reason?: string;
}

interface HotelStoreContextValue {
  // Auth
  adminSession: AdminSession | null;
  firebaseAdminEmail: string | null;
  loginAdmin: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  signInAdminWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;

  // Synchronized Data
  rooms: AdminRoomCategory[];
  activePublicRooms: AdminRoomCategory[];
  bookings: BookingRecord[];
  galleryPhotos: AdminGalleryPhoto[];
  services: AdminServiceItem[];
  activePublicServices: AdminServiceItem[];
  hotelInfo: HotelSettingsInfo;
  enquiries: EnquiryRecord[];

  // Notifications
  notificationConfig: NotificationConfigStatus | null;
  notificationLogs: BookingNotificationSummary[];
  refreshNotifications: () => Promise<void>;
  retryBookingNotifications: (
    bookingId: string
  ) => Promise<BookingNotificationSummary | null>;

  // Room CRUD
  saveRoom: (
    room: AdminRoomCategory,
    isNew: boolean
  ) => { ok: boolean; error?: string };
  deleteRoom: (roomId: string) => void;
  toggleRoomActive: (roomId: string) => void;
  setRoomAvailability: (
    roomId: string,
    status: RoomAvailabilityStatus
  ) => void;

  // Booking Actions
  addBooking: (input: AddBookingInput) => Promise<BookingRecord>;
  updateBookingStatus: (
    bookingId: string,
    nextStatus: BookingStatus
  ) => ConfirmBookingResult;

  // Gallery Actions
  addGalleryPhoto: (photo: Omit<AdminGalleryPhoto, 'id'>) => void;
  updateGalleryPhoto: (photo: AdminGalleryPhoto) => void;
  deleteGalleryPhoto: (photoId: string) => void;

  // Services Actions
  saveService: (service: AdminServiceItem, isNew: boolean) => void;
  deleteService: (serviceId: string) => void;
  toggleServiceEnabled: (serviceId: string) => void;

  // Hotel Information Settings
  updateHotelInfo: (nextInfo: HotelSettingsInfo) => void;

  // Enquiries Actions
  addEnquiry: (input: AddEnquiryInput) => EnquiryRecord;
  updateEnquiryStatus: (enquiryId: string, status: EnquiryStatus) => void;
  deleteEnquiry: (enquiryId: string) => void;

  // Reset Demo Store
  resetDemoStore: () => void;
}

const HotelStoreContext = createContext<HotelStoreContextValue | null>(null);

export function HotelStoreProvider({ children }: { children: ReactNode }) {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() =>
    hotelApiService.getStoredSession()
  );
  const [firebaseAdminEmail, setFirebaseAdminEmail] = useState<string | null>(
    null
  );

  const [rooms, setRooms] = useState<AdminRoomCategory[]>(() =>
    hotelApiService.loadState('rooms', buildInitialRooms())
  );
  const [bookings, setBookings] = useState<BookingRecord[]>(() =>
    hotelApiService.loadState('bookings', buildInitialDemoBookings())
  );
  const [galleryPhotos, setGalleryPhotos] = useState<AdminGalleryPhoto[]>(() =>
    hotelApiService.loadState('gallery', GALLERY_PHOTOS)
  );
  const [services, setServices] = useState<AdminServiceItem[]>(() =>
    hotelApiService.loadState('services', HOTEL_SERVICES_DATA)
  );
  const [hotelInfo, setHotelInfo] = useState<HotelSettingsInfo>(() =>
    hotelApiService.loadState('settings', buildInitialSettings())
  );
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(() =>
    hotelApiService.loadState('enquiries', buildInitialDemoEnquiries())
  );

  const [notificationConfig, setNotificationConfig] =
    useState<NotificationConfigStatus | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<
    BookingNotificationSummary[]
  >([]);

  useEffect(() => {
    hotelApiService.saveState('rooms', rooms);
  }, [rooms]);
  useEffect(() => {
    hotelApiService.saveState('bookings', bookings);
  }, [bookings]);
  useEffect(() => {
    hotelApiService.saveState('gallery', galleryPhotos);
  }, [galleryPhotos]);
  useEffect(() => {
    hotelApiService.saveState('services', services);
  }, [services]);
  useEffect(() => {
    hotelApiService.saveState('settings', hotelInfo);
  }, [hotelInfo]);
  useEffect(() => {
    hotelApiService.saveState('enquiries', enquiries);
  }, [enquiries]);

  const refreshNotifications = useCallback(async () => {
    const [cfg, logs] = await Promise.all([
      hotelApiService.fetchNotificationConfigStatus(),
      hotelApiService.fetchNotificationLogs(),
    ]);
    if (cfg) setNotificationConfig(cfg);
    setNotificationLogs(logs);
  }, []);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  // Listen for Firebase Google Admin Auth & stream Firestore bookings when authenticated
  useEffect(() => {
    let unsubscribeBookings: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeBookings) {
        unsubscribeBookings();
        unsubscribeBookings = null;
      }

      if (user && user.email) {
        setFirebaseAdminEmail(user.email);
        unsubscribeBookings = subscribeToBookingsAsAdmin(
          (remoteBookings) => {
            setBookings((prev) => {
              const map = new Map<string, BookingRecord>();
              for (const item of remoteBookings) {
                map.set(item.id, item);
              }
              for (const local of prev) {
                if (!map.has(local.id)) {
                  map.set(local.id, local);
                }
              }
              return Array.from(map.values());
            });
          },
          () => {
            // Keep local bookings available if Firestore permissions are restricted for this Google account
          }
        );
      } else {
        setFirebaseAdminEmail(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, []);

  const loginAdmin = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const result = await hotelApiService.loginAdmin(
        email,
        password,
        rememberMe
      );
      if (result.success && result.session) {
        setAdminSession(result.session);
      }
      return { success: result.success, error: result.error };
    },
    []
  );

  const signInAdminWithGoogle = useCallback(async () => {
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const userEmail = cred.user.email || 'owner@hotel';
      const session: AdminSession = {
        email: userEmail,
        role: 'Hotel Owner',
        loggedInAt: new Date().toISOString(),
        rememberMe: true,
        authMode: 'local-demo',
      };
      setAdminSession(session);
      setFirebaseAdminEmail(userEmail);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Google Sign-In was cancelled or failed.',
      };
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    hotelApiService.logoutAdmin();
    void signOut(auth).catch(() => {});
    setAdminSession(null);
    setFirebaseAdminEmail(null);
  }, []);

  const saveRoom = useCallback(
    (room: AdminRoomCategory, isNew: boolean) => {
      const normalizedName = room.name.trim().toLowerCase();
      const duplicate = rooms.some(
        (existing) =>
          existing.id !== room.id &&
          existing.name.trim().toLowerCase() === normalizedName
      );

      if (duplicate) {
        return {
          ok: false,
          error: `A room named "${room.name.trim()}" already exists.`,
        };
      }

      setRooms((prev) =>
        isNew
          ? [room, ...prev]
          : prev.map((existing) => (existing.id === room.id ? room : existing))
      );
      return { ok: true };
    },
    [rooms]
  );

  const deleteRoom = useCallback((roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
  }, []);

  const toggleRoomActive = useCallback((roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, isActive: !room.isActive } : room
      )
    );
  }, []);

  const setRoomAvailability = useCallback(
    (roomId: string, status: RoomAvailabilityStatus) => {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId ? { ...room, availabilityStatus: status } : room
        )
      );
    },
    []
  );

  const addBooking = useCallback(
    async (input: AddBookingInput): Promise<BookingRecord> => {
      const nights = calculateStayNights(input.checkIn, input.checkOut);
      const estimatedAmount = Math.max(0, nights * input.pricePerNight);
      const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;

      const newRecord: BookingRecord = {
        id: bookingId,
        guestName: input.guestName,
        mobileNumber: input.mobileNumber,
        emailAddress: input.emailAddress,
        roomId: input.roomId,
        roomName: input.roomName,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        nights,
        estimatedAmount,
        currencySymbol: input.currencySymbol || '$',
        adults: input.adults,
        children: input.children,
        guestsCount: input.adults + input.children,
        bookingDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        specialRequests: input.specialRequests,
        arrivalWindow: input.arrivalWindow,
        idDocumentType: input.idDocumentType,
        idDocumentMasked: input.idDocumentMasked,
        hasPrivateIdAttachment: input.hasPrivateIdAttachment,
        whatsappNotificationStatus: 'pending',
        emailNotificationStatus: 'pending',
        isDemoData: false,
      };

      // Step 1: Save booking into Firestore database BEFORE triggering notifications.
      try {
        await saveBookingToFirestore(newRecord);
      } catch (err) {
        console.error('Firestore booking persistence failed:', err);
      }

      setBookings((prev) => [newRecord, ...prev]);

      // Step 2: Independently dispatch owner WhatsApp & Formspree email notifications.
      // Notification failure NEVER invalidates or deletes the saved booking.
      const idempotencyKey = `${bookingId}-initial`;
      const notifyRes = await hotelApiService.sendBookingNotifications(
        newRecord,
        idempotencyKey
      );

      if (notifyRes.log) {
        const waStatus = notifyRes.log.whatsapp.status;
        const emailStatus = notifyRes.log.email.status;
        setBookings((prev) =>
          prev.map((item) =>
            item.id === bookingId
              ? {
                  ...item,
                  whatsappNotificationStatus: waStatus,
                  emailNotificationStatus: emailStatus,
                }
              : item
          )
        );
        void refreshNotifications();
      } else {
        setBookings((prev) =>
          prev.map((item) =>
            item.id === bookingId
              ? {
                  ...item,
                  whatsappNotificationStatus: 'failed',
                  emailNotificationStatus: 'failed',
                }
              : item
          )
        );
      }

      return newRecord;
    },
    [refreshNotifications]
  );

  const retryBookingNotifications = useCallback(
    async (bookingId: string): Promise<BookingNotificationSummary | null> => {
      const target = bookings.find((b) => b.id === bookingId);
      if (!target) return null;

      const res = await hotelApiService.retryBookingNotifications(target);
      if (res.log) {
        const waStatus = res.log.whatsapp.status;
        const emailStatus = res.log.email.status;
        setBookings((prev) =>
          prev.map((item) =>
            item.id === bookingId
              ? {
                  ...item,
                  whatsappNotificationStatus: waStatus,
                  emailNotificationStatus: emailStatus,
                }
              : item
          )
        );
        if (auth.currentUser) {
          void updateBookingStatusInFirestore(bookingId, {
            whatsappNotificationStatus: waStatus,
            emailNotificationStatus: emailStatus,
          }).catch(() => {});
        }
        await refreshNotifications();
        return res.log;
      }
      return null;
    },
    [bookings, refreshNotifications]
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, nextStatus: BookingStatus): ConfirmBookingResult => {
      const target = bookings.find((b) => b.id === bookingId);
      if (!target) {
        return { ok: false, reason: 'Booking record not found.' };
      }

      if (nextStatus === 'Confirmed') {
        const room = rooms.find((r) => r.id === target.roomId);
        if (!room) {
          return {
            ok: false,
            reason: 'The requested room no longer exists in the catalog.',
          };
        }
        if (!room.isActive || room.availabilityStatus === 'Maintenance') {
          return {
            ok: false,
            reason: `${room.name} is currently inactive or under maintenance.`,
          };
        }

        const overlappingConfirmed = bookings.filter(
          (existing) =>
            existing.id !== target.id &&
            existing.roomId === target.roomId &&
            existing.status === 'Confirmed' &&
            existing.checkIn < target.checkOut &&
            existing.checkOut > target.checkIn
        );

        const availableCapacity = Math.max(1, room.totalUnits || 1);
        if (overlappingConfirmed.length >= availableCapacity) {
          return {
            ok: false,
            reason: `Availability conflict: ${room.name} already has ${overlappingConfirmed.length} confirmed booking(s) overlapping ${target.checkIn} to ${target.checkOut} (capacity: ${availableCapacity}).`,
          };
        }
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.id === bookingId ? { ...item, status: nextStatus } : item
        )
      );

      if (auth.currentUser && !target.isDemoData) {
        void updateBookingStatusInFirestore(bookingId, {
          status: nextStatus,
        }).catch(() => {});
      }

      return { ok: true };
    },
    [bookings, rooms]
  );

  const addGalleryPhoto = useCallback(
    (photo: Omit<AdminGalleryPhoto, 'id'>) => {
      const next: AdminGalleryPhoto = {
        ...photo,
        id: `gal-${Date.now().toString(36)}`,
      };
      setGalleryPhotos((prev) => [next, ...prev]);
    },
    []
  );

  const updateGalleryPhoto = useCallback((photo: AdminGalleryPhoto) => {
    setGalleryPhotos((prev) =>
      prev.map((item) => (item.id === photo.id ? photo : item))
    );
  }, []);

  const deleteGalleryPhoto = useCallback((photoId: string) => {
    setGalleryPhotos((prev) => prev.filter((item) => item.id !== photoId));
  }, []);

  const saveService = useCallback(
    (service: AdminServiceItem, isNew: boolean) => {
      setServices((prev) =>
        isNew
          ? [service, ...prev]
          : prev.map((item) => (item.id === service.id ? service : item))
      );
    },
    []
  );

  const deleteService = useCallback((serviceId: string) => {
    setServices((prev) => prev.filter((item) => item.id !== serviceId));
  }, []);

  const toggleServiceEnabled = useCallback((serviceId: string) => {
    setServices((prev) =>
      prev.map((item) =>
        item.id === serviceId ? { ...item, available: !item.available } : item
      )
    );
  }, []);

  const updateHotelInfo = useCallback((nextInfo: HotelSettingsInfo) => {
    setHotelInfo(nextInfo);
  }, []);

  const addEnquiry = useCallback((input: AddEnquiryInput): EnquiryRecord => {
    const record: EnquiryRecord = {
      id: `ENQ-${Date.now().toString(36).toUpperCase()}`,
      customerName: input.customerName,
      phoneNumber: input.phoneNumber,
      email: input.email,
      subject: input.subject,
      message: input.message,
      roomContext: input.roomContext,
      enquiryDate: new Date().toISOString().split('T')[0],
      status: 'Unread',
      isDemoData: false,
    };
    setEnquiries((prev) => [record, ...prev]);
    void saveEnquiryToFirestore(record).catch(() => {});
    return record;
  }, []);

  const updateEnquiryStatus = useCallback(
    (enquiryId: string, status: EnquiryStatus) => {
      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === enquiryId ? { ...item, status } : item
        )
      );
      if (auth.currentUser) {
        void updateEnquiryStatusInFirestore(enquiryId, status).catch(() => {});
      }
    },
    []
  );

  const deleteEnquiry = useCallback((enquiryId: string) => {
    setEnquiries((prev) => prev.filter((item) => item.id !== enquiryId));
  }, []);

  const resetDemoStore = useCallback(() => {
    hotelApiService.clearDemoData();
    setRooms(buildInitialRooms());
    setBookings(buildInitialDemoBookings());
    setGalleryPhotos(GALLERY_PHOTOS);
    setServices(HOTEL_SERVICES_DATA);
    setHotelInfo(buildInitialSettings());
    setEnquiries(buildInitialDemoEnquiries());
  }, []);

  const activePublicRooms = useMemo(
    () => rooms.filter((room) => room.isActive),
    [rooms]
  );

  const activePublicServices = useMemo(
    () => services.filter((service) => service.available),
    [services]
  );

  const value: HotelStoreContextValue = {
    adminSession,
    firebaseAdminEmail,
    loginAdmin,
    signInAdminWithGoogle,
    logoutAdmin,
    rooms,
    activePublicRooms,
    bookings,
    galleryPhotos,
    services,
    activePublicServices,
    hotelInfo,
    enquiries,
    notificationConfig,
    notificationLogs,
    refreshNotifications,
    retryBookingNotifications,
    saveRoom,
    deleteRoom,
    toggleRoomActive,
    setRoomAvailability,
    addBooking,
    updateBookingStatus,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
    saveService,
    deleteService,
    toggleServiceEnabled,
    updateHotelInfo,
    addEnquiry,
    updateEnquiryStatus,
    deleteEnquiry,
    resetDemoStore,
  };

  return (
    <HotelStoreContext.Provider value={value}>
      {children}
    </HotelStoreContext.Provider>
  );
}

export function useHotelStore(): HotelStoreContextValue {
  const ctx = useContext(HotelStoreContext);
  if (!ctx) {
    throw new Error('useHotelStore must be used inside HotelStoreProvider');
  }
  return ctx;
}
