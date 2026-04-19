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
            sidebarOpen: boolean;
            analytics: {
                measurementId: string | null;
                enabled: boolean;
            };
            [key: string]: unknown;
        };
    }
}
