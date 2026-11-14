import { useMemo, useState } from 'react';
import {
  Check,
  Expand,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import { readImageFileAsDataUrl } from '@/src/services/hotelApiService';
import type {
  AdminGalleryCategory,
  AdminGalleryPhoto,
} from '@/src/types/hotel';
import { ConfirmActionModal } from '@/src/components/admin/ConfirmActionModal';

const ADMIN_GALLERY_CATEGORIES: AdminGalleryCategory[] = [
  'Rooms',
  'Bathrooms',
  'Reception',
  'Restaurant',
  'Facilities',
  'Exterior',
];

export function ManageGalleryView() {
  const {
    galleryPhotos,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
  } = useHotelStore();

  const [categoryFilter, setCategoryFilter] = useState<
    'All' | AdminGalleryCategory
  >('All');
  const [uploadCategory, setUploadCategory] =
    useState<AdminGalleryCategory>('Exterior');
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryPhoto | null>(
    null
  );
  const [newPhotoModalOpen, setNewPhotoModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] =
    useState<AdminGalleryCategory>('Rooms');
  const [newSrc, setNewSrc] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<AdminGalleryPhoto | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryPhoto | null>(
    null
  );
  const [toast, setToast] = useState('');

  const filteredPhotos = useMemo(() => {
    if (categoryFilter === 'All') return galleryPhotos;
    return galleryPhotos.filter((p) => p.category === categoryFilter);
  }, [galleryPhotos, categoryFilter]);

  const handleMultiFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    let addedCount = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await readImageFileAsDataUrl(file);
      const baseTitle =
        file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ') ||
        `${uploadCategory} Photograph`;
      addGalleryPhoto({
        category: uploadCategory,
        title: baseTitle,
        description: `Uploaded hotel photograph (${uploadCategory}).`,
        src: dataUrl,
        alt: `${baseTitle} — ${uploadCategory}`,
      });
      addedCount += 1;
    }

    if (addedCount > 0) {
      setToast(
        `${addedCount} photograph${
          addedCount === 1 ? '' : 's'
        } added to ${uploadCategory} and synced to public Gallery.`
      );
    }
    event.target.value = '';
  };

  const handleCreateByUrl = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim() || !newSrc.trim()) return;
    addGalleryPhoto({
      category: newCategory,
      title: newTitle.trim(),
      description:
        newDescription.trim() || `${newTitle.trim()} (${newCategory})`,
      src: newSrc.trim(),
      alt: newTitle.trim(),
    });
    setToast(`Added "${newTitle.trim()}" to the public gallery.`);
    setNewTitle('');
    setNewDescription('');
    setNewSrc('');
    setNewPhotoModalOpen(false);
  };

  const handleSaveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingPhoto || !editingPhoto.title.trim()) return;
    updateGalleryPhoto({
      ...editingPhoto,
      title: editingPhoto.title.trim(),
      description: editingPhoto.description.trim(),
      alt: editingPhoto.alt.trim() || editingPhoto.title.trim(),
    });
    setToast(`Updated "${editingPhoto.title.trim()}".`);
    setEditingPhoto(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Multi-Upload Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Hotel Photo Gallery ({galleryPhotos.length})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Upload multiple hotel photographs, assign categories, or edit
              captions. Changes sync immediately to the public Explore Our Hotel
              gallery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Category for multi-photo upload"
              value={uploadCategory}
              onChange={(e) =>
                setUploadCategory(e.target.value as AdminGalleryCategory)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#8A6D3B] focus:outline-none"
            >
              {ADMIN_GALLERY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Upload to: {cat}
                </option>
              ))}
            </select>

            <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              <Upload className="h-3.5 w-3.5 text-[#C9A96E]" />
              <span>Upload Multiple Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultiFileUpload}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={() => setNewPhotoModalOpen(true)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add by URL</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {(['All', ...ADMIN_GALLERY_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
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

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            No photographs in {categoryFilter}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Upload photos to this category using the uploader above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((photo) => (
            <article
              key={photo.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 rounded-md bg-slate-900/85 px-2.5 py-1 text-[11px] font-semibold text-[#E2CFA4]">
                  {photo.category}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(photo)}
                  aria-label={`Preview ${photo.title}`}
                  className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/85 cursor-pointer"
                >
                  <Expand className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {photo.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {photo.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto({ ...photo })}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(photo)}
                    aria-label={`Delete ${photo.title}`}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add Photo by URL Modal */}
      {newPhotoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setNewPhotoModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
            aria-hidden="true"
          />
          <form
            onSubmit={handleCreateByUrl}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">
                Add Gallery Photograph
              </h3>
              <button
                type="button"
                onClick={() => setNewPhotoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value as AdminGalleryCategory)
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              >
                {ADMIN_GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Photo Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Evening Stone Courtyard"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Image URL *
              </label>
              <input
                type="text"
                required
                value={newSrc}
                onChange={(e) => setNewSrc(e.target.value)}
                placeholder="https://... or /images/..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewPhotoModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0F172A] px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Add Photo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setEditingPhoto(null)}
            className="absolute inset-0 bg-slate-950/60"
            aria-hidden="true"
          />
          <form
            onSubmit={handleSaveEdit}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">
                Edit Gallery Photo
              </h3>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Category
              </label>
              <select
                value={editingPhoto.category}
                onChange={(e) =>
                  setEditingPhoto({
                    ...editingPhoto,
                    category: e.target.value as AdminGalleryCategory,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              >
                {ADMIN_GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Photo Title
              </label>
              <input
                type="text"
                required
                value={editingPhoto.title}
                onChange={(e) =>
                  setEditingPhoto({ ...editingPhoto, title: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={2}
                value={editingPhoto.description}
                onChange={(e) =>
                  setEditingPhoto({
                    ...editingPhoto,
                    description: e.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0F172A] px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Full Preview Lightbox */}
      {previewPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
        >
          <button
            type="button"
            onClick={() => setPreviewPhoto(null)}
            aria-label="Close preview"
            className="absolute top-5 right-5 rounded-full border border-white/25 p-2.5 text-white hover:border-[#C9A96E] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-4xl text-center">
            <img
              src={previewPhoto.src}
              alt={previewPhoto.alt}
              className="max-h-[75vh] w-auto mx-auto rounded-xl object-contain"
            />
            <p className="mt-3 text-sm font-semibold text-white">
              {previewPhoto.title} ({previewPhoto.category})
            </p>
            <p className="mt-1 text-xs text-white/70">
              {previewPhoto.description}
            </p>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.title || 'Photograph'}"?`}
        description="This photograph will be removed from the hotel gallery immediately."
        confirmLabel="Delete Photo"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteGalleryPhoto(deleteTarget.id);
            setToast(`Removed "${deleteTarget.title}".`);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
