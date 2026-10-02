import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import MainLayout from '@/layouts/main-layout';
import SettingsLayout from '@/layouts/settings/layout';

/**
 * Resolve the default layout for a page. Shared by the client and SSR
 * entry points so server-rendered HTML matches what the browser hydrates.
 */
export function resolveLayout(name: string) {
    switch (true) {
        case name.startsWith('auth/'):
            return AuthLayout;
        case name.startsWith('settings/'):
            return [AppLayout, SettingsLayout];
        default:
            return MainLayout;
    }
}
