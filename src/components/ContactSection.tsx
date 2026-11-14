import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
} from 'lucide-react';
import { WHATSAPP_DEFAULT_MESSAGE } from '@/src/config/hotelConfig';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface ContactSectionProps {
  onOpenBooking: (preferredTopic?: string) => void;
}

export interface ContactEnquiryPayload {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  subject: string;
  message: string;
  submittedAtIso: string;
}

export function ContactSection({ onOpenBooking }: ContactSectionProps) {
  const { hotelInfo, addEnquiry } = useHotelStore();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [preparedEnquiry, setPreparedEnquiry] =
    useState<ContactEnquiryPayload | null>(null);

  const cleanWhatsappDigits = hotelInfo.whatsapp.replace(/[^\d]/g, '');
  const buildWhatsappUrl = (customText = WHATSAPP_DEFAULT_MESSAGE) =>
    `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(
      customText
    )}`;

  const dialHref = `tel:${hotelInfo.phone.replace(/[^\d+]/g, '')}`;
  const whatsappHref = buildWhatsappUrl();
  const emailHref = `mailto:${hotelInfo.email}`;
  const mapsSearchHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    hotelInfo.address
  )}`;
  const mapsDirectionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    hotelInfo.address
  )}`;
  const mapsEmbedSrc = hotelInfo.googleMapsUrl.trim()
    ? hotelInfo.googleMapsUrl.trim()
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        hotelInfo.address
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (fullName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }

    const digitsOnly = mobileNumber.replace(/[^\d]/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setFormError('Please enter a valid mobile number (7–15 digits).');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (subject.trim().length < 3) {
      setFormError('Please enter a subject for your enquiry.');
      return;
    }

    if (message.trim().length < 10) {
      setFormError('Please enter a message of at least 10 characters.');
      return;
    }

    setFormError('');

    const recorded = addEnquiry({
      customerName: fullName.trim(),
      phoneNumber: mobileNumber.trim(),
      email: emailAddress.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    // Structured payload ready for future backend API integration (e.g. POST /api/enquiries)
    const payload: ContactEnquiryPayload = {
      id: recorded.id,
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      emailAddress: emailAddress.trim(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAtIso: new Date().toISOString(),
    };

    setPreparedEnquiry(payload);
    setFullName('');
    setMobileNumber('');
    setEmailAddress('');
    setSubject('');
    setMessage('');
  };

  const contactCards = [
    {
      id: 'phone',
      title: 'Phone Number',
      value: hotelInfo.phone,
      helper: 'Direct Reservations Desk',
      actionLabel: 'Call Hotel',
      href: dialHref,
      external: false,
      icon: Phone,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      value: `+${cleanWhatsappDigits || hotelInfo.whatsapp}`,
      helper: 'Instant Guest Assistance',
      actionLabel: 'Open WhatsApp',
      href: whatsappHref,
      external: true,
      icon: MessageCircle,
    },
    {
      id: 'email',
      title: 'Email Address',
      value: hotelInfo.email,
      helper: 'Concierge & Group Stays',
      actionLabel: 'Send Email',
      href: emailHref,
      external: false,
      icon: Mail,
    },
    {
      id: 'address',
      title: 'Hotel Address',
      value: hotelInfo.address,
      helper: `Check-in ${hotelInfo.checkInTime} · Check-out ${hotelInfo.checkOutTime}`,
      actionLabel: 'Open in Maps',
      href: mapsSearchHref,
      external: true,
      icon: MapPin,
    },
  ];

  return (
    <section
      id="contact"
      className="bg-[#0B0B0D] text-white py-24 lg:py-32 border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Heading & Subtitle */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#C9A96E]">
              Contact Us
            </p>
            <h2 className="font-display mt-3 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1.12] text-white [text-wrap:balance]">
              Get In Touch With Us
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              We are always happy to assist you with your stay.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="inline-flex min-h-[44px] items-center justify-center self-start rounded-full bg-[#C9A96E] px-7 py-3 text-sm font-semibold tracking-[0.04em] text-[#0A0A0B] whitespace-nowrap transition-all duration-200 hover:bg-[#E2CFA4] hover:-translate-y-0.5 cursor-pointer"
          >
            Book Your Stay
          </button>
        </div>

        {/* Four Contact Information Cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/12 bg-[#131316] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A96E]/55"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#C9A96E]/30 bg-[#0B0B0D] text-[#C9A96E] transition-colors duration-200 group-hover:bg-[#C9A96E] group-hover:text-[#0A0A0B]">
                    <IconComponent className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-xs font-medium tracking-[0.14em] uppercase text-white/55">
                    {card.title}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-white break-words tabular-nums">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-white/50">{card.helper}</p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <a
                    href={card.href}
                    target={card.external ? '_blank' : undefined}
                    rel={card.external ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.05em] uppercase text-[#E2CFA4] transition-colors hover:text-white"
                  >
                    <span>{card.actionLabel}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Enquiry Form + Google Maps Split */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Professional Contact Enquiry Form */}
          <div className="lg:col-span-6">
            <div className="h-full rounded-2xl border border-white/12 bg-[#131316] p-7 sm:p-10">
              <h3 className="font-display text-3xl font-medium text-white">
                Send Us an Enquiry
              </h3>
              <p className="mt-2 text-sm text-white/65">
                Share your dates, questions, or special requests and choose how
                you would like to reach our concierge desk.
              </p>

              {preparedEnquiry ? (
                <div className="mt-8 rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/10 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#C9A96E]" />
                    <div>
                      <h4 className="font-display text-2xl font-medium text-white">
                        Enquiry Ready for Dispatch
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                        Thank you,{' '}
                        <span className="font-medium text-white">
                          {preparedEnquiry.fullName}
                        </span>
                        . Your enquiry has been validated locally (no automated
                        backend mail service is connected yet). Send it
                        directly using your preferred channel below:
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-[#0B0B0D]/75 p-4 text-xs text-white/75 space-y-1">
                    <p>
                      <span className="text-white/50">Subject:</span>{' '}
                      {preparedEnquiry.subject}
                    </p>
                    <p>
                      <span className="text-white/50">Reply Contact:</span>{' '}
                      {preparedEnquiry.mobileNumber} ·{' '}
                      {preparedEnquiry.emailAddress}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <a
                      href={`mailto:${hotelInfo.email}?subject=${encodeURIComponent(
                        preparedEnquiry.subject
                      )}&body=${encodeURIComponent(
                        `Name: ${preparedEnquiry.fullName}\nMobile: ${preparedEnquiry.mobileNumber}\nEmail: ${preparedEnquiry.emailAddress}\n\n${preparedEnquiry.message}`
                      )}`}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#C9A96E] px-5 py-2 text-xs font-semibold text-[#0A0A0B] transition-colors hover:bg-[#E2CFA4]"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Open in Email App</span>
                    </a>

                    <a
                      href={buildWhatsappUrl(
                        `Hello ${hotelInfo.hotelName}, my name is ${preparedEnquiry.fullName} (${preparedEnquiry.mobileNumber}). Subject: ${preparedEnquiry.subject}. ${preparedEnquiry.message}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-xs font-semibold text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Send via WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setPreparedEnquiry(null)}
                      className="inline-flex min-h-[42px] items-center rounded-full border border-white/15 px-5 py-2 text-xs font-medium text-white/75 transition-colors hover:text-white cursor-pointer"
                    >
                      New Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-7 space-y-5"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-fullname"
                        className="block text-xs font-medium tracking-wide uppercase text-white/80"
                      >
                        Full Name <span className="text-[#C9A96E]">*</span>
                      </label>
                      <input
                        id="contact-fullname"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="mt-2 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-mobile"
                        className="block text-xs font-medium tracking-wide uppercase text-white/80"
                      >
                        Mobile Number <span className="text-[#C9A96E]">*</span>
                      </label>
                      <input
                        id="contact-mobile"
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+00 000 000 0000"
                        className="mt-2 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-4 py-3 text-sm text-white placeholder:text-white/35 tabular-nums focus:border-[#C9A96E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium tracking-wide uppercase text-white/80"
                      >
                        Email Address <span className="text-[#C9A96E]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="guest@example.com"
                        className="mt-2 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-medium tracking-wide uppercase text-white/80"
                      >
                        Subject <span className="text-[#C9A96E]">*</span>
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Room inquiry, event, or transfer"
                        className="mt-2 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium tracking-wide uppercase text-white/80"
                    >
                      Message <span className="text-[#C9A96E]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your preferred dates, guest count, or questions..."
                      className="mt-2 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>

                  {formError && (
                    <p role="alert" className="text-xs text-[#F2B8B5]">
                      {formError}
                    </p>
                  )}

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#C9A96E] px-8 py-3 text-sm font-semibold tracking-[0.04em] text-[#0A0A0B] transition-all duration-200 hover:bg-[#E2CFA4] hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span>Submit Enquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: Google Maps Integration ("Find Our Location") */}
          <div className="lg:col-span-6">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-white/12 bg-[#131316] p-7 sm:p-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#C9A96E]">
                    Location &amp; Arrival
                  </p>
                  <h3 className="font-display mt-1.5 text-3xl font-medium text-white">
                    Find Our Location
                  </h3>
                  <p className="mt-2 text-sm text-white/70">{hotelInfo.address}</p>
                </div>

                <a
                  href={mapsDirectionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#C9A96E]/60 px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase text-[#E2CFA4] whitespace-nowrap transition-all duration-200 hover:bg-[#C9A96E] hover:text-[#0A0A0B]"
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Get Directions</span>
                </a>
              </div>

              <div className="mt-6 flex-1 overflow-hidden rounded-xl border border-white/12 bg-[#0A0A0B]">
                <iframe
                  title={`Google Map showing ${hotelInfo.hotelName} location`}
                  src={mapsEmbedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[320px] w-full sm:h-[360px] lg:h-full lg:min-h-[360px] border-0 grayscale-[20%] contrast-[1.04]"
                  allowFullScreen
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/60">
                <span className="flex items-center gap-2 tabular-nums">
                  <Clock className="h-3.5 w-3.5 text-[#C9A96E]" aria-hidden="true" />
                  Check-in {hotelInfo.checkInTime} · Check-out{' '}
                  {hotelInfo.checkOutTime}
                </span>
                <a
                  href={mapsSearchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E2CFA4] hover:underline"
                >
                  View Larger Map
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
