import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  collection,
  doc,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { BookingRecord, BookingStatus, EnquiryRecord, EnquiryStatus } from '@/src/types/hotel';

const app = initializeApp(firebaseConfig);

function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testFirestoreConnection();

/**
 * Persist a sanitized booking request to Cloud Firestore (Bookings collection).
 * Strictly excludes raw ID document numbers or uploaded file bytes.
 */
export async function saveBookingToFirestore(
  booking: BookingRecord
): Promise<void> {
  const path = `bookings/${booking.id}`;
  try {
    const docPayload: Record<string, unknown> = {
      id: booking.id,
      guestName: booking.guestName.slice(0, 120),
      mobileNumber: booking.mobileNumber.slice(0, 30),
      roomId: booking.roomId,
      roomName: booking.roomName.slice(0, 120),
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      estimatedAmount: booking.estimatedAmount,
      currencySymbol: booking.currencySymbol,
      adults: booking.adults,
      children: booking.children,
      guestsCount: booking.guestsCount,
      bookingDate: booking.bookingDate,
      status: 'Pending',
      createdAt: serverTimestamp(),
    };

    if (booking.emailAddress) {
      docPayload.emailAddress = booking.emailAddress.slice(0, 160);
    }
    if (booking.specialRequests) {
      docPayload.specialRequests = booking.specialRequests.slice(0, 1000);
    }
    if (booking.arrivalWindow) {
      docPayload.arrivalWindow = booking.arrivalWindow.slice(0, 80);
    }
    if (booking.idDocumentType) {
      docPayload.idDocumentType = booking.idDocumentType.slice(0, 60);
    }
    if (booking.idDocumentMasked) {
      docPayload.idDocumentMasked = booking.idDocumentMasked.slice(0, 40);
    }
    if (typeof booking.hasPrivateIdAttachment === 'boolean') {
      docPayload.hasPrivateIdAttachment = booking.hasPrivateIdAttachment;
    }

    await setDoc(doc(db, 'bookings', booking.id), docPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBookingStatusInFirestore(
  bookingId: string,
  updates: {
    status?: BookingStatus;
    whatsappNotificationStatus?: 'pending' | 'sent' | 'failed' | 'not_configured';
    emailNotificationStatus?: 'pending' | 'sent' | 'failed' | 'not_configured';
  }
): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveEnquiryToFirestore(
  enquiry: EnquiryRecord
): Promise<void> {
  const path = `enquiries/${enquiry.id}`;
  try {
    const docPayload: Record<string, unknown> = {
      id: enquiry.id,
      customerName: enquiry.customerName.slice(0, 120),
      phoneNumber: enquiry.phoneNumber.slice(0, 40),
      email: enquiry.email.slice(0, 160),
      subject: enquiry.subject.slice(0, 200),
      message: enquiry.message.slice(0, 2000),
      enquiryDate: enquiry.enquiryDate,
      status: 'Unread',
      createdAt: serverTimestamp(),
    };
    if (enquiry.roomContext) {
      docPayload.roomContext = enquiry.roomContext.slice(0, 120);
    }
    await setDoc(doc(db, 'enquiries', enquiry.id), docPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateEnquiryStatusInFirestore(
  enquiryId: string,
  status: EnquiryStatus
): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'enquiries', enquiryId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToBookingsAsAdmin(
  onData: (bookings: BookingRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'bookings';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: BookingRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        return {
          id: String(d.id || snap.id),
          guestName: String(d.guestName || ''),
          mobileNumber: String(d.mobileNumber || ''),
          emailAddress: d.emailAddress ? String(d.emailAddress) : undefined,
          roomId: String(d.roomId || ''),
          roomName: String(d.roomName || ''),
          checkIn: String(d.checkIn || ''),
          checkOut: String(d.checkOut || ''),
          nights: Number(d.nights) || 1,
          estimatedAmount: Number(d.estimatedAmount) || 0,
          currencySymbol: String(d.currencySymbol || '$'),
          adults: Number(d.adults) || 1,
          children: Number(d.children) || 0,
          guestsCount: Number(d.guestsCount) || 1,
          bookingDate: String(d.bookingDate || ''),
          status: (d.status as BookingStatus) || 'Pending',
          specialRequests: d.specialRequests ? String(d.specialRequests) : undefined,
          arrivalWindow: d.arrivalWindow ? String(d.arrivalWindow) : undefined,
          idDocumentType: d.idDocumentType ? String(d.idDocumentType) : undefined,
          idDocumentMasked: d.idDocumentMasked
            ? String(d.idDocumentMasked)
            : undefined,
          hasPrivateIdAttachment: Boolean(d.hasPrivateIdAttachment),
          whatsappNotificationStatus: d.whatsappNotificationStatus,
          emailNotificationStatus: d.emailNotificationStatus,
          isDemoData: false,
        };
      });
      onData(items);
    },
    (err) => {
      console.error('Firestore bookings listener error:', err);
      onError(err);
    }
  );
}
