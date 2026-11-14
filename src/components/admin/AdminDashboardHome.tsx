import {
  ArrowRight,
  BedDouble,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  DoorClosed,
  Info,
  MessageSquareText,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import type { AdminSectionRoute } from '@/src/components/admin/AdminLayout';

interface AdminDashboardHomeProps {
  onNavigate: (path: AdminSectionRoute) => void;
}

export function AdminDashboardHome({ onNavigate }: AdminDashboardHomeProps) {
  const { rooms, bookings, enquiries, notificationConfig } = useHotelStore();

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(
    (room) => room.isActive && room.availabilityStatus === 'Available'
  ).length;
  const occupiedRooms = rooms.filter(
    (room) => room.availabilityStatus === 'Occupied'
  ).length;
  const maintenanceRooms = rooms.filter(
    (room) => room.availabilityStatus === 'Maintenance'
  ).length;

  const totalBookingRequests = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === 'Confirmed'
  ).length;
  const cancelledOrRejected = bookings.filter(
    (b) => b.status === 'Cancelled' || b.status === 'Rejected'
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === 'Completed'
  ).length;

  const totalEnquiries = enquiries.length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'Unread').length;

  const hasDemoItems =
    bookings.some((b) => b.isDemoData) || enquiries.some((e) => e.isDemoData);

  const kpiCards = [
    {
      label: 'Total Rooms',
      value: totalRooms,
      helper: `${rooms.filter((r) => r.isActive).length} published on website`,
      icon: BedDouble,
      accent: 'text-slate-700 bg-slate-100',
    },
    {
      label: 'Available Rooms',
      value: availableRooms,
      helper: 'Ready for reservations',
      icon: CheckCircle2,
      accent: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Occupied Rooms',
      value: occupiedRooms,
      helper: `${maintenanceRooms} in maintenance`,
      icon: DoorClosed,
      accent: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'Total Booking Requests',
      value: totalBookingRequests,
      helper: 'Live & demonstration entries',
      icon: CalendarCheck2,
      accent: 'text-slate-700 bg-slate-100',
    },
    {
      label: 'Pending Bookings',
      value: pendingBookings,
      helper: 'Awaiting owner approval',
      icon: Clock,
      accent: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'Confirmed Bookings',
      value: confirmedBookings,
      helper: `${completedBookings} completed stays`,
      icon: CheckCircle2,
      accent: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Total Enquiries',
      value: totalEnquiries,
      helper: `${unreadEnquiries} unread messages`,
      icon: MessageSquareText,
      accent: 'text-blue-700 bg-blue-50',
    },
  ];

  const recentBookings = bookings.slice(0, 5);
  const recentEnquiries = enquiries.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Owner Notification Channels Readiness */}
      {notificationConfig && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className={`rounded-xl border px-5 py-4 text-xs ${
              notificationConfig.whatsapp.configured
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            <p className="font-semibold">
              Owner WhatsApp Alert ({notificationConfig.ownerWhatsapp})
            </p>
            <p className="mt-1">
              {notificationConfig.whatsapp.configured
                ? `WhatsApp Business Cloud API ready (${notificationConfig.whatsapp.templateMode}).`
                : `Configuration needed in server env: ${notificationConfig.whatsapp.missingEnvVars.join(
                    ', '
                  )}`}
            </p>
          </div>

          <div
            className={`rounded-xl border px-5 py-4 text-xs ${
              notificationConfig.email.configured
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            <p className="font-semibold">
              Owner Gmail via Formspree ({notificationConfig.ownerEmail})
            </p>
            <p className="mt-1">
              {notificationConfig.email.configured
                ? 'Formspree email endpoint configured for automatic booking alerts.'
                : `Configuration needed in server env: ${notificationConfig.email.missingEnvVars.join(
                    ', '
                  )}`}
            </p>
          </div>
        </div>
      )}

      {/* Transparent Demonstration Data Notice */}
      {hasDemoItems && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              <strong className="font-semibold">
                Demonstration Data Notice:
              </strong>{' '}
              Items marked <span className="font-semibold">[Demo]</span> are
              initial sample entries for previewing workflows without a live
              database. New bookings and enquiries submitted from the public
              website appear here immediately.
            </p>
          </div>
        </div>
      )}

      {/* 7 Required KPI Statistics Cards */}
      <section aria-label="Hotel Key Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {card.label}
                  </p>
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.accent}`}
                  >
                    <IconComponent className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900 tabular-nums">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Overviews: Room Availability & Booking Status */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Room Availability Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Room Availability Overview
              </h2>
              <p className="text-xs text-slate-500">
                Live inventory and publication status across room categories
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/rooms')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A6D3B] hover:underline cursor-pointer"
            >
              <span>Manage Rooms</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-3.5">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {room.name}
                    {!room.isActive && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        (Hidden on Site)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {room.currencySymbol}
                    {room.pricePerNight}/night · {room.totalUnits} unit
                    {room.totalUnits > 1 ? 's' : ''}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                    room.availabilityStatus === 'Available'
                      ? 'bg-emerald-50 text-emerald-700'
                      : room.availabilityStatus === 'Occupied'
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      room.availabilityStatus === 'Available'
                        ? 'bg-emerald-600'
                        : room.availabilityStatus === 'Occupied'
                        ? 'bg-amber-600'
                        : 'bg-red-600'
                    }`}
                  />
                  {room.availabilityStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Booking Status Overview
              </h2>
              <p className="text-xs text-slate-500">
                Breakdown of all reservation requests by stage
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/bookings')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A6D3B] hover:underline cursor-pointer"
            >
              <span>All Bookings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {[
              {
                label: 'Pending Approval',
                count: pendingBookings,
                barClass: 'bg-amber-500',
              },
              {
                label: 'Confirmed Stays',
                count: confirmedBookings,
                barClass: 'bg-emerald-600',
              },
              {
                label: 'Completed Stays',
                count: completedBookings,
                barClass: 'bg-slate-700',
              },
              {
                label: 'Rejected / Cancelled',
                count: cancelledOrRejected,
                barClass: 'bg-red-500',
              },
            ].map((row) => {
              const pct =
                totalBookingRequests > 0
                  ? Math.round((row.count / totalBookingRequests) * 100)
                  : 0;
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {row.label}
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${row.barClass} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Booking Requests & Recent Enquiries */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Booking Requests */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Booking Requests
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('/admin/bookings')}
              className="text-xs font-semibold text-[#8A6D3B] hover:underline cursor-pointer"
            >
              Open Bookings
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No booking requests recorded yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">Guest</th>
                    <th className="py-2.5 pr-4 font-medium">Room</th>
                    <th className="py-2.5 pr-4 font-medium">Dates</th>
                    <th className="py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/70">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">
                          {booking.guestName}{' '}
                          {booking.isDemoData && (
                            <span className="text-[10px] font-semibold text-amber-700">
                              [Demo]
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {booking.mobileNumber}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {booking.roomName}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 tabular-nums whitespace-nowrap">
                        {booking.checkIn} → {booking.checkOut}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            booking.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : booking.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800'
                              : booking.status === 'Completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Enquiries */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Enquiries
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('/admin/enquiries')}
              className="text-xs font-semibold text-[#8A6D3B] hover:underline cursor-pointer"
            >
              View Inbox
            </button>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No contact enquiries received yet.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="py-3 first:pt-1 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {enquiry.customerName}{' '}
                      {enquiry.isDemoData && (
                        <span className="text-[10px] font-semibold text-amber-700">
                          [Demo]
                        </span>
                      )}
                    </p>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        enquiry.status === 'Unread'
                          ? 'bg-blue-50 text-blue-700'
                          : enquiry.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {enquiry.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                    {enquiry.subject}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {enquiry.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
