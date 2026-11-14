import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import type { EnquiryRecord, EnquiryStatus } from '@/src/types/hotel';
import { ConfirmActionModal } from '@/src/components/admin/ConfirmActionModal';

export function ContactEnquiriesView() {
  const { enquiries, hotelInfo, updateEnquiryStatus, deleteEnquiry } =
    useHotelStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | EnquiryStatus>(
    'All'
  );
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<EnquiryRecord | null>(null);

  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enquiries.filter((item) => {
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.customerName.toLowerCase().includes(q) ||
        item.phoneNumber.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [enquiries, searchQuery, statusFilter]);

  const handleOpenEnquiry = (item: EnquiryRecord) => {
    if (item.status === 'Unread') {
      updateEnquiryStatus(item.id, 'Read');
      setSelectedEnquiry({ ...item, status: 'Read' });
    } else {
      setSelectedEnquiry(item);
    }
  };

  const handleStatusChange = (item: EnquiryRecord, status: EnquiryStatus) => {
    updateEnquiryStatus(item.id, status);
    if (selectedEnquiry && selectedEnquiry.id === item.id) {
      setSelectedEnquiry({ ...selectedEnquiry, status });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Contact Enquiries Inbox ({enquiries.length})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Enquiries submitted via Contact Us and Room Enquiry modals appear
              here. Mark messages Read or Resolved after assisting guests.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 tabular-nums">
            Showing {filteredEnquiries.length} of {enquiries.length}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, email, or subject..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3.5 pl-10 text-sm focus:border-[#8A6D3B] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Unread', 'Read', 'Resolved'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-slate-900">
              No enquiries match your filter
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Clear filters or wait for new guest enquiries from the public
              website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5 font-semibold">Customer Name</th>
                  <th className="px-4 py-3.5 font-semibold">Phone / Email</th>
                  <th className="px-4 py-3.5 font-semibold">Subject</th>
                  <th className="px-4 py-3.5 font-semibold">Message</th>
                  <th className="px-4 py-3.5 font-semibold">Enquiry Date</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {item.customerName}
                      {item.isDemoData && (
                        <span className="ml-1.5 text-[10px] font-semibold text-amber-700">
                          [Demo]
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <p className="tabular-nums">{item.phoneNumber}</p>
                      <p className="text-[11px] text-slate-500 break-all">
                        {item.email}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {item.subject}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="line-clamp-2 text-slate-600">
                        {item.message}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums whitespace-nowrap">
                      {item.enquiryDate}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                          item.status === 'Unread'
                            ? 'bg-blue-50 text-blue-700'
                            : item.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEnquiry(item)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                        {item.status !== 'Resolved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item, 'Resolved')}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Resolve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Delete enquiry from ${item.customerName}`}
                          className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setSelectedEnquiry(null)}
            className="absolute inset-0 bg-slate-950/60"
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6D3B] tabular-nums">
                  {selectedEnquiry.id} · {selectedEnquiry.enquiryDate}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedEnquiry.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Customer Name</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {selectedEnquiry.customerName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="mt-0.5 font-medium text-slate-900 tabular-nums">
                  {selectedEnquiry.phoneNumber}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-0.5 font-medium text-slate-900 break-all">
                  {selectedEnquiry.email}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
              {selectedEnquiry.message}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                {selectedEnquiry.phoneNumber !== 'Not provided' && (
                  <>
                    <a
                      href={`tel:${selectedEnquiry.phoneNumber.replace(
                        /[^\d+]/g,
                        ''
                      )}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://wa.me/${selectedEnquiry.phoneNumber.replace(
                        /[^\d]/g,
                        ''
                      )}?text=${encodeURIComponent(
                        `Hello ${selectedEnquiry.customerName}, thank you for contacting ${hotelInfo.hotelName}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </>
                )}
                {selectedEnquiry.email !== 'Not provided' && (
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(
                      `Re: ${selectedEnquiry.subject} — ${hotelInfo.hotelName}`
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Reply Email</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedEnquiry, 'Read')}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Mark Read
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedEnquiry, 'Resolved')
                  }
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete enquiry from "${
          deleteTarget?.customerName || 'Guest'
        }"?`}
        description="This enquiry will be permanently deleted from the admin inbox."
        confirmLabel="Delete Enquiry"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteEnquiry(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
