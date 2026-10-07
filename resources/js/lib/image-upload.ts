import { toast } from 'sonner';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 6;
export const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp';

/**
 * Returns true when the file may be used as a featured image, otherwise shows a toast.
 */
export function isValidFeaturedImage(file: File): boolean {
    if (!file.type.startsWith('image/')) {
        toast.error(
            'Invalid file type. Please upload a PNG, JPG, or WebP image.',
        );

        return false;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(
            `"${file.name}" is too large. Featured image must be under 5MB.`,
        );

        return false;
    }

    return true;
}

/**
 * Drops non-images, oversized files and anything beyond the gallery limit, showing a toast for each problem.
 */
export function acceptableGalleryImages(
    files: File[],
    currentCount: number,
): File[] {
    const oversized = files.filter(
        (f) => f.type.startsWith('image/') && f.size > MAX_IMAGE_SIZE_BYTES,
    );

    if (oversized.length > 0) {
        const names = oversized.map((f) => `"${f.name}"`).join(', ');
        toast.error(
            `${oversized.length === 1 ? `${names} is` : `${names} are`} too large. Each image must be under 5MB.`,
        );
    }

    const valid = files.filter(
        (f) => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE_BYTES,
    );
    const remainingSlots = Math.max(0, MAX_GALLERY_IMAGES - currentCount);

    if (valid.length > remainingSlots) {
        toast.error(
            `You can upload up to ${MAX_GALLERY_IMAGES} gallery images. ${remainingSlots === 0 ? 'Remove an image to add another.' : `Only ${remainingSlots} more can be added.`}`,
        );
    }

    return valid.slice(0, remainingSlots);
}
