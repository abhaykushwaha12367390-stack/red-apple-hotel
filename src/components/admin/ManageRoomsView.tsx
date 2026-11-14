import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import { readImageFileAsDataUrl } from '@/src/services/hotelApiService';
import type {
  AdminRoomCategory,
  RoomAvailabilityStatus,
} from '@/src/types/hotel';
import type { RoomPhoto } from '@/src/data/roomsData';
import { ConfirmActionModal } from '@/src/components/admin/ConfirmActionModal';

function createEmptyRoomDraft(): AdminRoomCategory {
  return {
    id: `room-${Date.now().toString(36)}`,
    name: '',
    categoryLabel: 'Luxury Room',
    shortDescription: '',
    fullDescription: '',
    pricePerNight: 220,
    currencySymbol: '$',
    roomSize: '340 sq ft',
    bedType: '1 King-Size Bed',
    maxGuests: '2 Adults',
    bathroomInfo: 'En-suite marble bathroom with rain shower & 24/7 hot water',
    acAvailability: 'Individual Silent Climate Control AC',
    smartTv: '55-inch 4K Smart LED TV',
    wifi: 'Complimentary High-Speed Wi-Fi',
    roomService: '24/7 In-Room Dining & Housekeeping',
    cardFacilities: ['King Bed', 'AC', 'Free Wi-Fi', 'Smart TV'],
    otherFacilities: [
      '24/7 Room Service',
      'Daily Housekeeping',
      'Hot & Cold Water',
      'In-Room Safe',
    ],
    amenities: [
      'Luxury Cotton Linen',
      'Bathrobe & Slippers',
      'Artisan Bath Toiletries',
      'Espresso & Tea Kettle',
    ],
    photos: [],
    isActive: true,
    availabilityStatus: 'Available',
    totalUnits: 3,
  };
}

export function ManageRoomsView() {
  const {
    rooms,
    saveRoom,
    deleteRoom,
    toggleRoomActive,
    setRoomAvailability,
  } = useHotelStore();

  const [editorState, setEditorState] = useState<{
    draft: AdminRoomCategory;
    isNew: boolean;
  } | null>(null);
  const [formError, setFormError] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [cardFacilitiesText, setCardFacilitiesText] = useState('');
  const [otherFacilitiesText, setOtherFacilitiesText] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminRoomCategory | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState('');

  const openEditor = (room?: AdminRoomCategory) => {
    const draft = room
      ? {
          ...room,
          photos: [...room.photos],
          cardFacilities: [...room.cardFacilities],
          otherFacilities: [...room.otherFacilities],
          amenities: [...room.amenities],
        }
      : createEmptyRoomDraft();
    setCardFacilitiesText(draft.cardFacilities.join(', '));
    setOtherFacilitiesText(draft.otherFacilities.join(', '));
    setAmenitiesText(draft.amenities.join(', '));
    setFormError('');
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setEditorState({ draft, isNew: !room });
  };

  const handlePhotoFilesUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editorState) return;
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const uploadedPhotos: RoomPhoto[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await readImageFileAsDataUrl(file);
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      uploadedPhotos.push({
        src: dataUrl,
        alt: `${editorState.draft.name || 'Hotel Room'} — ${baseName}`,
        caption: baseName,
      });
    }

    setEditorState((prev) =>
      prev
        ? {
            ...prev,
            draft: {
              ...prev.draft,
              photos: [...prev.draft.photos, ...uploadedPhotos],
            },
          }
        : null
    );
    event.target.value = '';
  };

  const handleAddPhotoUrl = () => {
    if (!editorState || !newPhotoUrl.trim()) return;
    const caption =
      newPhotoCaption.trim() ||
      `${editorState.draft.name || 'Room'} Photograph`;
    setEditorState((prev) =>
      prev
        ? {
            ...prev,
            draft: {
              ...prev.draft,
              photos: [
                ...prev.draft.photos,
                {
                  src: newPhotoUrl.trim(),
                  alt: caption,
                  caption,
                },
              ],
            },
          }
        : null
    );
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleSetCoverPhoto = (index: number) => {
    if (!editorState || index === 0) return;
    const nextPhotos = [...editorState.draft.photos];
    const [picked] = nextPhotos.splice(index, 1);
    nextPhotos.unshift(picked);
    setEditorState({
      ...editorState,
      draft: { ...editorState.draft, photos: nextPhotos },
    });
  };

  const handleMovePhoto = (index: number, direction: -1 | 1) => {
    if (!editorState) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= editorState.draft.photos.length) {
      return;
    }
    const nextPhotos = [...editorState.draft.photos];
    const temp = nextPhotos[index];
    nextPhotos[index] = nextPhotos[targetIndex];
    nextPhotos[targetIndex] = temp;
    setEditorState({
      ...editorState,
      draft: { ...editorState.draft, photos: nextPhotos },
    });
  };

  const handleDeletePhoto = (index: number) => {
    if (!editorState) return;
    const nextPhotos = editorState.draft.photos.filter((_, i) => i !== index);
    setEditorState({
      ...editorState,
      draft: { ...editorState.draft, photos: nextPhotos },
    });
  };

  const parseCommaList = (raw: string) =>
    raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSaveRoom = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editorState) return;

    const draft = editorState.draft;
    if (draft.name.trim().length < 2) {
      setFormError('Room name is required.');
      return;
    }
    if (draft.shortDescription.trim().length < 8) {
      setFormError('Please enter a brief short description.');
      return;
    }
    if (Number(draft.pricePerNight) <= 0 || Number.isNaN(draft.pricePerNight)) {
      setFormError('Price per night must be greater than zero.');
      return;
    }
    if (draft.photos.length === 0) {
      setFormError('Please add or upload at least one room photograph.');
      return;
    }

    const prepared: AdminRoomCategory = {
      ...draft,
      name: draft.name.trim(),
      categoryLabel: draft.categoryLabel.trim() || 'Hotel Room',
      shortDescription: draft.shortDescription.trim(),
      fullDescription:
        draft.fullDescription.trim() || draft.shortDescription.trim(),
      pricePerNight: Number(draft.pricePerNight),
      totalUnits: Math.max(1, Number(draft.totalUnits) || 1),
      cardFacilities: parseCommaList(cardFacilitiesText),
      otherFacilities: parseCommaList(otherFacilitiesText),
      amenities: parseCommaList(amenitiesText),
    };

    const result = saveRoom(prepared, editorState.isNew);
    if (!result.ok) {
      setFormError(result.error || 'Could not save room.');
      return;
    }

    setToastMessage(
      `${prepared.name} ${
        editorState.isNew ? 'added to catalog' : 'updated'
      } and synced with public website.`
    );
    setEditorState(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Room Categories &amp; Inventory
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Changes to room details, pricing, photos, or active status update the
            public Our Rooms section immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 text-[#C9A96E]" aria-hidden="true" />
          <span>Add New Room</span>
        </button>
      </div>

      {toastMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900"
        >
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-700" />
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            aria-label="Dismiss notification"
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Room Cards Table / Grid */}
      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            No rooms configured
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add your first room category to display rooms on the public hotel
            website.
          </p>
          <button
            type="button"
            onClick={() => openEditor()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#C9A96E]" />
            <span>Add First Room</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const cover = room.photos[0];
            return (
              <article
                key={room.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
              >
                <div className="relative aspect-[16/10] bg-slate-100">
                  {cover ? (
                    <img
                      src={cover.src}
                      alt={cover.alt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No cover image
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold shadow-xs ${
                        room.isActive
                          ? 'bg-slate-900/85 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {room.isActive ? 'Active on Site' : 'Hidden'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-xs tabular-nums">
                      {room.photos.length} photo
                      {room.photos.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A6D3B]">
                        {room.categoryLabel}
                      </p>
                      <h3 className="mt-0.5 text-base font-semibold text-slate-900">
                        {room.name}
                      </h3>
                    </div>
                    <p className="text-right text-base font-semibold text-slate-900 tabular-nums shrink-0">
                      {room.currencySymbol}
                      {room.pricePerNight}
                      <span className="block text-[11px] font-normal text-slate-500">
                        per night
                      </span>
                    </p>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {room.shortDescription}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
                    <span>Size: {room.roomSize}</span>
                    <span>Bed: {room.bedType}</span>
                    <span>Occupancy: {room.maxGuests}</span>
                    <span className="tabular-nums">
                      Units: {room.totalUnits}
                    </span>
                  </div>

                  {/* Quick Availability & Visibility Controls */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <select
                      aria-label={`Availability status for ${room.name}`}
                      value={room.availabilityStatus}
                      onChange={(e) =>
                        setRoomAvailability(
                          room.id,
                          e.target.value as RoomAvailabilityStatus
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-[#8A6D3B] focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => toggleRoomActive(room.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                        room.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {room.isActive ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditor(room)}
                      className="flex flex-1 min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit Room</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(room)}
                      aria-label={`Delete ${room.name}`}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Room Editor Modal */}
      {editorState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={() => setEditorState(null)}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A6D3B]">
                  {editorState.isNew ? 'Create Room Category' : 'Update Room'}
                </p>
                <h3
                  id="room-editor-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editorState.isNew
                    ? 'Add New Room'
                    : `Edit ${editorState.draft.name}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditorState(null)}
                aria-label="Close room editor"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveRoom}
              noValidate
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
            >
              {/* Core Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editorState.draft.name}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: { ...editorState.draft, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Presidential Penthouse Suite"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Category Tagline
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.categoryLabel}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          categoryLabel: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Signature Suite"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.currencySymbol}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          currencySymbol: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Price Per Night *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editorState.draft.pricePerNight}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          pricePerNight: Number(e.target.value),
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm tabular-nums focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Room Size
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.roomSize}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          roomSize: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. 420 sq ft"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Room Units (Capacity)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editorState.draft.totalUnits}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          totalUnits: Number(e.target.value),
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm tabular-nums focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Bed Type
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.bedType}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          bedType: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Max Occupancy
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.maxGuests}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          maxGuests: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Availability Status
                  </label>
                  <select
                    value={editorState.draft.availabilityStatus}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          availabilityStatus: e.target
                            .value as RoomAvailabilityStatus,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Short Card Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={editorState.draft.shortDescription}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          shortDescription: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Full Room Description
                  </label>
                  <textarea
                    rows={3}
                    value={editorState.draft.fullDescription}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          fullDescription: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Technical Comforts: AC, Wi-Fi, TV, Bathroom, Water/Room Service */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Air Conditioning Details
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.acAvailability}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          acAvailability: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Wi-Fi Availability
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.wifi}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: { ...editorState.draft, wifi: e.target.value },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    TV Details
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.smartTv}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          smartTv: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Bathroom &amp; Hot Water Details
                  </label>
                  <input
                    type="text"
                    value={editorState.draft.bathroomInfo}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          bathroomInfo: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Facilities & Amenities (Comma-separated) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Card Highlight Badges (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={cardFacilitiesText}
                    onChange={(e) => setCardFacilitiesText(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Additional Facilities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={otherFacilitiesText}
                    onChange={(e) => setOtherFacilitiesText(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    In-Room Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={amenitiesText}
                    onChange={(e) => setAmenitiesText(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Room Photographs Manager */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Room Photographs ({editorState.draft.photos.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Upload multiple photos, set the main cover image (first
                      slide), reorder, or remove images.
                    </p>
                  </div>

                  <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shrink-0">
                    <Upload className="h-3.5 w-3.5 text-[#C9A96E]" />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoFilesUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Add by URL helper */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Or paste image URL (/images/... or https://...)"
                    className="sm:col-span-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#8A6D3B] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Caption (e.g. Bathroom)"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#8A6D3B] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span>Add URL</span>
                  </button>
                </div>

                {/* Photo Previews Grid */}
                {editorState.draft.photos.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">
                    No photographs added yet. Upload one or more room photos
                    above.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {editorState.draft.photos.map((photo, index) => (
                      <div
                        key={`${photo.caption}-${index}`}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        <div className="relative aspect-[16/10] bg-slate-100">
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            className="h-full w-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded bg-[#0F172A]/90 px-2 py-0.5 text-[10px] font-semibold text-[#E2CFA4]">
                              <Star className="h-3 w-3 fill-current" />
                              Cover
                            </span>
                          )}
                        </div>
                        <div className="p-2.5 space-y-2">
                          <p className="truncate text-xs font-medium text-slate-800">
                            {photo.caption || `Photo ${index + 1}`}
                          </p>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMovePhoto(index, -1)}
                                aria-label="Move photo up"
                                className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={
                                  index === editorState.draft.photos.length - 1
                                }
                                onClick={() => handleMovePhoto(index, 1)}
                                aria-label="Move photo down"
                                className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverPhoto(index)}
                                  className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer"
                                >
                                  Set Cover
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(index)}
                              aria-label="Remove photo"
                              className="rounded border border-red-200 p-1 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editorState.draft.isActive}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        draft: {
                          ...editorState.draft,
                          isActive: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 accent-[#8A6D3B]"
                  />
                  <span>Publish this room on the public website</span>
                </label>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700"
                >
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditorState(null)}
                  className="min-h-[42px] rounded-lg border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] rounded-lg bg-[#0F172A] px-6 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  {editorState.isNew ? 'Save New Room' : 'Save Room Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Room Confirmation */}
      <ConfirmActionModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name || 'Room'}"?`}
        description="This will remove the room category from the admin catalog and the public Our Rooms section immediately."
        confirmLabel="Delete Room"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRoom(deleteTarget.id);
            setToastMessage(`${deleteTarget.name} was deleted.`);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
