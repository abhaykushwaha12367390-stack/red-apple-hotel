import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import type {
  BookingRecord,
  BookingStatus,
  NotificationChannelStatus,
} from '@/src/types/hotel';

const BOOKING_STATUS_OPTIONS: Array<'All' | BookingStatus> = [
  'All',
  'Pending',
  'Confirmed',
  'Completed',
  'Rejected',
  'Cancelled',
];

function formatChannelBadge(status?: NotificationChannelStatus) {
  switch (status) {
    case 'sent':
      return {
        label: 'Sent',
        cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'failed':
      return {
        label: 'Failed',
        cls: 'bg-red-50 text-red-700 border-red-200',
      };
    case 'not_configured':
      return {
        label: 'Not Configured',
        cls: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'pending':
      return {
        label: 'Pending',
        cls: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    default:
      return {
        label: 'Demo Entry',
        cls: 'bg-slate-100 text-slate-600 border-slate-200',
      };
  }
}

export function ManageBookingsView() {
  const {
    bookings,
    hotelInfo,
    notificationLogs,
    notificationConfig,
    updateBookingStatus,
    retryBookingNotifications,
  } = useHotelStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>(
    'All'
  );
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    null
  );
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  const logsByBookingId = useMemo(() => {
    const map = new Map<string, (typeof notificationLogs)[number]>();
    for (const item of notificationLogs) {
      map.set(item.bookingId, item);
    }
    return map;
  }, [notificationLogs]);

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (statusFilter !== 'All' && booking.status !== statusFilter) {
        return false;
      }
      if (dateFilter && booking.checkIn !== dateFilter) {
        return false;
      }
      if (!query) return true;
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.guestName.toLowerCase().includes(query) ||
        booking.mobileNumber.toLowerCase().includes(query) ||
        booking.roomName.toLowerCase().includes(query)
      );
    });
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const handleStatusChange = (
    booking: BookingRecord,
    nextStatus: BookingStatus
  ) => {
    const result = updateBookingStatus(booking.id, nextStatus);
    if (!result.ok) {
      setActionFeedback({
        type: 'error',
        text:
          result.reason ||
          'Unable to update booking status due to an availability conflict.',
      });
      return;
    }

    setActionFeedback({
      type: 'success',
      text: `Booking ${booking.id} (${booking.guestName}) marked as ${nextStatus}.`,
    });

    if (selectedBooking && selectedBooking.id === booking.id) {
      setSelectedBooking({ ...selectedBooking, status: nextStatus });
    }
  };

  const handleRetryNotifications = async (booking: BookingRecord) => {
    setRetryingId(booking.id);
    try {
      const log = await retryBookingNotifications(booking.id);
      if (!log) {
        setActionFeedback({
          type: 'error',
          text: `Could not reach notification service while retrying ${booking.id}.`,
        });
        return;
      }

      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking({
          ...selectedBooking,
          whatsappNotificationStatus: log.whatsapp.status,
          emailNotificationStatus: log.email.status,
        });
      }

      setActionFeedback({
        type:
          log.whatsapp.status === 'failed' || log.email.status === 'failed'
            ? 'error'
            : 'success',
        text: `Notification check for ${booking.id}: WhatsApp (${log.whatsapp.status}) · Email (${log.email.status}).`,
      });
    } finally {
      setRetryingId(null);
    }
  };

  const getWhatsAppGuestHref = (booking: BookingRecord) => {
    const digits = booking.mobileNumber.replace(/[^\d]/g, '');
    const msg = encodeURIComponent(
      `Hello ${booking.guestName}, regarding your reservation (${booking.id}) at ${hotelInfo.hotelName} for ${booking.roomName} (${booking.checkIn} to ${booking.checkOut})...`
    );
    return `https://wa.me/${digits}?text=${msg}`;
  };

  const selectedLog = selectedBooking
    ? logsByBookingId.get(selectedBooking.id)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Configuration Readiness Summary Bar */}
      {notificationConfig &&
        (!notificationConfig.whatsapp.configured ||
          !notificationConfig.email.configured) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="space-y-1">
                <p className="font-semibold">
                  Owner Notification Credentials Partially Configured
                </p>
                <p className="leading-relaxed text-amber-900">
                  Bookings always save cleanly first. Missing server environment
                  variables:{' '}
                  {[
                    ...notificationConfig.email.missingEnvVars,
                    ...notificationConfig.whatsapp.missingEnvVars,
                  ].join(', ')}
                  . Delivery will report{' '}
                  <span className="font-semibold">Not Configured</span> until
                  these environment variables are supplied in server secrets.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Filters & Search Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Booking Requests &amp; Reservations
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Review guest requests, monitor owner WhatsApp &amp; Formspree
              email notification logs, and prevent overlapping double-bookings.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 tabular-nums">
            Showing {filteredBookings.length} of {bookings.length} record
            {bookings.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Booking ID, Guest Name, Phone, or Room..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3.5 pl-10 text-sm focus:border-[#8A6D3B] focus:outline-none"
            />
          </div>

          <div className="md:col-span-4 flex flex-wrap items-center gap-1.5">
            {BOOKING_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <input
              type="date"
              aria-label="Filter by check-in date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs tabular-nums focus:border-[#8A6D3B] focus:outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {actionFeedback && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-xs font-medium ${
            actionFeedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <span className="flex items-center gap-2">
            {actionFeedback.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            )}
            <span>{actionFeedback.text}</span>
          </span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            aria-label="Dismiss message"
            className="cursor-pointer opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-slate-900">
              No matching booking requests
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing your search or status filter, or submit a test
              reservation from the public website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5 font-semibold">Booking ID</th>
                  <th className="px-4 py-3.5 font-semibold">Guest Name</th>
                  <th className="px-4 py-3.5 font-semibold">Mobile Number</th>
                  <th className="px-4 py-3.5 font-semibold">Room Name</th>
                  <th className="px-4 py-3.5 font-semibold">Check-in</th>
                  <th className="px-4 py-3.5 font-semibold">Check-out</th>
                  <th className="px-4 py-3.5 font-semibold">Guests / Est.</th>
                  <th className="px-4 py-3.5 font-semibold">Booking Date</th>
                  <th className="px-4 py-3.5 font-semibold">Owner Alerts</th>
                  <th className="px-4 py-3.5 font-semibold">Booking Status</th>
                  <th className="px-4 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => {
                  const serverLog = logsByBookingId.get(booking.id);
                  const waStatus =
                    serverLog?.whatsapp.status ??
                    booking.whatsappNotificationStatus;
                  const emailStatus =
                    serverLog?.email.status ?? booking.emailNotificationStatus;
                  const waBadge = formatChannelBadge(waStatus);
                  const emailBadge = formatChannelBadge(emailStatus);
                  const canRetry =
                    !booking.isDemoData &&
                    (waStatus !== 'sent' || emailStatus !== 'sent');

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {booking.id}
                        {booking.isDemoData && (
                          <span className="ml-1.5 text-[10px] font-semibold text-amber-700">
                            [Demo]
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                        {booking.guestName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 tabular-nums whitespace-nowrap">
                        {booking.mobileNumber}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 whitespace-nowrap">
                        {booking.roomName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 tabular-nums whitespace-nowrap">
                        {booking.checkIn}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 tabular-nums whitespace-nowrap">
                        {booking.checkOut}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 tabular-nums whitespace-nowrap">
                        <span>
                          {booking.guestsCount} ({booking.adults}A
                          {booking.children > 0 ? `+${booking.children}C` : ''})
                        </span>
                        <span className="block text-[11px] font-semibold text-slate-900">
                          {booking.currencySymbol || '$'}
                          {(booking.estimatedAmount || 0).toLocaleString('en-US')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums whitespace-nowrap">
                        {booking.bookingDate}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {booking.isDemoData ? (
                          <span className="text-[11px] text-slate-400">
                            Sample entry
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${waBadge.cls}`}
                            >
                              WA: {waBadge.label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${emailBadge.cls}`}
                            >
                              Email: {emailBadge.label}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          aria-label={`Change status for ${booking.id}`}
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusChange(
                              booking,
                              e.target.value as BookingStatus
                            )
                          }
                          className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold focus:outline-none ${
                            booking.status === 'Confirmed'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : booking.status === 'Pending'
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : booking.status === 'Completed'
                              ? 'border-slate-200 bg-slate-100 text-slate-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            title="View booking details"
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </button>

                          {canRetry && (
                            <button
                              type="button"
                              disabled={retryingId === booking.id}
                              onClick={() => handleRetryNotifications(booking)}
                              title="Retry failed or unconfigured notifications"
                              className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 cursor-pointer"
                            >
                              <RefreshCw
                                className={`h-3 w-3 ${
                                  retryingId === booking.id ? 'animate-spin' : ''
                                }`}
                              />
                              <span>Retry Alert</span>
                            </button>
                          )}

                          {booking.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(booking, 'Confirmed')
                                }
                                title="Confirm booking"
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Confirm</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(booking, 'Rejected')
                                }
                                title="Reject booking"
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal (Sensitive Guest ID Stays Masked + Notification Delivery Log) */}
      {selectedBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setSelectedBooking(null)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6D3B] tabular-nums">
                  {selectedBooking.id} · {selectedBooking.status}
                </p>
                <h3
                  id="booking-detail-title"
                  className="mt-1 text-xl font-semibold text-slate-900"
                >
                  {selectedBooking.guestName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Room Category</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {selectedBooking.roomName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Stay Dates &amp; Estimate</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">
                  {selectedBooking.checkIn} → {selectedBooking.checkOut} ·{' '}
                  {selectedBooking.currencySymbol || '$'}
                  {(selectedBooking.estimatedAmount || 0).toLocaleString(
                    'en-US'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Guest Count</dt>
                <dd className="mt-0.5 font-medium text-slate-800 tabular-nums">
                  {selectedBooking.adults} Adults, {selectedBooking.children}{' '}
                  Children
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Arrival Window</dt>
                <dd className="mt-0.5 font-medium text-slate-800">
                  {selectedBooking.arrivalWindow || 'Standard'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Mobile Number</dt>
                <dd className="mt-0.5 font-medium text-slate-900 tabular-nums">
                  {selectedBooking.mobileNumber}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Email Address</dt>
                <dd className="mt-0.5 font-medium text-slate-900 break-all">
                  {selectedBooking.emailAddress || 'Not provided'}
                </dd>
              </div>
            </dl>

            {/* Automatic Notification Delivery Log */}
            {!selectedBooking.isDemoData && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Bell className="h-4 w-4 text-[#8A6D3B]" />
                    <span>Owner Notification Status</span>
                  </p>
                  {(selectedLog?.whatsapp.status !== 'sent' ||
                    selectedLog?.email.status !== 'sent') && (
                    <button
                      type="button"
                      disabled={retryingId === selectedBooking.id}
                      onClick={() => handleRetryNotifications(selectedBooking)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${
                          retryingId === selectedBooking.id
                            ? 'animate-spin'
                            : ''
                        }`}
                      />
                      <span>Retry Unsent</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-800">
                      WhatsApp ({selectedLog?.whatsapp.recipient || '+91 88601 51690'})
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      Status:{' '}
                      <strong className="uppercase">
                        {selectedLog?.whatsapp.status ||
                          selectedBooking.whatsappNotificationStatus ||
                          'pending'}
                      </strong>
                    </p>
                    {selectedLog?.whatsapp.errorMessage && (
                      <p className="mt-1 text-[11px] text-amber-800">
                        {selectedLog.whatsapp.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-800">
                      Formspree ({selectedLog?.email.recipient || 'kmalkushwaha353@gmail.com'})
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      Status:{' '}
                      <strong className="uppercase">
                        {selectedLog?.email.status ||
                          selectedBooking.emailNotificationStatus ||
                          'pending'}
                      </strong>
                    </p>
                    {selectedLog?.email.errorMessage && (
                      <p className="mt-1 text-[11px] text-amber-800">
                        {selectedLog.email.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-[#8A6D3B]" />
                <span>Private Guest Identification (Masked &amp; Excluded from Alerts)</span>
              </p>
              <p className="mt-1 text-slate-600">
                {selectedBooking.idDocumentType || 'Verify at check-in'} —{' '}
                {selectedBooking.idDocumentMasked || 'Pending front-desk check'}
                {selectedBooking.hasPrivateIdAttachment
                  ? ' · Private file selected at submission'
                  : ''}
              </p>
            </div>

            {selectedBooking.specialRequests && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs">
                <p className="font-semibold text-slate-700">Special Requests</p>
                <p className="mt-1 leading-relaxed text-slate-600">
                  {selectedBooking.specialRequests}
                </p>
              </div>
            )}

            {/* Contact Guest & Status Quick Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${selectedBooking.mobileNumber.replace(
                    /[^\d+]/g,
                    ''
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={getWhatsAppGuestHref(selectedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
                {selectedBooking.emailAddress && (
                  <a
                    href={`mailto:${selectedBooking.emailAddress}?subject=${encodeURIComponent(
                      `Reservation ${selectedBooking.id} — ${hotelInfo.hotelName}`
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking, 'Confirmed')}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking, 'Cancelled')}
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
