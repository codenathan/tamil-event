import CookieBanner from '@/components/app/CookieBanner';
import Footer from '@/layouts/main/Footer';
import Header from '@/layouts/main/Header';


export default function MainLayout({ children} : { children: React.ReactNode }) {
    return (
        <>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <CookieBanner />
            </div>
        </>
    );
}
