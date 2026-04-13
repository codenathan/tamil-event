import { Link, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    Store,
    Settings,
    ClipboardCheck,
    Users,
    Mail
} from 'lucide-react';
import type { ReactNode } from 'react';
import Footer from '@/layouts/main/Footer';
import Header from '@/layouts/main/Header';

const navItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: ShieldCheck },
    { href: '/admin/inbox', label: 'Inbox', icon: Mail },
    { href: '/admin/vendors', label: 'Vendors', icon: Store },
    { href: '/admin/cms', label: 'CMS', icon: Settings },
    {
        href: '/admin/applications',
        label: 'Applications',
        icon: ClipboardCheck,
    },
    { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const { props } = usePage<{
        flash: { success?: string; error?: string };
    }>();
    const { success, error } = props.flash ?? {};

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            {success && (
                <div className="border-b border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-800">
                    {success}
                </div>
            )}
            {error && (
                <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
                    {error}
                </div>
            )}
            <main className="flex-1">
                <div className="container max-w-6xl space-y-6 py-8">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <ShieldCheck className="h-8 w-8 text-primary" />{' '}
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Manage vendors, content, and applications
                        </p>
                    </div>
                    <nav className="flex flex-wrap gap-2 border-b pb-4">
                        {navItems.map(({ href, label, icon: Icon }) => {
                            const isActive =
                                href === '/admin'
                                    ? url === '/admin'
                                    : url.startsWith(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-accent'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                    <section>{children}</section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
