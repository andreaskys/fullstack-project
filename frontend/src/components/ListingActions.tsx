'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import BookingWidget from './BookingWidget';

type ListingActionsProps = {
    hostId: number;
    listingId: number;
    price: number;
    maxGuests?: number; // Adicionei opcional para passar adiante
    rating?: number;
    reviews?: number;
};

export default function ListingActions({
                                           hostId,
                                           listingId,
                                           price,
                                           maxGuests = 100, // Valor padrão caso a API antiga não mande
                                           rating = 0,
                                           reviews = 0
                                       }: ListingActionsProps) {

    const { isAuthenticated, token, logout } = useAuth();
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.userId);
            } catch (e) {
                console.error("Falha ao decodificar token:", e);
                logout();
            }
        } else {
            setCurrentUserId(null);
        }
    }, [token, logout]);

    const isOwner = isAuthenticated && currentUserId === hostId;

    return (
        <div className="w-full">
            <BookingWidget
                listingId={listingId}
                price={price}
                maxGuests={maxGuests}
                rating={rating}
                reviews={reviews}
                isAuthenticated={isAuthenticated}
                isOwner={isOwner}
            />
        </div>
    );
}