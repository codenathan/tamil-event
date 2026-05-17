import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import createServer from '@inertiajs/react/server';
import { TooltipProvider } from '@/components/ui/tooltip';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Toaster } from '@/components/ui/sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });

            return pages[`./pages/${name}.tsx`] as any;
        },
        setup({ App, props }) {
            return (
                <TooltipProvider delayDuration={0}>
                    <GoogleAnalytics />
                    <App {...props} />
                    <Toaster />
                </TooltipProvider>
            );
        },
    }),
);
