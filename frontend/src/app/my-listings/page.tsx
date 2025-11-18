'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DeleteListingButton from "@/components/DeleteListingButton";

type BookingSummary = {
    id: number;
    clientName: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
};

type HostListing = {
    id: number;
    title: string;
    imageUrl: string | null;
    bookings: BookingSummary[];
};

export default function MyListingsPage() {
    const { token, isAuthenticated, logout } = useAuth();
    const [listings, setListings] = useState<HostListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchHostListings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/listings/my-listings', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.status === 403) { logout(); return; }
                if (!res.ok) throw new Error('Não foi possível buscar os seus espaços.');

                const data: HostListing[] = await res.json();
                setListings(data);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHostListings();
    }, [isAuthenticated, token, router, logout]);

    const handleDeleteSuccess = (deletedListingId: number) => {
        setListings((prevListings) =>
            prevListings.filter(listing => listing.id !== deletedListingId)
        );
    };

    if (isLoading) {
        return (
            <main className="p-8 max-w-6xl mx-auto text-gray-900">
                <h1 className="text-3xl font-bold mb-8">Meus Espaços</h1>
                <p>A carregar...</p>
            </main>
        );
    }

    if (error) {
        return <main className="p-8 max-w-6xl mx-auto text-red-500">Erro: {error}</main>;
    }

    return (
        <main className="p-8 max-w-6xl mx-auto bg-gray-100 text-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Gestão dos Meus Espaços</h1>

            {listings.length === 0 ? (
                <p>Você ainda não criou nenhum espaço. <Link href="/create-listing" className="text-blue-600 hover:underline">Crie um agora!</Link></p>
            ) : (
                <div className="space-y-8">

                    {listings.map((listing) => (
                        <div key={listing.id} className="bg-white p-6 rounded-lg shadow-md border">
                            <div className="flex gap-4 mb-4">
                                <div className="w-32 h-24 relative rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                                    {listing.imageUrl ? (
                                        <Image
                                            src={listing.imageUrl}
                                            alt={listing.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">Sem Capa</div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold">{listing.title}</h2>
                                    <p className="text-sm text-gray-500">ID do Espaço: {listing.id}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/edit-listing/${listing.id}`}
                                    className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Editar
                                </Link>
                                <DeleteListingButton
                                    listingId={listing.id}
                                    onDeleteSuccess={handleDeleteSuccess}
                                />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 border-t pt-4">Reservas Recebidas</h3>
                            {listing.bookings.length === 0 ? (
                                <p className="text-sm text-gray-500">Nenhuma reserva para este espaço ainda.</p>
                            ) : (
                                <div className="space-y-2">
                                    {listing.bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md border"
                                        >
                                            <div>
                                                <p><strong>Cliente:</strong> {booking.clientName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm"><strong>Status:</strong> {booking.status}</p>
                                            </div>

                                            <Link
                                                href={`/chat/${booking.id}`}
                                                className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                            >
                                                Ver Chat
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}