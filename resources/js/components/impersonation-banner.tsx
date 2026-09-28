import { router, usePage } from '@inertiajs/react';
import { UserRoundSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stop } from '@/routes/impersonate';

export default function ImpersonationBanner() {
    const { auth, impersonating } = usePage().props;

    if (!impersonating || !auth.user) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-amber-400 px-4 py-2 text-sm text-amber-950">
            <span className="flex items-center gap-2">
                <UserRoundSearch className="h-4 w-4 shrink-0" />
                <span>
                    You are viewing the site as{' '}
                    <strong>{auth.user.name}</strong> (signed in as{' '}
                    {impersonating.impersonator_name})
                </span>
            </span>
            <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 border-amber-950/30 bg-amber-50 text-amber-950 hover:bg-amber-100"
                onClick={() => router.post(stop.url())}
            >
                Stop impersonating
            </Button>
        </div>
    );
}
