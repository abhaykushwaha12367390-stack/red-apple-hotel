import { useState, type ReactNode } from 'react';
import {
  BedDouble,
  Building2,
  CalendarCheck2,
  ConciergeBell,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  X,
} from 'lucide-react';
import { HotelLogo } from '@/src/components/HotelLogo';
import { useHotelStore } from '@/src/context/HotelStoreContext';

export type AdminSectionRoute =
  | '/admin/dashboard'
  | '/admin/rooms'
  | '/admin/bookings'
  | '/admin/gallery'
  | '/admin/services'
  | '/admin/hotel-info'
  | '/admin/enquiries'
  | '/admin/settings';

interface AdminNavItem {
  path: AdminSectionRoute;
  label: string;
  icon: typeof LayoutDashboard;
  badgeCount?: number;
}

interface AdminLayoutProps {
  currentRoute: AdminSectionRoute;
  onNavigateAdmin: (path: AdminSectionRoute) => void;
  onViewPublicSite: () => void;
  children: ReactNode;
}

export function AdminLayout({
  currentRoute,
  onNavigateAdmin,
  onViewPublicSite,
  children,
}: AdminLayoutProps) {
  const { adminSession, hotelInfo, bookings, enquiries, logoutAdmin } =
    useHotelStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pendingBookingsCount = bookings.filter(
    (b) => b.status === 'Pending'
  ).length;
  const unreadEnquiriesCount = enquiries.filter(
    (e) => e.status === 'Unread'
  ).length;

  const navItems: AdminNavItem[] = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/rooms',
      label: 'Manage Rooms',
      icon: BedDouble,
    },
    {
      path: '/admin/bookings',
      label: 'Manage Bookings',
      icon: CalendarCheck2,
      badgeCount: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
    },
    {
      path: '/admin/gallery',
      label: 'Manage Gallery',
      icon: Images,
    },
    {
      path: '/admin/services',
      label: 'Manage Services',
      icon: ConciergeBell,
    },
    {
      path: '/admin/hotel-info',
      label: 'Manage Hotel Information',
      icon: Building2,
    },
    {
      path: '/admin/enquiries',
      label: 'Contact Enquiries',
      icon: MessageSquareText,
      badgeCount: unreadEnquiriesCount > 0 ? unreadEnquiriesCount : undefined,
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const activeItem =
    navItems.find((item) => item.path === currentRoute) ?? navItems[0];

  const handleSelectNav = (path: AdminSectionRoute) => {
    setMobileDrawerOpen(false);
    onNavigateAdmin(path);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0F172A] text-white">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            {hotelInfo.hotelLogoUrl ? (
              <img
                src={hotelInfo.hotelLogoUrl}
                alt={`${hotelInfo.hotelName} logo`}
                className="h-8 w-8 shrink-0 rounded-sm object-contain"
              />
            ) : (
              <HotelLogo className="h-8 w-8 shrink-0 text-[#C9A96E]" />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold tracking-[0.14em] uppercase text-white">
                {hotelInfo.hotelName}
              </p>
              <p className="text-[11px] text-[#C9A96E]">Owner Console</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Admin Navigation" className="space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.path === currentRoute;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleSelectNav(item.path)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#C9A96E]/15 text-[#E2CFA4] border border-[#C9A96E]/30'
                    : 'text-slate-300 border border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <IconComponent
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-[#C9A96E]' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badgeCount !== undefined && (
                  <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#C9A96E] px-1.5 py-0.5 text-[11px] font-semibold text-slate-950 tabular-nums">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Operator Profile & Logout */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="rounded-lg bg-white/5 px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Signed In As
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-white">
            {adminSession?.email || 'Hotel Owner'}
          </p>
        </div>

        <button
          type="button"
          onClick={logoutAdmin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open admin navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Admin Dashboard / {activeItem.label}
              </p>
              <h1 className="truncate text-base sm:text-lg font-semibold text-slate-900">
                {activeItem.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
              Demo Mode · Local Browser Storage
            </span>

            <button
              type="button"
              onClick={onViewPublicSite}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap transition-colors hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <span>View Public Website</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
