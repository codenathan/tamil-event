import { usePage } from '@inertiajs/react';
import CookieBanner from '@/components/app/CookieBanner';
import Footer from '@/layouts/main/Footer';
import Header from '@/layouts/main/Header';
// import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage<{
        flash: { success?: string; error?: string };
    }>();
    const { success, error } = props.flash ?? {};

    return (
        <>
            <div className="flex min-h-screen flex-col">
                <Header />
                {success && (
                    <div className="bg-green-50 border-b border-green-200 text-green-800 px-4 py-3 text-sm text-center">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-3 text-sm text-center">
                        {error}
                    </div>
                )}
                <main className="flex-1">{children}</main>
                <Footer />
                <CookieBanner />
            </div>
            {/* <AnimatedThemeToggler
                className="fixed bottom-6 right-6 z-60 flex size-12 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            /> */}
        </>
    );
}
