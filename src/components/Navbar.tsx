import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/src/config/hotelConfig';
import { HotelLogo } from '@/src/components/HotelLogo';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface NavbarProps {
  onBookNow: () => void;
  onNavigate: (sectionId: string) => void;
}

export function Navbar({ onBookNow, onNavigate }: NavbarProps) {
  const { hotelInfo } = useHotelStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);

      const scrollPosition = window.scrollY + 140;
      let currentId = NAVIGATION_ITEMS[0].sectionId;
      let bestTop = -Infinity;
      for (const item of NAVIGATION_ITEMS) {
        const element = document.getElementById(item.sectionId);
        if (element && element.offsetTop <= scrollPosition && element.offsetTop > bestTop) {
          bestTop = element.offsetTop;
          currentId = item.sectionId;
        }
      }
      setActiveSection(currentId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleLinkClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled || isMobileMenuOpen
          ? 'bg-[#0B0B0D]/95 backdrop-blur-md border-b border-[#C9A96E]/25 shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
          : 'bg-gradient-to-b from-black/75 via-black/40 to-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        {/* Left: Hotel Logo & Editable Hotel Name */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
          className="group flex items-center gap-3 text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-sm py-1"
        >
          {hotelInfo.hotelLogoUrl ? (
            <img
              src={hotelInfo.hotelLogoUrl}
              alt={`${hotelInfo.hotelName} logo`}
              className="h-8 w-8 rounded-sm object-contain shrink-0"
            />
          ) : (
            <HotelLogo className="h-8 w-8 text-[#C9A96E] transition-transform duration-200 group-hover:scale-105 shrink-0" />
          )}
          <span className="font-display text-lg sm:text-xl font-semibold tracking-[0.14em] uppercase text-white transition-colors duration-200 group-hover:text-[#E2CFA4]">
            {hotelInfo.hotelName}
          </span>
        </a>

        {/* Right: Desktop Navigation Links + Highlighted Book Now CTA */}
        <div className="hidden lg:flex items-center gap-7 shrink-0">
          <nav aria-label="Primary Navigation" className="flex items-center gap-6">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = activeSection === item.sectionId;
              return (
                <a
                  key={item.sectionId}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.sectionId);
                  }}
                  className={`group relative py-1.5 text-[13px] font-medium tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-sm ${
                    isActive
                      ? 'text-[#E2CFA4]'
                      : 'text-white/85 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#C9A96E] origin-left transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onBookNow}
            className="inline-flex items-center justify-center rounded-full bg-[#C9A96E] px-6 py-2.5 text-[13px] font-semibold tracking-[0.06em] text-[#0A0A0B] whitespace-nowrap shrink-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#E2CFA4] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,169,110,0.35)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D] cursor-pointer"
          >
            Book Now
          </button>
        </div>

        {/* Tablet & Mobile Controls */}
        <div className="flex lg:hidden items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBookNow}
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#C9A96E] px-5 py-2 text-xs font-semibold tracking-[0.05em] text-[#0A0A0B] whitespace-nowrap shrink-0 transition-colors duration-200 hover:bg-[#E2CFA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          >
            Book Now
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:border-[#C9A96E] hover:text-[#E2CFA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      <div
        id="mobile-navigation-menu"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen
            ? 'max-h-[480px] opacity-100 border-t border-white/10'
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav
          aria-label="Mobile Navigation"
          className="flex flex-col gap-1 bg-[#0B0B0D]/98 px-6 py-5"
        >
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeSection === item.sectionId;
            return (
              <a
                key={item.sectionId}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.sectionId);
                }}
                className={`flex min-h-[44px] items-center justify-between border-b border-white/8 py-2.5 text-sm font-medium tracking-[0.06em] transition-colors duration-150 ${
                  isActive ? 'text-[#E2CFA4]' : 'text-white/85 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <span
                  aria-hidden="true"
                  className={`h-px w-5 transition-colors ${
                    isActive ? 'bg-[#C9A96E]' : 'bg-transparent'
                  }`}
                />
              </a>
            );
          })}

          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBookNow();
              }}
              className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#C9A96E] px-6 py-3 text-sm font-semibold tracking-[0.06em] text-[#0A0A0B] transition-colors duration-200 hover:bg-[#E2CFA4] cursor-pointer"
            >
              Book Now
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
