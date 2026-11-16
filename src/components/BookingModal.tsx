import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  ShieldCheck,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface BookingModalProps {
  isOpen: boolean;
  preselectedRoomId?: string;
  initialNote?: string;
  onClose: () => void;
}

const ID_DOCUMENT_TYPES = [
  'Passport',
  'National ID Card',
  "Driver's License",
  'Provide at Hotel Check-In',
] as const;

export function BookingModal({
  isOpen,
  preselectedRoomId,
  initialNote = '',
  onClose,
}: BookingModalProps) {
  const { activePublicRooms, hotelInfo, addBooking } = useHotelStore();
  const availableRooms = activePublicRooms;

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(
    preselectedRoomId || availableRooms[0]?.id || ''
  );
  const [specialRequests, setSpecialRequests] = useState(initialNote);

  // Guest ID & Additional Booking Info
  const [idDocumentType, setIdDocumentType] = useState<string>(
    ID_DOCUMENT_TYPES[0]
  );
  const [idDocumentNumber, setIdDocumentNumber] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [arrivalWindow, setArrivalWindow] = useState('Standard (3:00 PM – 6:00 PM)');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState('');
  const [submittedAmountText, setSubmittedAmountText] = useState('');

  useEffect(() => {
    if (preselectedRoomId) {
      setSelectedRoomId(preselectedRoomId);
    } else if (!selectedRoomId && availableRooms[0]) {
      setSelectedRoomId(availableRooms[0].id);
    }
  }, [preselectedRoomId, availableRooms, selectedRoomId]);

  useEffect(() => {
    if (initialNote) {
      setSpecialRequests(initialNote);
    }
  }, [initialNote]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeRoom =
    availableRooms.find((room) => room.id === selectedRoomId) ??
    availableRooms[0];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadedDocName('');
      return;
    }
    setUploadedDocName(file.name);
  };

  const maskDocumentNumber = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return 'Will be verified at check-in';
    if (trimmed.length <= 4) return '••••';
    return `${'•'.repeat(trimmed.length - 4)}${trimmed.slice(-4)}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!activeRoom) {
      setFormError('No active rooms are currently available for booking.');
      return;
    }
    if (fullName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    const cleanPhone = mobileNumber.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 7) {
      setFormError('Please enter a valid mobile number.');
      return;
    }
    if (
      emailAddress.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())
    ) {
      setFormError('Please enter a valid email address or leave it blank.');
      return;
    }
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setFormError('Check-out date must be at least one night after check-in.');
      return;
    }
    if (adults < 1) {
      setFormError('At least 1 adult guest is required.');
      return;
    }
    if (
      idDocumentType !== 'Provide at Hotel Check-In' &&
      !idDocumentNumber.trim() &&
      !uploadedDocName
    ) {
      setFormError(
        'Please enter your identification document number, attach a verification file, or choose "Provide at Hotel Check-In".'
      );
      return;
    }
    if (!acceptedTerms) {
      setFormError(
        'Please accept the booking request terms before submitting.'
      );
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const createdBooking = await addBooking({
        guestName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        emailAddress: emailAddress.trim() || undefined,
        roomId: activeRoom.id,
        roomName: activeRoom.name,
        pricePerNight: activeRoom.pricePerNight,
        currencySymbol: activeRoom.currencySymbol,
        checkIn,
        checkOut,
        adults,
        children,
        specialRequests: specialRequests.trim() || undefined,
        arrivalWindow,
        idDocumentType,
        idDocumentMasked: maskDocumentNumber(idDocumentNumber),
        hasPrivateIdAttachment: Boolean(uploadedDocName),
      });

      setSubmittedBookingId(createdBooking.id);
      setSubmittedAmountText(
        `${createdBooking.currencySymbol}${createdBooking.estimatedAmount.toLocaleString(
          'en-IN'
        )} (${createdBooking.nights} night${
          createdBooking.nights === 1 ? '' : 's'
        })`
      );
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setSubmittedBookingId('');
    setSubmittedAmountText('');
    setFormError('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#C9A96E]/30 bg-[#121215] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        {/* Sticky Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#C9A96E]">
              {hotelInfo.hotelName}
            </p>
            <h2
              id="booking-modal-title"
              className="font-display mt-1 text-3xl font-medium text-white"
            >
              Reservation Request
            </h2>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Close booking request form"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-[#C9A96E] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          {submitted ? (
            <div className="py-4">
              <div className="rounded-xl border border-[#C9A96E]/35 bg-[#C9A96E]/10 p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 shrink-0 text-[#C9A96E]" />
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-[#E2CFA4]">
                      Pending Hotel Confirmation{submittedBookingId ? ` · ${submittedBookingId}` : ''}
                    </p>
                    <h3 className="font-display text-2xl font-medium text-white">
                      Booking Request Received
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Thank you, <span className="font-medium text-white">{fullName}</span>.
                  Your reservation request has been recorded for review by our
                  reservations desk. No payment has been charged and room
                  availability will be confirmed directly by our team.
                </p>

                <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-white/55">Requested Room</dt>
                    <dd className="mt-0.5 font-medium text-white">
                      {activeRoom?.name} (
                      <span className="text-white/55 line-through">
                        {activeRoom?.currencySymbol}1,999
                      </span>{' '}
                      → {activeRoom?.currencySymbol}
                      {activeRoom?.pricePerNight.toLocaleString('en-IN')}/night ·{' '}
                      <span className="text-[#E2CFA4]">50% OFF</span>)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/55">Stay Dates &amp; Estimate</dt>
                    <dd className="mt-0.5 font-medium text-white tabular-nums">
                      {checkIn} → {checkOut}
                      {submittedAmountText ? ` · ${submittedAmountText}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/55">Guests</dt>
                    <dd className="mt-0.5 font-medium text-white tabular-nums">
                      {adults} Adult{adults > 1 ? 's' : ''}
                      {children > 0
                        ? ` · ${children} Child${children > 1 ? 'ren' : ''}`
                        : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/55">Contact Mobile</dt>
                    <dd className="mt-0.5 font-medium text-white tabular-nums">
                      {mobileNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/55">Identification On File</dt>
                    <dd className="mt-0.5 font-medium text-white">
                      {idDocumentType} ({maskDocumentNumber(idDocumentNumber)})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/55">Estimated Arrival</dt>
                    <dd className="mt-0.5 font-medium text-white">
                      {arrivalWindow}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="min-h-[44px] rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
                >
                  Modify Request
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="min-h-[44px] rounded-full bg-[#C9A96E] px-7 py-2.5 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-[#E2CFA4] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Guest Contact Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-fullname"
                    className="block text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    Full Name <span className="text-[#C9A96E]">*</span>
                  </label>
                  <input
                    id="booking-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Guest full name"
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-mobile"
                    className="block text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    Mobile Number <span className="text-[#C9A96E]">*</span>
                  </label>
                  <input
                    id="booking-mobile"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 tabular-nums focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    Email Address{' '}
                    <span className="text-[11px] normal-case text-white/45">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="guest@example.com"
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-room"
                    className="block text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    Selected Room <span className="text-[#C9A96E]">*</span>
                  </label>
                  <select
                    id="booking-room"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white focus:border-[#C9A96E] focus:outline-none"
                  >
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.currencySymbol}1,999 →{' '}
                        {room.currencySymbol}
                        {room.pricePerNight.toLocaleString('en-IN')} / night ·
                        50% OFF)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stay Dates & Guest Counts */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-checkin"
                    className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#C9A96E]" />
                    <span>
                      Check-In Date <span className="text-[#C9A96E]">*</span>
                    </span>
                  </label>
                  <input
                    id="booking-checkin"
                    type="date"
                    required
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white tabular-nums focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-checkout"
                    className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#C9A96E]" />
                    <span>
                      Check-Out Date <span className="text-[#C9A96E]">*</span>
                    </span>
                  </label>
                  <input
                    id="booking-checkout"
                    type="date"
                    required
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white tabular-nums focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="booking-adults"
                    className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
                    <span>
                      Adults <span className="text-[#C9A96E]">*</span>
                    </span>
                  </label>
                  <select
                    id="booking-adults"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white tabular-nums focus:border-[#C9A96E] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count} Adult{count > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="booking-children"
                    className="block text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    Children
                  </label>
                  <select
                    id="booking-children"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white tabular-nums focus:border-[#C9A96E] focus:outline-none"
                  >
                    {[0, 1, 2, 3, 4].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? 'Child' : 'Children'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="booking-arrival"
                    className="block text-xs font-medium tracking-wide uppercase text-white/80"
                  >
                    Arrival Window
                  </label>
                  <select
                    id="booking-arrival"
                    value={arrivalWindow}
                    onChange={(e) => setArrivalWindow(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white focus:border-[#C9A96E] focus:outline-none"
                  >
                    <option value="Early (12:00 PM – 3:00 PM)">
                      Early (12:00 PM – 3:00 PM)
                    </option>
                    <option value="Standard (3:00 PM – 6:00 PM)">
                      Standard (3:00 PM – 6:00 PM)
                    </option>
                    <option value="Evening (6:00 PM – 10:00 PM)">
                      Evening (6:00 PM – 10:00 PM)
                    </option>
                    <option value="Late Night (After 10:00 PM)">
                      Late Night (After 10:00 PM)
                    </option>
                  </select>
                </div>
              </div>

              {/* Guest Identification & Additional Booking Information */}
              <div className="rounded-xl border border-white/12 bg-[#0B0B0D] p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase text-[#E2CFA4]">
                      <ShieldCheck className="h-4 w-4 text-[#C9A96E]" />
                      <span>Guest Identification &amp; Arrival Details</span>
                    </h3>
                    <p className="mt-1 text-xs text-white/55">
                      Identification details are kept private for hotel check-in
                      verification and are never displayed publicly.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="booking-id-type"
                      className="block text-xs font-medium tracking-wide uppercase text-white/75"
                    >
                      Identification Document Type
                    </label>
                    <select
                      id="booking-id-type"
                      value={idDocumentType}
                      onChange={(e) => setIdDocumentType(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/15 bg-[#131316] px-3.5 py-2.5 text-sm text-white focus:border-[#C9A96E] focus:outline-none"
                    >
                      {ID_DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-id-number"
                      className="block text-xs font-medium tracking-wide uppercase text-white/75"
                    >
                      Document Number{' '}
                      <span className="text-[11px] normal-case text-white/45">
                        (or upload below)
                      </span>
                    </label>
                    <input
                      id="booking-id-number"
                      type="password"
                      autoComplete="off"
                      disabled={idDocumentType === 'Provide at Hotel Check-In'}
                      value={idDocumentNumber}
                      onChange={(e) => setIdDocumentNumber(e.target.value)}
                      placeholder={
                        idDocumentType === 'Provide at Hotel Check-In'
                          ? 'Presented upon arrival'
                          : 'Enter ID number'
                      }
                      className="mt-2 w-full rounded-lg border border-white/15 bg-[#131316] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 disabled:opacity-50 focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>
                </div>

                {idDocumentType !== 'Provide at Hotel Check-In' && (
                  <div>
                    <label
                      htmlFor="booking-id-upload"
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-white/20 bg-[#131316] px-4 py-3 text-xs text-white/75 transition-colors hover:border-[#C9A96E]/60"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        {uploadedDocName ? (
                          <FileText className="h-4 w-4 shrink-0 text-[#C9A96E]" />
                        ) : (
                          <Upload className="h-4 w-4 shrink-0 text-[#C9A96E]" />
                        )}
                        <span className="truncate">
                          {uploadedDocName
                            ? `Selected privately: ${uploadedDocName}`
                            : 'Optional: Attach ID scan (PDF, JPG, PNG — never shared publicly)'}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-[#E2CFA4]">
                        Browse
                      </span>
                    </label>
                    <input
                      id="booking-id-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label
                  htmlFor="booking-requests"
                  className="block text-xs font-medium tracking-wide uppercase text-white/80"
                >
                  Special Requests{' '}
                  <span className="text-[11px] normal-case text-white/45">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="booking-requests"
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Airport transfer, extra crib, dietary preferences, or late arrival..."
                  className="mt-2 w-full rounded-lg border border-white/15 bg-[#0A0A0B] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                />
              </div>

              {/* Booking Terms Acceptance */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <p className="text-xs text-white/55">
                  Check-in {hotelInfo.checkInTime} · Check-out{' '}
                  {hotelInfo.checkOutTime}. Submitting this form sends a
                  booking request; no payment is collected online at this stage.
                </p>

                <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-white/85">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#0A0A0B] accent-[#C9A96E]"
                  />
                  <span>
                    I accept the hotel&apos;s reservation request terms and
                    understand that final booking confirmation depends on room
                    availability.
                  </span>
                </label>
              </div>

              {formError && (
                <p role="alert" className="text-xs text-[#F2B8B5]">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="min-h-[44px] rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/45 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] rounded-full bg-[#C9A96E] px-8 py-2.5 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-[#E2CFA4] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting
                    ? 'Saving Request...'
                    : 'Confirm Booking Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
