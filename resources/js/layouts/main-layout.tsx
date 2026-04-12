import { usePage } from '@inertiajs/react';
import CookieBanner from '@/components/app/CookieBanner';
import Footer from '@/layouts/main/Footer';
import Header from '@/layouts/main/Header';


export default function MainLayout({ children} : { children: React.ReactNode }) {
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
        </>
    );
}
