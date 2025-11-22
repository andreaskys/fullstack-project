export interface Listing {
    id: string;
    title: string;
    description?: string;
    coverImage: string;
    price: number;
    maxGuests: number;
    location: string;
    category?: string;
    rating?: number;
    reviews?: number;
    hostName?: string;
    hostId?: number;
}