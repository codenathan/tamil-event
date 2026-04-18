import { Head, router, usePage } from '@inertiajs/react';
import { UserCheck, UserX, Users as UsersIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import DataTableWithSearch from '@/components/data-table-with-search';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { users as usersRoute } from '@/routes/admin';
import { disable, enable } from '@/routes/admin/users';
import type { Auth } from '@/types/auth';

type Role = {
    id: number;
    name: string;
};

type ListedUser = {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    disabled_at: string | null;
};

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: ListedUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    users: PaginatedUsers;
}

Index.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default function Index({ users }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const handleDisable = (u: ListedUser) => {
        router.post(disable.url(u.id), {}, { preserveScroll: true });
    };

    const handleEnable = (u: ListedUser) => {
        router.post(enable.url(u.id), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Users" />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Users ({users.total})
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <DataTableWithSearch<ListedUser>
                        data={users}
                        searchUrl={usersRoute.url()}
                        searchPlaceholder="Search by name or email…"
                        emptyMessage="No users found."
                        itemLabel="users"
                        columns={[
                            {
                                header: 'Name',
                                accessor: 'name',
                                className: 'font-medium',
                            },
                            {
                                header: 'Email',
                                accessor: 'email',
                                className: 'text-muted-foreground',
                            },
                            {
                                header: 'Status',
                                render: (u) =>
                                    u.disabled_at ? (
                                        <Badge variant="destructive">
                                            Disabled
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Active</Badge>
                                    ),
                            },
                            {
                                header: 'Roles',
                                render: (u) =>
                                    u.roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {u.roles.map((role) => (
                                                <Badge
                                                    key={role.id}
                                                    variant="secondary"
                                                >
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            —
                                        </span>
                                    ),
                            },
                        ]}
                        renderActions={(u) => {
                            if (u.id === auth.user.id) {
                                return (
                                    <span className="text-xs text-muted-foreground">
                                        —
                                    </span>
                                );
                            }

                            if (u.disabled_at) {
                                return (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                        onClick={() => handleEnable(u)}
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        Enable
                                    </Button>
                                );
                            }

                            return (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <UserX className="h-4 w-4" />
                                            Disable
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Disable this user?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {u.name} will no longer be able to
                                                sign in until their account is
                                                enabled again.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() =>
                                                    handleDisable(u)
                                                }
                                            >
                                                Disable account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            );
                        }}
                    />
                </CardContent>
            </Card>
        </>
    );
}
