import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                destructive
                  ? 'bg-red-50 text-red-600'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="confirm-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[40px] rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
