"use client";

import { useEffect, useState } from "react";

type Consent = "granted" | "denied";

function updateConsent(mode: Consent) {
  if (typeof window === "undefined") return;

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag =
    w.gtag ||
    function () {
      w.dataLayer.push(arguments);
    };

  // Now call gtag with proper args (typed as any)
  w.gtag("consent", "update", {
    ad_storage: mode,
    ad_user_data: mode,
    ad_personalization: mode,
    analytics_storage: mode,
  });
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Show banner if no prior choice
    const saved = localStorage.getItem("consentChoice");
    if (!saved) setOpen(true);

    // Expose a global to reopen later (used by footer link)
    (window as any).openCookieSettings = () => setOpen(true);
  }, []);

  const choose = (mode: Consent) => {
    updateConsent(mode);
    localStorage.setItem("consentChoice", mode);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-4xl m-3 rounded-xl border bg-white shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm">
            We use cookies to run this site and to show ads (Google AdSense). Choose whether to allow
            cookies used for ads and measurement. You can change this anytime in{" "}
            <button className="underline" type="button" onClick={() => setOpen(true)}>
              Cookie settings
            </button>
            . See our <a href="/privacy" className="underline">Privacy Policy</a>.
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              className="px-3 py-2 rounded-md border"
              onClick={() => choose("denied")}
              aria-label="Reject non-essential cookies"
            >
              Reject
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-blue-600 text-white"
              onClick={() => choose("granted")}
              aria-label="Accept all cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
