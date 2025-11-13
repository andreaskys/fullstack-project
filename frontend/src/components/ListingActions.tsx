'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';
import BookingWidget from './BookingWidget';
import VideoUpload from './VideoUpload';
import ChatBox from './ChatBox';
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
                {isOwner && (
                    <div className="space-y-4">
                        <ImageUpload listingId={listingId} />
                        <VideoUpload listingId={listingId} />
                    </div>
                )}

                {isVisitor && (
                    <BookingWidget
                        listingId={listingId}
                        pricePerNight={price}
                    />
                )}
            </div>

            <div>
                {isAuthenticated ? (
                    <ChatBox roomId={listingId.toString()} />
                ) : (
                    <div className="p-6 border rounded-lg bg-gray-100 text-center">
                        <p className="text-gray-600">
                            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Faça login</Link> para conversar com o anfitrião.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}