import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogIn, LogOut, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard, logout } from '@/routes';

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { auth } = usePage().props;
    const isAuthenticated = auth.user !== null;
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (searchQuery.trim()) {
            setSearchQuery('');
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
            <div className="container flex h-16 items-center justify-between gap-4">
                <Link href="/" className="flex shrink-0 items-center gap-2">
                    <span className="text-gradient font-display text-2xl font-bold">
                        TamilEvents
                    </span>
                </Link>


                <nav className="hidden items-center gap-4 md:flex">
                    <Link
                        href="/"
                        className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                    >
                        Home
                    </Link>
                    <Link
                        href="/search"
                        className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                    >
                        Browse
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                    >
                        Contact
                    </Link>
                    <Button
                        asChild
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Link href="/list-your-business">
                            List Your Business
                        </Link>
                    </Button>
                    {isAuthenticated ? (
                        <>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                            >
                                <Link href={dashboard()}>
                                    Dashboard
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5"
                            >
                                <Link href={logout()}>
                                    <LogOut className="h-3.5 w-3.5" />
                                    Logout
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                        >
                            <Link href="/login">
                                <LogIn className="h-3.5 w-3.5" />
                                Login
                            </Link>
                        </Button>
                    )}
                </nav>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-foreground md:hidden"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="space-y-3 border-t border-border bg-background p-4 md:hidden">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search services..."
                                className="h-10 w-full rounded-lg border border-input bg-muted/50 pr-4 pl-9 font-body text-sm"
                            />
                        </div>
                    </form>
                    <Link
                        href="/"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm font-medium"
                    >
                        Home
                    </Link>
                    <Link
                        href="/search"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm font-medium"
                    >
                        Browse
                    </Link>
                    <Link
                        href="/contact"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm font-medium"
                    >
                        Contact
                    </Link>
                    <Button
                        asChild
                        size="sm"
                        className="w-full bg-primary text-primary-foreground"
                    >
                        <Link
                            href="/list-your-business"
                            onClick={() => setMobileOpen(false)}
                        >
                            List Your Business
                        </Link>
                    </Button>
                    {isAuthenticated ? (
                        <>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full gap-1.5"
                            >
                                <Link
                                    href={dashboard()}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full gap-1.5"
                            >
                                <Link href={logout()}>
                                <LogOut className="h-3.5 w-3.5" />
                                Logout
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5"
                        >
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                Login
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </header>
    );
}
