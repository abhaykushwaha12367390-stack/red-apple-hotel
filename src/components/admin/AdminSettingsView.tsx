import { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import { ConfirmActionModal } from '@/src/components/admin/ConfirmActionModal';

export function AdminSettingsView() {
  const {
    adminSession,
    firebaseAdminEmail,
    hotelInfo,
    rooms,
    bookings,
    galleryPhotos,
    services,
    enquiries,
    notificationConfig,
    refreshNotifications,
    resetDemoStore,
    logoutAdmin,
  } = useHotelStore();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleExportSnapshot = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      hotelInfo,
      rooms,
      bookings,
      galleryPhotos,
      services,
      enquiries,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotel-admin-snapshot-${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback('Exported hotel catalog, bookings, and enquiry JSON snapshot.');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          System Settings &amp; Notification Configuration
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Monitor automatic WhatsApp and Formspree booking notification
          readiness, manage your active operator session, or export backups.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Owner Booking Notification Integration Readiness */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Automatic Booking Notifications
            </h3>
            <p className="text-xs text-slate-500">
              Triggered independently after each booking is saved to the
              database. Sensitive guest IDs are never included.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshNotifications()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Refresh Status
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <p className="font-semibold text-slate-900">
              1. WhatsApp Business Cloud API
            </p>
            <p className="text-slate-600 tabular-nums">
              Owner Target:{' '}
              <strong>{notificationConfig?.ownerWhatsapp || '+91 88601 51690'}</strong>
            </p>
            <p
              className={`font-semibold ${
                notificationConfig?.whatsapp.configured
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            >
              {notificationConfig?.whatsapp.configured
                ? 'Configured'
                : `Missing env: ${
                    notificationConfig?.whatsapp.missingEnvVars.join(', ') ||
                    'WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID'
                  }`}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <p className="font-semibold text-slate-900">
              2. Gmail Notification via Formspree
            </p>
            <p className="text-slate-600">
              Owner Target:{' '}
              <strong>
                {notificationConfig?.ownerEmail || 'yogeshjee1987@gmail.com'}
              </strong>
            </p>
            <p
              className={`font-semibold ${
                notificationConfig?.email.configured
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            >
              {notificationConfig?.email.configured
                ? 'Configured'
                : `Missing env: ${
                    notificationConfig?.email.missingEnvVars.join(', ') ||
                    'FORMSPREE_ENDPOINT'
                  }`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Session Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-5 w-5 text-[#8A6D3B]" />
            <h3 className="text-base font-semibold text-slate-900">
              Current Admin Session
            </h3>
          </div>

          <dl className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Authenticated Account</dt>
              <dd className="font-semibold text-slate-900">
                {firebaseAdminEmail || adminSession?.email || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-800">
                {adminSession?.role || 'Hotel Owner'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Session Storage</dt>
              <dd className="font-medium text-slate-800">
                {adminSession?.rememberMe
                  ? 'Persistent Browser Storage'
                  : 'Current Tab Session Only'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Authentication Mode</dt>
              <dd className="font-medium text-amber-700">
                Frontend Demonstration Mode (No Backend Server Connected)
              </dd>
            </div>
          </dl>

          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={logoutAdmin}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
            >
              Sign Out of Admin Console
            </button>
          </div>
        </div>

        {/* Data Controls & Part 6 Architecture */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Database className="h-5 w-5 text-[#8A6D3B]" />
            <h3 className="text-base font-semibold text-slate-900">
              Data Backup &amp; Demonstration Reset
            </h3>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            All admin mutations currently persist locally in browser storage via{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-800">
              hotelApiService
            </code>
            , structured for drop-in REST API integration in Part 6.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportSnapshot}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Demonstration Data</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={resetModalOpen}
        title="Reset Demonstration Data?"
        description="This restores initial rooms, services, gallery images, hotel settings, and sample bookings/enquiries. Any custom uploads or test submissions stored locally will be cleared."
        confirmLabel="Reset Data"
        destructive={false}
        onCancel={() => setResetModalOpen(false)}
        onConfirm={() => {
          resetDemoStore();
          setResetModalOpen(false);
          setFeedback('Restored default hotel and demonstration records.');
        }}
      />
    </div>
  );
}
