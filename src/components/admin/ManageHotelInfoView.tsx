import { useEffect, useState } from 'react';
import { Check, RotateCcw, Upload } from 'lucide-react';
import { useHotelStore } from '@/src/context/HotelStoreContext';
import { readImageFileAsDataUrl } from '@/src/services/hotelApiService';
import { HotelLogo } from '@/src/components/HotelLogo';
import type { HotelSettingsInfo } from '@/src/types/hotel';

export function ManageHotelInfoView() {
  const { hotelInfo, updateHotelInfo } = useHotelStore();
  const [formState, setFormState] = useState<HotelSettingsInfo>(hotelInfo);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setFormState(hotelInfo);
  }, [hotelInfo]);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await readImageFileAsDataUrl(file);
    setFormState((prev) => ({ ...prev, hotelLogoUrl: dataUrl }));
    event.target.value = '';
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateHotelInfo({
      ...formState,
      hotelName: formState.hotelName.trim() || 'RED APPLE HOTEL',
      address: formState.address.trim(),
      phone: formState.phone.trim(),
      whatsapp: formState.whatsapp.trim(),
      email: formState.email.trim(),
      description: formState.description.trim(),
      googleMapsUrl: formState.googleMapsUrl.trim(),
      checkInTime: formState.checkInTime.trim() || '3:00 PM',
      checkOutTime: formState.checkOutTime.trim() || '12:00 PM',
      socialLinks: {
        instagram: formState.socialLinks.instagram.trim(),
        facebook: formState.socialLinks.facebook.trim(),
        twitter: formState.socialLinks.twitter.trim(),
      },
    });
    setSavedNotice(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Hotel Information &amp; Brand Settings
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Updates saved here immediately reflect across the public Navbar, Hero,
          About Us, Contact Us, WhatsApp button, Booking forms, Google Maps, and
          Footer.
        </p>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900"
        >
          <Check className="h-4 w-4 text-emerald-700" />
          <span>
            Hotel information updated and synchronized with the public website.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8"
      >
        {/* Brand & Logo */}
        <section className="space-y-4">
          <h3 className="border-b border-slate-100 pb-2 text-sm font-semibold text-slate-900">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-900 p-2">
                {formState.hotelLogoUrl ? (
                  <img
                    src={formState.hotelLogoUrl}
                    alt="Hotel logo preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <HotelLogo className="h-10 w-10 text-[#C9A96E]" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Hotel Logo</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="sr-only"
                    />
                  </label>
                  {formState.hotelLogoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({ ...prev, hotelLogoUrl: '' }))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Use Monogram</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-7">
              <label
                htmlFor="hotel-info-name"
                className="block text-xs font-medium text-slate-700"
              >
                Hotel Name *
              </label>
              <input
                id="hotel-info-name"
                type="text"
                required
                value={formState.hotelName}
                onChange={(e) =>
                  setFormState({ ...formState, hotelName: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="hotel-info-desc"
              className="block text-xs font-medium text-slate-700"
            >
              Hotel Description
            </label>
            <textarea
              id="hotel-info-desc"
              rows={3}
              value={formState.description}
              onChange={(e) =>
                setFormState({ ...formState, description: e.target.value })
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#8A6D3B] focus:outline-none"
            />
          </div>
        </section>

        {/* Contact & Location */}
        <section className="space-y-4">
          <h3 className="border-b border-slate-100 pb-2 text-sm font-semibold text-slate-900">
            Contact Channels &amp; Location
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="hotel-info-phone"
                className="block text-xs font-medium text-slate-700"
              >
                Phone Number
              </label>
              <input
                id="hotel-info-phone"
                type="text"
                value={formState.phone}
                onChange={(e) =>
                  setFormState({ ...formState, phone: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm tabular-nums focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-info-whatsapp"
                className="block text-xs font-medium text-slate-700"
              >
                WhatsApp Number (digits with country code)
              </label>
              <input
                id="hotel-info-whatsapp"
                type="text"
                value={formState.whatsapp}
                onChange={(e) =>
                  setFormState({ ...formState, whatsapp: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm tabular-nums focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-info-email"
                className="block text-xs font-medium text-slate-700"
              >
                Reservations Email
              </label>
              <input
                id="hotel-info-email"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="hotel-info-address"
                className="block text-xs font-medium text-slate-700"
              >
                Hotel Street Address
              </label>
              <input
                id="hotel-info-address"
                type="text"
                value={formState.address}
                onChange={(e) =>
                  setFormState({ ...formState, address: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-info-maps"
                className="block text-xs font-medium text-slate-700"
              >
                Google Maps Embed URL{' '}
                <span className="font-normal text-slate-400">
                  (optional; auto-generated from address if blank)
                </span>
              </label>
              <input
                id="hotel-info-maps"
                type="url"
                value={formState.googleMapsUrl}
                onChange={(e) =>
                  setFormState({ ...formState, googleMapsUrl: e.target.value })
                }
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Check-in / Check-out & Social Media */}
        <section className="space-y-4">
          <h3 className="border-b border-slate-100 pb-2 text-sm font-semibold text-slate-900">
            Check-In Schedule &amp; Social Media Links
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="hotel-info-checkin"
                className="block text-xs font-medium text-slate-700"
              >
                Check-In Time
              </label>
              <input
                id="hotel-info-checkin"
                type="text"
                value={formState.checkInTime}
                onChange={(e) =>
                  setFormState({ ...formState, checkInTime: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-info-checkout"
                className="block text-xs font-medium text-slate-700"
              >
                Check-Out Time
              </label>
              <input
                id="hotel-info-checkout"
                type="text"
                value={formState.checkOutTime}
                onChange={(e) =>
                  setFormState({ ...formState, checkOutTime: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="hotel-social-ig"
                className="block text-xs font-medium text-slate-700"
              >
                Instagram URL
              </label>
              <input
                id="hotel-social-ig"
                type="url"
                value={formState.socialLinks.instagram}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    socialLinks: {
                      ...formState.socialLinks,
                      instagram: e.target.value,
                    },
                  })
                }
                placeholder="https://instagram.com/..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-social-fb"
                className="block text-xs font-medium text-slate-700"
              >
                Facebook URL
              </label>
              <input
                id="hotel-social-fb"
                type="url"
                value={formState.socialLinks.facebook}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    socialLinks: {
                      ...formState.socialLinks,
                      facebook: e.target.value,
                    },
                  })
                }
                placeholder="https://facebook.com/..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-social-x"
                className="block text-xs font-medium text-slate-700"
              >
                X / Twitter URL
              </label>
              <input
                id="hotel-social-x"
                type="url"
                value={formState.socialLinks.twitter}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    socialLinks: {
                      ...formState.socialLinks,
                      twitter: e.target.value,
                    },
                  })
                }
                placeholder="https://x.com/..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-[#8A6D3B] focus:outline-none"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            className="min-h-[44px] rounded-lg bg-[#0F172A] px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer"
          >
            Save Hotel Information
          </button>
        </div>
      </form>
    </div>
  );
}
