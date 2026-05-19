import { router } from '@inertiajs/react';
import { useEffect } from 'react';

type AnalyticsProps = {
    measurementId: string | null;
    enabled: boolean;
};

function readAnalytics(page: { props?: Record<string, unknown> }): AnalyticsProps | null {
    const raw = page.props?.analytics;

    if (
        !raw ||
        typeof raw !== 'object' ||
        !('measurementId' in raw) ||
        !('enabled' in raw)
    ) {
        return null;
    }

    return raw as AnalyticsProps;
}

/**
 * Google Analytics SPA navigation tracker.
 *
 * The gtag.js script is loaded server-side in app.blade.php so it is
 * available immediately on first paint. This component only tracks
 * subsequent Inertia page visits by listening to router events.
 */
export default function GoogleAnalytics() {
    if (typeof window === 'undefined') {
        return null;
    }

    useEffect(() => {
        const sendPageView = (measurementId: string, url: string): void => {
            window.gtag?.('event', 'page_view', {
                page_path: url,
                page_title: document.title,
                page_location: window.location.href,
            });
        };

        const handleNavigate = (event: Event): void => {
            const customEvent = event as CustomEvent<{ page: { props: Record<string, unknown>; url: string } }>;
            const page = customEvent.detail.page;
            const analytics = readAnalytics(page);

            if (!analytics || !analytics.enabled) {
                return;
            }

            const measurementId = analytics.measurementId;

            if (!measurementId) {
                return;
            }

            requestAnimationFrame(() => {
                sendPageView(measurementId, page.url);
            });
        };

        const unsubscribe = router.on('navigate', handleNavigate);

        return () => {
            unsubscribe();
        };
    }, []);

    return null;
}
