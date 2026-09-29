import type { Auth } from '@/types/auth';

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            impersonating: {
                impersonator_name: string;
            } | null;
            sidebarOpen: boolean;
            analytics: {
                measurementId: string | null;
                enabled: boolean;
            };
            turnstileSiteKey: string | null;
            [key: string]: unknown;
        };
    }
}
