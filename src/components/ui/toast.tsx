"use client";
export function Toast({ message, dismissLabel, onDismiss }: {
  message: string | null; dismissLabel: string; onDismiss: () => void;
}) {
  return <div role="status" aria-live="polite" aria-atomic="true">
    {message && <div className="fixed inset-x-5 bottom-5 z-50 mx-auto flex max-w-lg items-center justify-between gap-4 border border-muted bg-ivory p-4 text-charcoal shadow-lg">
      <p>{message}</p><button type="button" onClick={onDismiss} className="min-h-11 px-3 underline">{dismissLabel}</button>
    </div>}
  </div>;
}
