import { Table } from 'lucide-react';
import type {ReactNode} from 'react';

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';

interface EmptyTableProps {
    title?: string;
    description?: string;
    action?: ReactNode;
}

export default function EmptyTable({
    title = 'No data to display',
    description,
    action,
}: EmptyTableProps) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Table />
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                {description && (
                    <EmptyDescription>{description}</EmptyDescription>
                )}
            </EmptyHeader>
            {action && <EmptyContent>{action}</EmptyContent>}
        </Empty>
    );
}

