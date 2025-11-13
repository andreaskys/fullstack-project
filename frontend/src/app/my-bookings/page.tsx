'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type BookingResponse = {
    id: number;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    status: string;
    listingId: number;
    listingTitle: string;
};

export default function MyBookingsPage() {
    const { token, isAuthenticated, logout } = useAuth();
const [bookings, setBookings] = useState<BookingResponse[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const router = useRouter();

useEffect(() => {
    if (!isAuthenticated) {
        router.push('/login');
        return;
    }

    const fetchBookings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/bookings/my-bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.status === 403) {
                logout();
                return;
            }
            if (!res.ok) {
                throw new Error('Não foi possível buscar as suas reservas.');
            }

            const data: BookingResponse[] = await res.json();
            setBookings(data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchBookings();
}, [isAuthenticated, token, router, logout]);


if (isLoading) {
    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>
            <p>A carregar...</p>
        </main>
    );
}

if (error) {
    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>
            <p className="text-red-500">Erro: {error}</p>
        </main>
    );
}

return (
    <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>

        {bookings.length === 0 ? (
            <p>Você ainda não fez nenhuma reserva.</p>
        ) : (
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md border">
                        <h2 className="text-xl font-semibold">{booking.listingTitle}</h2>
                        <p><strong>ID da Reserva:</strong> {booking.id}</p>
                        <p><strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                        <p><strong>Preço Total:</strong> R$ {booking.totalPrice.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span className="font-medium text-blue-600">{booking.status}</span></p>
                    </div>
                ))}
            </div>
        )}
    </main>
);
}