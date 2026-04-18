export type Category = {
    id: number;
    name: string;
    icon: string | null;
    description: string | null;
    slug : string;
}

export type City = {
    id: number;
    name: string;
    slug : string;
    country: Country;
}

export type Country = {
    id: number;
    name: string;
    slug: string;
    cities: City[];
    cities_count: number;
};

export type VendorGalleryImage = {
    id: number;
    url: string;
};

export enum VendorStatus {
    PENDING =  'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export type VendorUserSummary = {
    id: number;
    name: string;
};

export type Vendor = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    featured_image_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    social_instagram: string | null;
    social_facebook: string | null;
    services?: string[];
    category: Category | null;
    city: City | null;
    country: Country | null;
    images: VendorGalleryImage[];
    is_active: boolean;
    status: VendorStatus;
    user?: VendorUserSummary | null;
};

export enum ContactMessageStatus {
    PENDING = "pending",
    READ = "read",
}

export enum EnquireStatus {
    PENDING = "pending",
    READ = "read",
}

export type Enquire = {
    id: number;
    vendor_id: number;
    name: string;
    email: string;
    /** ISO date string (event date) */
    date: string;
    message: string;
    status: EnquireStatus;
    created_at: string;
    updated_at: string;
};

export type ContactMessage = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: ContactMessageStatus;
    created_at: string;
};
