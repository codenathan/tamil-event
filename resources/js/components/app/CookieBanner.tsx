import { Link } from '@inertiajs/react';
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};

const hasConsent = () => localStorage.getItem("cookie-consent") !== null;

/**
 * Hide the banner during SSR so the server never touches localStorage.
 */
const getServerSnapshot = () => true;

const CookieBanner = () => {
  const consented = useSyncExternalStore(subscribe, hasConsent, getServerSnapshot);
  const [accepted, setAccepted] = useState(false);

  if (consented || accepted) {
      return null;
  }

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setAccepted(true);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md shadow-lg">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use cookies to improve your experience. By continuing, you agree to our{" "}
          <Link href="/privacy-policy" className="underline text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
