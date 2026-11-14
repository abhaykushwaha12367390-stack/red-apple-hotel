import { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { HotelLogo } from '@/src/components/HotelLogo';
import { useHotelStore } from '@/src/context/HotelStoreContext';

interface AdminLoginPageProps {
  onSuccessRedirect: () => void;
  onBackToSite: () => void;
}

export function AdminLoginPage({
  onSuccessRedirect,
  onBackToSite,
}: AdminLoginPageProps) {
  const { hotelInfo, loginAdmin, signInAdminWithGoogle } = useHotelStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await loginAdmin(email, password, rememberMe);
      if (result.success) {
        onSuccessRedirect();
      } else {
        setErrorMessage(
          result.error || 'Unable to authenticate with the provided details.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const result = await signInAdminWithGoogle();
      if (result.success) {
        onSuccessRedirect();
      } else {
        setErrorMessage(result.error || 'Google Sign-In failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col justify-between px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Return to Hotel Website</span>
        </button>

        <span className="inline-flex items-center gap-1.5 text-xs text-[#E2CFA4]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#C9A96E]" aria-hidden="true" />
          <span>Protected Owner Portal</span>
        </span>
      </div>

      <main className="mx-auto my-8 w-full max-w-md">
        <div className="rounded-2xl border border-[#C9A96E]/25 bg-[#13161E] p-7 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
          {/* Hotel Brand Identity */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C9A96E]/35 bg-[#0B0D12]">
              {hotelInfo.hotelLogoUrl ? (
                <img
                  src={hotelInfo.hotelLogoUrl}
                  alt={`${hotelInfo.hotelName} logo`}
                  className="h-8 w-8 rounded-sm object-contain"
                />
              ) : (
                <HotelLogo className="h-7 w-7 text-[#C9A96E]" />
              )}
            </div>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A96E]">
              {hotelInfo.hotelName}
            </p>
            <h1 className="font-display mt-1.5 text-3xl font-medium text-white">
              Admin Portal Sign In
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Restricted to authorized hotel management. Public registration is
              disabled.
            </p>
          </div>

          {/* Transparent Frontend Demo Mode Notice */}
          <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3.5 text-left">
            <div className="flex items-start gap-2.5">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                aria-hidden="true"
              />
              <p className="text-[11px] leading-relaxed text-amber-100/90">
                <strong className="font-semibold text-amber-200">
                  Owner Sign-In:
                </strong>{' '}
                Sign in with your Google owner account for live cloud booking
                sync, or enter your admin email and password (6+ characters) for
                local preview mode.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-xs font-medium tracking-wider uppercase text-white/80"
              >
                Admin Email
              </label>
              <input
                id="admin-login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourhotelname.com"
                className="mt-2 w-full rounded-lg border border-white/15 bg-[#0B0D12] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-login-password"
                className="block text-xs font-medium tracking-wider uppercase text-white/80"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-white/15 bg-[#0B0D12] py-3 pr-11 pl-4 text-sm text-white placeholder:text-white/35 focus:border-[#C9A96E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/55 hover:text-[#E2CFA4] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-white/75">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-[#0B0D12] accent-[#C9A96E]"
                />
                <span>Remember session on this browser</span>
              </label>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#C9A96E] px-6 py-3 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-[#E2CFA4] disabled:opacity-60 cursor-pointer"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleGoogleSignIn()}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#C9A96E] hover:text-[#E2CFA4] disabled:opacity-60 cursor-pointer"
            >
              <span>Sign In with Google (Cloud Sync)</span>
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-[11px] text-white/40">
        {hotelInfo.hotelName} · Property Management Console
      </footer>
    </div>
  );
}
