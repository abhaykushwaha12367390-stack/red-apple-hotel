import { WHATSAPP_DEFAULT_MESSAGE } from '@/src/config/hotelConfig';
import { useHotelStore } from '@/src/context/HotelStoreContext';

export function WhatsAppFloatingButton() {
  const { hotelInfo } = useHotelStore();
  const cleanDigits = hotelInfo.whatsapp.replace(/[^\d]/g, '');
  const whatsappUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
    WHATSAPP_DEFAULT_MESSAGE
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${hotelInfo.hotelName} on WhatsApp`}
      className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3.5 sm:px-5 text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] ring-1 ring-white/20 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#20BD5A] hover:shadow-[0_14px_34px_rgba(37,211,102,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
    >
      {/* Official WhatsApp Glyph SVG */}
      <svg
        viewBox="0 0 32 32"
        className="h-6 w-6 shrink-0 fill-current"
        aria-hidden="true"
      >
        <path d="M16.01 3.2C8.95 3.2 3.21 8.94 3.21 16c0 2.25.59 4.45 1.71 6.39L3.1 29.04l6.81-1.78a12.76 12.76 0 0 0 6.1 1.55h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.71 12.71 0 0 0 16.01 3.2Zm0 23.43h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.04 1.06 1.08-3.94-.25-.4a10.58 10.58 0 0 1-1.63-5.64c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.51 3.11a10.56 10.56 0 0 1 3.12 7.52c0 5.87-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.51-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.63-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.15 3.09 1.31 3.3.16.21 2.26 3.45 5.47 4.83.76.33 1.36.53 1.82.67.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="hidden sm:inline text-xs font-semibold tracking-wide whitespace-nowrap">
        WhatsApp Us
      </span>
    </a>
  );
}
