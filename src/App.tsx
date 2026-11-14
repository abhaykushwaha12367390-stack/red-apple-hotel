import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '@/src/components/Navbar';
import { HeroSection } from '@/src/components/HeroSection';
import { SectionFoundation } from '@/src/components/SectionFoundation';
import { RoomsSection } from '@/src/components/RoomsSection';
import { BookingModal } from '@/src/components/BookingModal';
import { Footer } from '@/src/components/Footer';
import { WhatsAppFloatingButton } from '@/src/components/WhatsAppFloatingButton';
import type { RoomCategory } from '@/src/data/roomsData';
import {
  HotelStoreProvider,
  useHotelStore,
} from '@/src/context/HotelStoreContext';
import { AdminLoginPage } from '@/src/components/admin/AdminLoginPage';
import {
  AdminLayout,
  type AdminSectionRoute,
} from '@/src/components/admin/AdminLayout';
import { AdminDashboardHome } from '@/src/components/admin/AdminDashboardHome';
import { ManageRoomsView } from '@/src/components/admin/ManageRoomsView';
import { ManageBookingsView } from '@/src/components/admin/ManageBookingsView';
import { ManageGalleryView } from '@/src/components/admin/ManageGalleryView';
import { ManageServicesView } from '@/src/components/admin/ManageServicesView';
import { ManageHotelInfoView } from '@/src/components/admin/ManageHotelInfoView';
import { ContactEnquiriesView } from '@/src/components/admin/ContactEnquiriesView';
import { AdminSettingsView } from '@/src/components/admin/AdminSettingsView';

const VALID_ADMIN_SECTION_ROUTES: AdminSectionRoute[] = [
  '/admin/dashboard',
  '/admin/rooms',
  '/admin/bookings',
  '/admin/gallery',
  '/admin/services',
  '/admin/hotel-info',
  '/admin/enquiries',
  '/admin/settings',
];

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function normalizeAdminSection(pathname: string): AdminSectionRoute {
  if (
    VALID_ADMIN_SECTION_ROUTES.includes(pathname as AdminSectionRoute)
  ) {
    return pathname as AdminSectionRoute;
  }
  return '/admin/dashboard';
}

function AppRouterContent() {
  const { adminSession } = useHotelStore();
  const [pathname, setPathname] = useState<string>(() =>
    window.location.pathname || '/'
  );

  // Public hotel website booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTopic, setBookingTopic] = useState<string>('');
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(
    undefined
  );

  const navigate = useCallback((to: string, replace = false) => {
    if (window.location.pathname !== to) {
      if (replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }
    }
    setPathname(to);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route Guard for /admin and /admin/* routes
  useEffect(() => {
    if (!isAdminPath(pathname)) return;

    if (pathname === '/admin/login') {
      if (adminSession) {
        navigate('/admin/dashboard', true);
      }
      return;
    }

    if (!adminSession) {
      navigate('/admin/login', true);
      return;
    }

    if (pathname === '/admin' || pathname === '/admin/') {
      navigate('/admin/dashboard', true);
    }
  }, [pathname, adminSession, navigate]);

  const scrollToSection = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleOpenBooking = useCallback((preferredTopic = '') => {
    setPreselectedRoomId(undefined);
    setBookingTopic(preferredTopic);
    setBookingModalOpen(true);
  }, []);

  const handleBookSpecificRoom = useCallback((room: RoomCategory) => {
    setPreselectedRoomId(room.id);
    setBookingTopic('');
    setBookingModalOpen(true);
  }, []);

  // 1. Admin Login Route
  if (pathname === '/admin/login') {
    if (adminSession) {
      return null;
    }
    return (
      <AdminLoginPage
        onSuccessRedirect={() => navigate('/admin/dashboard', true)}
        onBackToSite={() => navigate('/')}
      />
    );
  }

  // 2. Protected Admin Dashboard Routes (/admin/*)
  if (isAdminPath(pathname)) {
    if (!adminSession) {
      return (
        <AdminLoginPage
          onSuccessRedirect={() => navigate('/admin/dashboard', true)}
          onBackToSite={() => navigate('/')}
        />
      );
    }

    const activeRoute = normalizeAdminSection(pathname);

    return (
      <AdminLayout
        currentRoute={activeRoute}
        onNavigateAdmin={(route) => navigate(route)}
        onViewPublicSite={() => navigate('/')}
      >
        {activeRoute === '/admin/dashboard' && (
          <AdminDashboardHome onNavigate={(route) => navigate(route)} />
        )}
        {activeRoute === '/admin/rooms' && <ManageRoomsView />}
        {activeRoute === '/admin/bookings' && <ManageBookingsView />}
        {activeRoute === '/admin/gallery' && <ManageGalleryView />}
        {activeRoute === '/admin/services' && <ManageServicesView />}
        {activeRoute === '/admin/hotel-info' && <ManageHotelInfoView />}
        {activeRoute === '/admin/enquiries' && <ContactEnquiriesView />}
        {activeRoute === '/admin/settings' && <AdminSettingsView />}
      </AdminLayout>
    );
  }

  // 3. Public Hotel Website (Parts 1–4 preserved completely)
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Navbar
        onBookNow={() => handleOpenBooking()}
        onNavigate={scrollToSection}
      />

      <main>
        <HeroSection
          onExploreRooms={() => scrollToSection('rooms')}
          onBookStay={() => handleOpenBooking()}
          onScrollNext={() => scrollToSection('about')}
        />

        <SectionFoundation
          onOpenBooking={handleOpenBooking}
          onNavigate={scrollToSection}
          roomsSlot={<RoomsSection onBookRoom={handleBookSpecificRoom} />}
        />
      </main>

      <Footer
        onNavigate={scrollToSection}
        onOpenAdminPortal={() => navigate('/admin/login')}
      />

      <WhatsAppFloatingButton />

      <BookingModal
        isOpen={bookingModalOpen}
        preselectedRoomId={preselectedRoomId}
        initialNote={bookingTopic}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <HotelStoreProvider>
      <AppRouterContent />
    </HotelStoreProvider>
  );
}
