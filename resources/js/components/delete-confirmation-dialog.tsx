import {  useState } from 'react';
import type {ReactNode} from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DeleteConfirmationDialogProps {
    trigger?: ReactNode;
    title: string;
    description: string;
    children?: (disabled: boolean, onClose: () => void) => ReactNode;
    requiredText?: string;
}

export default function DeleteConfirmationDialog({
    trigger,
    title,
    description,
    children,
    requiredText,
}: DeleteConfirmationDialogProps) {
    const [confirmText, setConfirmText] = useState('');
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const disabled = requiredText ? confirmText !== requiredText : false;

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);

        if (!newOpen) {
            setConfirmText('');
        }
    };

    const confirmInput = requiredText && (
        <div className="space-y-2">
            <Label htmlFor="confirm">
                Type{' '}
                <span className="font-mono font-semibold">{requiredText}</span>{' '}
                to confirm
            </Label>
            <Input
                id="confirm"
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={requiredText}
                value={confirmText}
            />
        </div>
    );

    const defaultButtons = (isDrawer: boolean) =>
        children ? (
            children(disabled, () => setOpen(false))
        ) : isDrawer ? (
            <>
                <Button type="button" variant="destructive" disabled={disabled}>
                    Delete
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                >
                    Cancel
                </Button>
            </>
        ) : (
            <>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                >
                    Cancel
                </Button>
                <Button type="button" variant="destructive" disabled={disabled}>
                    Delete
                </Button>
            </>
        );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {confirmInput}
                    <DialogFooter>{defaultButtons(false)}</DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                {confirmInput && (
                    <div className="overflow-y-auto max-h-[50vh] px-4 pb-4">
                        {confirmInput}
                    </div>
                )}
                <DrawerFooter className="border-t">
                    {defaultButtons(true)}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

