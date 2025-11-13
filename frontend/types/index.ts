export type ListingCard = {
    id: number;
    title: string;
    description: string;
    location: string;
    price: number;
    rating: number;
    maxGuests: number;
    hostName: string;
    imageUrls: string[];
    amenities: string[];
    videoUrls: string[];
    hostId: number;
};

export type AmenityDTO = {
    id: number;
    name: string;
};