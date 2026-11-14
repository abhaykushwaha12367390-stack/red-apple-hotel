import { useEffect, useState } from 'react';
import {
  Instagram,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  X,
} from 'lucide-react';
import {
  NAVIGATION_ITEMS,
  WHATSAPP_DEFAULT_MESSAGE,
} from '@/src/config/hotelConfig';
import { HotelLogo } from '@/src/components/HotelLogo';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdminPortal?: () => void;
}

type LegalDocType = 'privacy' | 'terms' | null;

export function Footer({ onNavigate, onOpenAdminPortal }: FooterProps) {
  const { hotelInfo, activePublicServices } = useHotelStore();
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>(null);

  const cleanWhatsappDigits = hotelInfo.whatsapp.replace(/[^\d]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(
    WHATSAPP_DEFAULT_MESSAGE
  )}`;
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    hotelInfo.address
  )}`;

  const footerServices = activePublicServices.slice(0, 5);

  useEffect(() => {
    if (!activeLegalDoc) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveLegalDoc(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLegalDoc]);

  const socialItems = [
    {
      id: 'instagram',
      label: 'Instagram',
      href: hotelInfo.socialLinks.instagram.trim(),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: hotelInfo.socialLinks.facebook.trim(),
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      href: hotelInfo.socialLinks.twitter.trim(),
    },
  ].filter((item) => item.href.length > 0);

  return (
    <footer className="bg-[#070708] text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        {/* Multi-Column Footer Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Column 1: Logo, Name & Short Description */}
          <div className="lg:col-span-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="inline-flex items-center gap-3 text-white whitespace-nowrap"
            >
              {hotelInfo.hotelLogoUrl ? (
                <img
                  src={hotelInfo.hotelLogoUrl}
                  alt={`${hotelInfo.hotelName} logo`}
                  className="h-8 w-8 rounded-sm object-contain shrink-0"
                />
              ) : (
                <HotelLogo className="h-8 w-8 text-[#C9A96E]" />
              )}
              <span className="font-display text-xl font-semibold tracking-[0.14em] uppercase">
                {hotelInfo.hotelName}
              </span>
            </a>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              {hotelInfo.description}
            </p>

            {socialItems.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {socialItems.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-medium text-white/75 transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4]"
                  >
                    {social.id === 'instagram' ? (
                      <Instagram className="h-3.5 w-3.5 text-[#C9A96E]" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5 text-[#C9A96E]" />
                    )}
                    <span>{social.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#C9A96E]">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.sectionId}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.sectionId);
                    }}
                    className="text-sm text-white/70 transition-colors duration-150 hover:text-[#E2CFA4]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#C9A96E]">
              Our Services
            </h3>
            <ul className="mt-5 space-y-3">
              {footerServices.map((service) => (
                <li key={service.id}>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('services');
                    }}
                    className="text-sm text-white/70 transition-colors duration-150 hover:text-[#E2CFA4]"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#C9A96E]">
              Contact Information
            </h3>
            <ul className="mt-5 space-y-3.5 text-sm text-white/75">
              <li>
                <a
                  href={`tel:${hotelInfo.phone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-3 transition-colors hover:text-[#E2CFA4] tabular-nums"
                >
                  <Phone
                    className="h-4 w-4 shrink-0 text-[#C9A96E]"
                    aria-hidden="true"
                  />
                  <span>{hotelInfo.phone}</span>
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${hotelInfo.email}`}
                  className="inline-flex items-center gap-3 transition-colors hover:text-[#E2CFA4] break-all"
                >
                  <Mail
                    className="h-4 w-4 shrink-0 text-[#C9A96E]"
                    aria-hidden="true"
                  />
                  <span>{hotelInfo.email}</span>
                </a>
              </li>

              <li>
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 transition-colors hover:text-[#E2CFA4]"
                >
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A96E]"
                    aria-hidden="true"
                  />
                  <span>{hotelInfo.address}</span>
                </a>
              </li>

              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors hover:text-[#E2CFA4] tabular-nums"
                >
                  <MessageCircle
                    className="h-4 w-4 shrink-0 text-[#C9A96E]"
                    aria-hidden="true"
                  />
                  <span>WhatsApp: +{cleanWhatsappDigits || hotelInfo.whatsapp}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} {hotelInfo.hotelName}. All
            Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveLegalDoc('privacy')}
              className="text-white/60 transition-colors hover:text-[#E2CFA4] cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalDoc('terms')}
              className="text-white/60 transition-colors hover:text-[#E2CFA4] cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            {onOpenAdminPortal && (
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="inline-flex items-center gap-1.5 text-white/50 transition-colors hover:text-[#E2CFA4] cursor-pointer"
              >
                <Lock className="h-3 w-3" aria-hidden="true" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editable Legal Notice Modal */}
      {activeLegalDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setActiveLegalDoc(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#C9A96E]/30 bg-[#121215] p-6 sm:p-8 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <h2
                id="legal-modal-title"
                className="font-display text-2xl font-medium text-white"
              >
                {activeLegalDoc === 'privacy'
                  ? 'Privacy Policy'
                  : 'Terms & Conditions'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveLegalDoc(null)}
                aria-label="Close legal notice"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 hover:border-[#C9A96E] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
              {activeLegalDoc === 'privacy' ? (
                <>
                  <p>
                    {hotelInfo.hotelName} respects guest privacy. Contact
                    enquiries and booking request details are used solely to
                    coordinate room availability and arrival hospitality.
                  </p>
                  <p>
                    Guest identification details provided during pre-arrival
                    booking requests are handled strictly for front-desk
                    verification and are never exposed publicly.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Standard check-in begins at {hotelInfo.checkInTime} and
                    check-out is at {hotelInfo.checkOutTime}. Early check-in or
                    late check-out is subject to room availability.
                  </p>
                  <p>
                    Reservation requests submitted online are reviewed by our
                    front desk prior to final confirmation. Replace this notice
                    with your property&apos;s official cancellation and payment
                    terms.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalDoc(null)}
                className="min-h-[40px] rounded-full bg-[#C9A96E] px-6 py-2 text-xs font-semibold text-[#0A0A0B] hover:bg-[#E2CFA4] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
