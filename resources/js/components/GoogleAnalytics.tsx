import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

function setGaDisable(measurementId: string, disable: boolean): void {
    (window as Record<string, boolean | undefined>)[`ga-disable-${measurementId}`] = disable;
}

export default function GoogleAnalytics() {
    const { url, props } = usePage();
    const { measurementId, enabled } = props.analytics;
    const urlRef = useRef(url);

    useEffect(() => {
        urlRef.current = url;
    }, [url]);

    useEffect(() => {
        if (!measurementId) {
            return;
        }

        setGaDisable(measurementId, !enabled);

        if (!enabled) {
            return;
        }

        const sendPageView = (): void => {
            window.gtag?.('event', 'page_view', {
                page_path: urlRef.current,
                page_title: document.title,
            });
        };

        const configureAndSend = (): void => {
            window.gtag?.('config', measurementId, { send_page_view: false });
            sendPageView();
        };

        const existing = document.querySelector<HTMLScriptElement>(
            `script[data-ga-measurement-id="${measurementId}"]`,
        );

        if (existing) {
            if (existing.dataset.gaLoaded === 'true') {
                sendPageView();
            } else if (!existing.dataset.gaLoadHooked) {
                existing.dataset.gaLoadHooked = 'true';
                existing.addEventListener(
                    'load',
                    () => {
                        existing.dataset.gaLoaded = 'true';
                        configureAndSend();
                    },
                    { once: true },
                );
            }

            return;
        }

        window.dataLayer = window.dataLayer ?? [];
        window.gtag = function gtag(...args: unknown[]): void {
            window.dataLayer.push(args);
        };
        window.gtag('js', new Date());

        const script = document.createElement('script');
        script.async = true;
        script.dataset.gaMeasurementId = measurementId;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.onload = () => {
            script.dataset.gaLoaded = 'true';
            configureAndSend();
        };
        document.head.appendChild(script);
    }, [measurementId, enabled, url]);

    return null;
}
