'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, CheckCircle, XCircle, MessageSquare, MapPin, DollarSign, AlertCircle } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
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
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
            COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        const labels: Record<string, string> = {
            PENDING: 'Pendente',
            CONFIRMED: 'Confirmada',
            CANCELLED: 'Cancelada',
            COMPLETED: 'Concluída'
        };
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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

    // Filter bookings by status
    const upcomingBookings = bookings.filter(b =>
        (b.status === 'PENDING' || b.status === 'CONFIRMED') &&
        new Date(b.checkinDate) >= new Date()
    );
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 text-lg">A carregar as suas reservas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                            <p className="text-red-600 text-lg font-medium">Erro: {error}</p>
                        </div>
                        <button
                            onClick={fetchBookings}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Minhas Reservas
                        </h1>
                        <p className="text-gray-600">
                            Gerencie seus eventos futuros e visualize o histórico de reservas
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Próximos Eventos</p>
                                    <p className="text-3xl font-bold text-blue-600">{upcomingBookings.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-gray-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Concluídas</p>
                                    <p className="text-3xl font-bold text-green-600">{completedBookings.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Canceladas</p>
                                    <p className="text-3xl font-bold text-gray-600">{cancelledBookings.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-1 inline-flex gap-1">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all text-sm ${
                                    activeTab === 'upcoming'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Próximas ({upcomingBookings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all text-sm ${
                                    activeTab === 'completed'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Concluídas ({completedBookings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('cancelled')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all text-sm ${
                                    activeTab === 'cancelled'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Canceladas ({cancelledBookings.length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-4">
                            {activeTab === 'upcoming' && (
                                <>
                                    {upcomingBookings.length > 0 ? (
                                        upcomingBookings.map((booking, index) => (
                                            <div
                                                key={booking.id}
                                                className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h2 className="text-2xl font-bold text-gray-900">{booking.listingTitle}</h2>
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-500">ID da Reserva: #{booking.id}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Check-in</p>
                                                            <p className="font-semibold text-gray-900">{new Date(booking.checkinDate).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Check-out</p>
                                                            <p className="font-semibold text-gray-900">{new Date(booking.checkoutDate).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                            <DollarSign className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Preço Total</p>
                                                            <p className="font-bold text-green-600">R$ {booking.totalPrice.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/chat/${booking.id}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        Chat
                                                    </Link>
                                                    {canCancelBooking(booking) && (
                                                        <button
                                                            onClick={() => setShowConfirmDialog(booking.id)}
                                                            disabled={deletingId === booking.id}
                                                            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105"
                                                        >
                                                            {deletingId === booking.id ? 'Cancelando...' : 'Cancelar'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl">
                                            <div className="flex flex-col items-center justify-center py-16">
                                                <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                                                <h3 className="text-xl font-semibold mb-2">Nenhuma reserva próxima</h3>
                                                <p className="text-gray-600 text-center mb-6">
                                                    Comece a explorar espaços para reservar seu próximo evento
                                                </p>
                                                <Link
                                                    href="/"
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                                                >
                                                    Explorar Espaços
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'completed' && (
                                <>
                                    {completedBookings.length > 0 ? (
                                        completedBookings.map((booking, index) => (
                                            <div
                                                key={booking.id}
                                                className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h2 className="text-2xl font-bold text-gray-900">{booking.listingTitle}</h2>
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-500">ID da Reserva: #{booking.id}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Check-in</p>
                                                            <p className="font-semibold text-gray-900">{new Date(booking.checkinDate).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Check-out</p>
                                                            <p className="font-semibold text-gray-900">{new Date(booking.checkoutDate).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                            <DollarSign className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Preço Total</p>
                                                            <p className="font-bold text-green-600">R$ {booking.totalPrice.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/chat/${booking.id}`}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Ver Chat
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl">
                                            <div className="flex flex-col items-center justify-center py-16">
                                                <CheckCircle className="h-16 w-16 text-gray-400 mb-4" />
                                                <h3 className="text-xl font-semibold mb-2">Nenhuma reserva concluída</h3>
                                                <p className="text-gray-600 text-center">
                                                    Seus eventos passados aparecerão aqui
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'cancelled' && (
                                <>
                                    {cancelledBookings.length > 0 ? (
                                        cancelledBookings.map((booking, index) => (
                                            <div
                                                key={booking.id}
                                                className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-75"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h2 className="text-2xl font-bold text-gray-900">{booking.listingTitle}</h2>
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-500">ID da Reserva: #{booking.id}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Check-in</p>
                                                            <p className="font-semibold text-gray-900">{new Date(booking.checkinDate).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Check-out</p>
                                                            <p className="font-semibold text-gray-900">{new Date(booking.checkoutDate).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                            <DollarSign className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Preço Total</p>
                                                            <p className="font-bold text-green-600">R$ {booking.totalPrice.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl">
                                            <div className="flex flex-col items-center justify-center py-16">
                                                <XCircle className="h-16 w-16 text-gray-400 mb-4" />
                                                <h3 className="text-xl font-semibold mb-2">Nenhuma reserva cancelada</h3>
                                                <p className="text-gray-600 text-center">
                                                    Seus eventos cancelados aparecerão aqui
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog !== null && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Confirmar Cancelamento</h3>
                        <p className="text-gray-600 mb-8 text-center">
                            Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(null)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold hover:scale-105"
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
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:bg-gray-400 font-semibold hover:scale-105"
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