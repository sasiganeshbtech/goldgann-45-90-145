import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  fallbackAction?: () => void;
  fallbackLabel?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  fallbackAction,
  fallbackLabel = 'Add INR',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return fallbackAction ? (
      <button
        type="button"
        onClick={fallbackAction}
        className="min-h-[40px] rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
      >
        {fallbackLabel}
      </button>
    ) : null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#121722] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Install AurumQuant on iOS</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close installation guide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                1. Tap the <strong className="text-white">Share</strong> icon in your Safari toolbar.
                <br />
                2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return fallbackAction ? (
    <button
      type="button"
      onClick={fallbackAction}
      className="min-h-[40px] rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
    >
      {fallbackLabel}
    </button>
  ) : null;
};
