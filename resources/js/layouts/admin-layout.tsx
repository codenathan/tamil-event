import { Link, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    Store,
    ClipboardCheck,
    Users,
    Mail,
    FolderOpen,
    MapPin,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Footer from '@/layouts/main/Footer';
import Header from '@/layouts/main/Header';

const navItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: ShieldCheck },
    { href: '/admin/inbox', label: 'Inbox', icon: Mail },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/locations', label: 'Locations', icon: MapPin },
    { href: '/admin/vendors', label: 'Vendors', icon: Store },
    {
        href: '/admin/applications',
        label: 'Applications',
        icon: ClipboardCheck,
    },
    { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

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
                                    className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${isActive
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
