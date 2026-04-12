export interface Category {
    id?: number;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
}

export type LocationsByCountry = Record<string, string[]>;

export interface LocationOption {
    city: string;
    country: string;
}
