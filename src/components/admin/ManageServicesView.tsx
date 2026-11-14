import { useState } from 'react';
import {
  Bath,
  BedDouble,
  Car,
  Check,
  ConciergeBell,
  Droplets,
  Pencil,
  Plus,
  Shirt,
  Snowflake,
  Sparkles,
  Trash2,
  Tv,
  Upload,
  UserCheck,
  UtensilsCrossed,
  Wifi,
  X,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import { readImageFileAsDataUrl } from '@/src/services/hotelApiService';
import type { AdminServiceItem } from '@/src/types/hotel';
import type { ServiceIconKey } from '@/src/data/hotelSectionsData';
import { ConfirmActionModal } from '@/src/components/admin/ConfirmActionModal';

const ICON_OPTIONS: Array<{
  key: ServiceIconKey;
  label: string;
  Icon: typeof Wifi;
}> = [
  { key: 'ac', label: 'Air Conditioning', Icon: Snowflake },
  { key: 'wifi', label: 'Free Wi-Fi', Icon: Wifi },
  { key: 'tv', label: 'Smart TV', Icon: Tv },
  { key: 'bathroom', label: 'Bathroom', Icon: Bath },
  { key: 'water', label: 'Hot & Cold Water', Icon: Droplets },
  { key: 'room-service', label: 'Room Service', Icon: ConciergeBell },
  { key: 'restaurant', label: 'Restaurant & Dining', Icon: UtensilsCrossed },
  { key: 'housekeeping', label: 'Housekeeping', Icon: Sparkles },
  { key: 'bed', label: 'King-Size Beds', Icon: BedDouble },
  { key: 'parking', label: 'Parking', Icon: Car },
  { key: 'laundry', label: 'Laundry', Icon: Shirt },
  { key: 'reception', label: 'Reception', Icon: UserCheck },
];

export function ManageServicesView() {
  const { services, saveService, deleteService, toggleServiceEnabled } =
    useHotelStore();

  const [editor, setEditor] = useState<{
    draft: AdminServiceItem;
    isNew: boolean;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceItem | null>(
    null
  );
  const [toast, setToast] = useState('');

  const openEditor = (service?: AdminServiceItem) => {
    const draft: AdminServiceItem = service
      ? { ...service }
      : {
          id: `svc-${Date.now().toString(36)}`,
          title: '',
          description: '',
          iconKey: 'concierge' as unknown as ServiceIconKey,
          available: true,
          availabilityNote: '',
          customImageSrc: '',
        };
    if (
      !ICON_OPTIONS.some((opt) => opt.key === draft.iconKey)
    ) {
      draft.iconKey = 'room-service';
    }
    setEditor({ draft, isNew: !service });
  };

  const handleUploadIconImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editor) return;
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await readImageFileAsDataUrl(file);
    setEditor({
      ...editor,
      draft: { ...editor.draft, customImageSrc: dataUrl },
    });
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor || !editor.draft.title.trim()) return;
    const cleaned: AdminServiceItem = {
      ...editor.draft,
      title: editor.draft.title.trim(),
      description: editor.draft.description.trim(),
      availabilityNote: editor.draft.availabilityNote?.trim() || undefined,
      customImageSrc: editor.draft.customImageSrc?.trim() || undefined,
    };
    saveService(cleaned, editor.isNew);
    setToast(
      `${cleaned.title} ${
        editor.isNew ? 'added' : 'updated'
      } and synced to public Services section.`
    );
    setEditor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Hotel Services &amp; Facilities ({services.length})
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Enable or disable individual guest facilities, edit descriptions, or
            upload custom service imagery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 text-[#C9A96E]" />
          <span>Add Service</span>
        </button>
      </div>

      {toast && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-700" />
            {toast}
          </span>
          <button
            type="button"
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
            className="cursor-pointer text-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            No hotel services listed
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add facilities to show them on the public Services section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const matched =
              ICON_OPTIONS.find((opt) => opt.key === service.iconKey)?.Icon ||
              Sparkles;
            const IconComponent = matched;
            return (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  {service.customImageSrc ? (
                    <img
                      src={service.customImageSrc}
                      alt={service.title}
                      className="h-11 w-11 shrink-0 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#8A6D3B]">
                      <IconComponent className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {service.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          service.available
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {service.available ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {service.description}
                    </p>
                    {service.availabilityNote && (
                      <p className="mt-1.5 text-[11px] font-medium text-[#8A6D3B]">
                        {service.availabilityNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
                  <button
                    type="button"
                    onClick={() => toggleServiceEnabled(service.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      service.available
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {service.available ? 'Disable on Site' : 'Enable on Site'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditor(service)}
                      aria-label={`Edit ${service.title}`}
                      className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(service)}
                      aria-label={`Delete ${service.title}`}
                      className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {editor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setEditor(null)}
            className="absolute inset-0 bg-slate-950/60"
            aria-hidden="true"
          />
          <form
            onSubmit={handleSave}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">
                {editor.isNew ? 'Add Hotel Service' : `Edit ${editor.draft.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Service Title *
              </label>
              <input
                type="text"
                required
                value={editor.draft.title}
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    draft: { ...editor.draft, title: e.target.value },
                  })
                }
                placeholder="e.g. Airport Chauffeur"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                One-Line Description *
              </label>
              <textarea
                rows={2}
                required
                value={editor.draft.description}
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    draft: { ...editor.draft, description: e.target.value },
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Icon Style
                </label>
                <select
                  value={editor.draft.iconKey}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      draft: {
                        ...editor.draft,
                        iconKey: e.target.value as ServiceIconKey,
                      },
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Availability Note (optional)
                </label>
                <input
                  type="text"
                  value={editor.draft.availabilityNote || ''}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      draft: {
                        ...editor.draft,
                        availabilityNote: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Subject to availability"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Optional Custom Photo / Icon Image
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadIconImage}
                    className="sr-only"
                  />
                </label>
                {editor.draft.customImageSrc && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditor({
                        ...editor,
                        draft: { ...editor.draft, customImageSrc: undefined },
                      })
                    }
                    className="text-xs font-medium text-red-600 hover:underline cursor-pointer"
                  >
                    Remove Custom Image
                  </button>
                )}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={editor.draft.available}
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    draft: { ...editor.draft, available: e.target.checked },
                  })
                }
                className="h-4 w-4 accent-[#8A6D3B]"
              />
              <span>Show this service on the public website</span>
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0F172A] px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.title || 'Service'}"?`}
        description="This service will be permanently removed from the Services section."
        confirmLabel="Delete Service"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteService(deleteTarget.id);
            setToast(`Deleted "${deleteTarget.title}".`);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
