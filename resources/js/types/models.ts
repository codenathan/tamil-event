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

export type Image = {
    id: number;
    path: string;
    sort_order: number;
    url : string;
}

export enum VendorStatus {
    PENDING =  'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export type Vendor = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    featured_image_url : string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    social_instagram: string | null;
    social_facebook: string | null;
    category: Category | null;
    city: City | null;
    country: Country | null;
    images: Image[];
    is_active: boolean;
    status : VendorStatus;
};

export enum ContactMessageStatus {
    PENDING = "pending",
    READ = "read",
}

export type ContactMessage = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: ContactMessageStatus;
    created_at: string;
};
