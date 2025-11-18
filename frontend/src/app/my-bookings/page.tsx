'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type BookingResponse = {
    id: number;
    checkinDate: string;
    checkoutDate: string;
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
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState<number | null>(null);
    const router = useRouter();

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

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchBookings();
    }, [isAuthenticated, token]);

    const handleDeleteBooking = async (bookingId: number) => {
        if (!token) {
            router.push('/login');
            return;
        }
        setDeletingId(bookingId);
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 403) {
                logout();
                return;
            }
            if (response.status === 401) {
                alert('Você não tem permissão para cancelar esta reserva.');
                return;
            }
            if (response.status === 409) {
                alert('Não é possível cancelar uma reserva que já começou.');
                return;
            }
            if (!response.ok) {
                throw new Error('Erro ao cancelar reserva');
            }
            alert('Reserva cancelada com sucesso!');
            setShowConfirmDialog(null);
            fetchBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Erro ao cancelar reserva. Tente novamente.');
        } finally {
            setDeletingId(null);
        }
    };
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800'
        };
        const labels: Record<string, string> = {
            PENDING: 'Pendente',
            CONFIRMED: 'Confirmada',
            CANCELLED: 'Cancelada',
            COMPLETED: 'Concluída'
        };
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };
    const canCancelBooking = (booking: BookingResponse) => {
        if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
            return false;
        }
        const checkInDate = new Date(booking.checkinDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return checkInDate >= today;
    };
    if (isLoading) {
        return (
            <main className="p-8">
                <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </main>
        );
    }
    if (error) {
        return (
            <main className="p-8">
                <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Erro: {error}</p>
                    <button
                        onClick={fetchBookings}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </main>
        );
    }
    return (
        <>
            <main className="p-8 max-w-4xl mx-auto bg-gray-100 text-gray-900 min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>
                {bookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-24 w-24 mx-auto text-gray-300 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="text-xl font-semibold mb-2">Nenhuma reserva encontrada</h3>
                        <p className="text-gray-600 mb-6">Você ainda não fez nenhuma reserva.</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Explorar Espaços
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white text-gray-800 p-6 rounded-lg shadow-md border">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-semibold">{booking.listingTitle}</h2>
                                        <p className="text-sm text-gray-500">ID da Reserva: {booking.id}</p>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>
                                <div className="border-t my-4"></div>
                                <div className="space-y-2 mb-4">
                                    <p><strong>Check-in:</strong> {new Date(booking.checkinDate).toLocaleDateString('pt-PT')}</p>
                                    <p><strong>Check-out:</strong> {new Date(booking.checkoutDate).toLocaleDateString('pt-PT')}</p>
                                    <p><strong>Preço Total:</strong> <span className="text-blue-600 font-semibold">R$ {booking.totalPrice.toFixed(2)}</span></p>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Link
                                        href={`/chat/${booking.id}`}
                                        className="flex-1 px-4 py-2 text-center font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Chat
                                    </Link>
                                    {canCancelBooking(booking) && (
                                        <button
                                            onClick={() => setShowConfirmDialog(booking.id)}
                                            disabled={deletingId === booking.id}
                                            className="px-6 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {deletingId === booking.id ? 'Cancelando...' : 'Cancelar Reserva'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            {showConfirmDialog !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Cancelamento</h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                                disabled={deletingId !== null}
                            >
                                Não, voltar
                            </button>
                            <button
                                onClick={() => {
                                    if (showConfirmDialog !== null) {
                                        handleDeleteBooking(showConfirmDialog);
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 font-medium"
                                disabled={deletingId !== null}
                            >
                                {deletingId === showConfirmDialog ? 'Cancelando...' : 'Sim, cancelar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}