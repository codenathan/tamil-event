import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export function DashboardGetStarted() {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-6">
                <CardTitle className="font-display text-lg">Get started</CardTitle>
                <CardDescription>
                    Create your business listing to connect with the Tamil community.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Button asChild>
                    <Link href="/list-your-business">List your business</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
