import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import type { RoomCategory } from '@/src/data/roomsData';
import { RoomImageSlider } from '@/src/components/RoomImageSlider';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface RoomContactModalProps {
  room: RoomCategory | null;
  onClose: () => void;
  onOpenLightbox: (room: RoomCategory, photoIndex: number) => void;
}

export function RoomContactModal({
  room,
  onClose,
  onOpenLightbox,
}: RoomContactModalProps) {
  const { hotelInfo, addEnquiry } = useHotelStore();
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!room) return;
    setMessage(
      `Hello, I would like to enquire about the ${room.name} (${room.currencySymbol}${room.pricePerNight}/night).`
    );
    setSubmitted(false);
    setFormError('');
  }, [room]);

  useEffect(() => {
    if (!room) return;

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
  }, [room, onClose]);

  if (!room) return null;

  const cleanWhatsappDigits = hotelInfo.whatsapp.replace(/[^\d]/g, '');
  const whatsappText = encodeURIComponent(
    `Hello ${hotelInfo.hotelName}, I am enquiring about the ${room.name}.`
  );
  const whatsappHref = `https://wa.me/${cleanWhatsappDigits}?text=${whatsappText}`;
  const mailtoSubject = encodeURIComponent(
    `Room Enquiry: ${room.name} — ${hotelInfo.hotelName}`
  );
  const mailtoHref = `mailto:${hotelInfo.email}?subject=${mailtoSubject}`;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (guestName.trim().length < 2) {
      setFormError('Please enter your name.');
      return;
    }
    if (guestContact.trim().length < 5) {
      setFormError('Please enter a phone number or email address.');
      return;
    }
    if (message.trim().length < 8) {
      setFormError('Please enter a brief enquiry message.');
      return;
    }

    const trimmedContact = guestContact.trim();
    const isEmail = trimmedContact.includes('@');
    addEnquiry({
      customerName: guestName.trim(),
      phoneNumber: isEmail ? 'Not provided' : trimmedContact,
      email: isEmail ? trimmedContact : 'Not provided',
      subject: `Room Enquiry: ${room.name}`,
      message: message.trim(),
      roomContext: room.name,
    });

    setFormError('');
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-contact-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#C9A96E]/30 bg-[#121215] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#C9A96E]">
              Room Enquiry · {hotelInfo.hotelName}
            </p>
            <h2
              id="room-contact-title"
              className="font-display mt-1 text-3xl font-medium text-white"
            >
              Contact Us — {room.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close room contact modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-[#C9A96E] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Selected Room Slider + Direct Contact Channels */}
            <div className="space-y-5 lg:col-span-6">
              <RoomImageSlider
                photos={room.photos}
                roomName={room.name}
                autoPlayIntervalMs={3000}
                aspectClassName="aspect-[4/3]"
                onImageClick={(photoIndex) => onOpenLightbox(room, photoIndex)}
              />

              <div className="rounded-xl border border-white/12 bg-[#0B0B0D] p-5 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/55">
                    Hotel Reservations Desk
                  </p>
                  <p className="mt-1 font-display text-xl text-white">
                    {room.name} ·{' '}
                    <span className="text-[#E2CFA4] tabular-nums">
                      {room.currencySymbol}
                      {room.pricePerNight}/night
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/85">
                  <Phone
                    className="h-4 w-4 shrink-0 text-[#C9A96E]"
                    aria-hidden="true"
                  />
                  <a
                    href={`tel:${hotelInfo.phone.replace(/[^\d+]/g, '')}`}
                    className="hover:text-[#E2CFA4] transition-colors tabular-nums"
                  >
                    {hotelInfo.phone}
                  </a>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#C9A96E] px-5 py-2 text-xs font-semibold tracking-wide text-[#0A0A0B] transition-colors hover:bg-[#E2CFA4]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Concierge</span>
                  </a>

                  <a
                    href={mailtoHref}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-xs font-semibold tracking-wide text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4]"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Desk</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Room-Specific Contact Enquiry Form */}
            <div className="lg:col-span-6">
              {submitted ? (
                <div className="flex h-full flex-col justify-center rounded-xl border border-[#C9A96E]/35 bg-[#C9A96E]/10 p-7 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#C9A96E]" />
                  <h3 className="font-display mt-4 text-2xl font-medium text-white">
                    Room Enquiry Sent
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/80">
                    Thank you, {guestName}. Your question regarding the{' '}
                    <span className="text-[#E2CFA4]">{room.name}</span> has been
                    prepared for our concierge team.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mx-auto mt-6 min-h-[42px] rounded-full bg-[#C9A96E] px-7 py-2.5 text-xs font-semibold text-[#0A0A0B] transition-colors hover:bg-[#E2CFA4] cursor-pointer"
                  >
                    Return to Rooms
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4 rounded-xl border border-white/12 bg-[#0B0B0D] p-6"
                >
                  <div>
                    <h3 className="font-display text-2xl font-medium text-white">
                      Enquire About This Room
                    </h3>
                    <p className="mt-1 text-xs text-white/60">
                      Ask about availability, bespoke setup, or group stays for{' '}
                      {room.name}.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-room-name"
                      className="block text-xs font-medium tracking-wide uppercase text-white/75"
                    >
                      Your Name <span className="text-[#C9A96E]">*</span>
                    </label>
                    <input
                      id="contact-room-name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Full name"
                      className="mt-2 w-full rounded-lg border border-white/15 bg-[#131316] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-room-reach"
                      className="block text-xs font-medium tracking-wide uppercase text-white/75"
                    >
                      Phone or Email <span className="text-[#C9A96E]">*</span>
                    </label>
                    <input
                      id="contact-room-reach"
                      type="text"
                      value={guestContact}
                      onChange={(e) => setGuestContact(e.target.value)}
                      placeholder="+00 000 000 0000 or guest@example.com"
                      className="mt-2 w-full rounded-lg border border-white/15 bg-[#131316] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-room-message"
                      className="block text-xs font-medium tracking-wide uppercase text-white/75"
                    >
                      Enquiry Message <span className="text-[#C9A96E]">*</span>
                    </label>
                    <textarea
                      id="contact-room-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/15 bg-[#131316] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>

                  {formError && (
                    <p role="alert" className="text-xs text-[#F2B8B5]">
                      {formError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-h-[42px] rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-white/80 transition-colors hover:border-white/45 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="min-h-[42px] rounded-full bg-[#C9A96E] px-6 py-2 text-xs font-semibold text-[#0A0A0B] transition-colors hover:bg-[#E2CFA4] cursor-pointer"
                    >
                      Send Enquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
