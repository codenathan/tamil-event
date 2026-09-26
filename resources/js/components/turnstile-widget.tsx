import { useEffect, useRef } from 'react';

type TurnstileRenderOptions = {
    sitekey: string;
    callback: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: () => void;
    theme?: 'auto' | 'light' | 'dark';
    size?: 'normal' | 'flexible' | 'compact';
};

type TurnstileApi = {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const SCRIPT_URL =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<TurnstileApi> | null = null;

/**
 * Load Cloudflare's Turnstile script once and share it between widgets.
 */
function loadTurnstile(): Promise<TurnstileApi> {
    if (window.turnstile) {
        return Promise.resolve(window.turnstile);
    }

    scriptPromise ??= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        script.onload = () =>
            window.turnstile
                ? resolve(window.turnstile)
                : reject(new Error('Turnstile failed to initialise.'));
        script.onerror = () => {
            scriptPromise = null;
            reject(new Error('Turnstile script failed to load.'));
        };
        document.head.appendChild(script);
    });

    return scriptPromise;
}

type TurnstileWidgetProps = {
    siteKey: string;
    /** Receives the token when solved, and null when it expires or errors. */
    onTokenChange: (token: string | null) => void;
    className?: string;
};

/**
 * Cloudflare Turnstile challenge. Tokens are single-use, so remount the widget
 * (change its `key`) after every submission to get a fresh one.
 */
export default function TurnstileWidget({
    siteKey,
    onTokenChange,
    className,
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onTokenChangeRef = useRef(onTokenChange);

    useEffect(() => {
        onTokenChangeRef.current = onTokenChange;
    }, [onTokenChange]);

    useEffect(() => {
        let widgetId: string | null = null;
        let cancelled = false;

        loadTurnstile()
            .then((turnstile) => {
                if (cancelled || !containerRef.current) {
                    return;
                }

                widgetId = turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    theme: 'auto',
                    size: 'flexible',
                    callback: (token) => onTokenChangeRef.current(token),
                    'expired-callback': () => onTokenChangeRef.current(null),
                    'error-callback': () => onTokenChangeRef.current(null),
                });
            })
            .catch(() => onTokenChangeRef.current(null));

        return () => {
            cancelled = true;

            if (widgetId !== null) {
                window.turnstile?.remove(widgetId);
            }
        };
    }, [siteKey]);

    return <div ref={containerRef} className={className} />;
}
