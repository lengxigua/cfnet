'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  hasUserConsented,
  acceptAllCookies,
  acceptNecessaryCookies,
  saveCookiePreferences,
} from '@/lib/gdpr/cookie-preferences';

/**
 * GDPR Cookie Consent Banner
 * Displays a consent banner for first-time visitors
 * Supports: Accept All / Necessary Only / Custom preferences
 */
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    // Only show if user hasn't consented yet
    if (!hasUserConsented()) {
      // Small delay to avoid layout shift
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessaryCookies();
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences({
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
    });
    setIsVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg"
    >
      <div className="max-w-4xl mx-auto">
        {!showCustomize ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              We use cookies to enhance your experience. By continuing to visit this site you agree
              to our use of cookies.{' '}
              <Link href="/privacy" className="underline hover:text-primary transition">
                Learn more
              </Link>
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleAcceptNecessary}>
                Necessary Only
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCustomize(true)}>
                Customize
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Cookie Preferences</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="rounded"
                  aria-label="Necessary cookies (always enabled)"
                />
                <div>
                  <span className="text-sm font-medium">
                    Necessary <span className="text-muted-foreground">(Required)</span>
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Essential for the website to function properly.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={e => setAnalyticsEnabled(e.target.checked)}
                  className="rounded"
                  aria-label="Analytics cookies"
                />
                <div>
                  <span className="text-sm font-medium">Analytics</span>
                  <p className="text-xs text-muted-foreground">
                    Help us understand how visitors interact with the website.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={e => setMarketingEnabled(e.target.checked)}
                  className="rounded"
                  aria-label="Marketing cookies"
                />
                <div>
                  <span className="text-sm font-medium">Marketing</span>
                  <p className="text-xs text-muted-foreground">
                    Used to deliver personalized advertisements.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCustomize(false)}>
                Back
              </Button>
              <Button size="sm" onClick={handleSaveCustom}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
