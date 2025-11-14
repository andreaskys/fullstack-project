'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import BookingWidget from './BookingWidget';
import Link from "next/link";

type ListingActionsProps = {
    hostId: number;
    listingId: number;
    price: number;
};

export default function ListingActions({ hostId, listingId, price }: ListingActionsProps) {
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
    const isVisitor = isAuthenticated && !isOwner;

    return (
        <div className="mt-8">
            {isVisitor && (
                <BookingWidget
                    listingId={listingId}
                    pricePerNight={price}
                />
            )}
            {!isAuthenticated && (
                <div className="p-6 border border-gray-300 rounded-lg bg-white mt-8 text-center">
                    <h3 className="text-xl font-semibold mb-4">Faça login para reservar</h3>
                    <p className="text-gray-600">
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline">Faça login</Link> ou{' '}
                        <Link href="/register" className="text-blue-600 font-semibold hover:underline">registe-se</Link> para fazer uma reserva.
                    </p>
                </div>
            )}
        </div>
    );
}