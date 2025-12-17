'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DeleteListingButton from "@/components/DeleteListingButton";
import { Plus, Eye, TrendingUp, BarChart3, Edit, MessageSquare, Calendar, MapPin, DollarSign } from 'lucide-react';

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

    // Calculate statistics
    const totalBookings = listings.reduce((sum, listing) => sum + listing.bookings.length, 0);
    const activeListings = listings.length;

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 text-lg">A carregar os seus espaços...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                        <p className="text-red-600 text-lg font-medium">Erro: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Meus Espaços
                        </h1>
                        <p className="text-gray-600">
                            Gerencie os seus espaços e acompanhe o desempenho
                        </p>
                    </div>
                    <Link
                        href="/create-listing"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <Plus className="h-5 w-5" />
                        Adicionar Novo Espaço
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total de Espaços</p>
                                <p className="text-3xl font-bold text-blue-600">{activeListings}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Eye className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>Ativos</span>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total de Reservas</p>
                                <p className="text-3xl font-bold text-purple-600">{totalBookings}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Todas as reservas</span>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 hover:border-pink-400 transition-all duration-300 hover:shadow-lg rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Média por Espaço</p>
                                <p className="text-3xl font-bold text-pink-600">
                                    {activeListings > 0 ? (totalBookings / activeListings).toFixed(1) : '0'}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-pink-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>Reservas por espaço</span>
                        </div>
                    </div>
                </div>

                {/* Listings Section */}
                {listings.length > 0 ? (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Seus Espaços</h2>
                        <div className="space-y-6">
                            {listings.map((listing, index) => (
                                <div
                                    key={listing.id}
                                    className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Listing Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex gap-6">
                                            <div className="w-40 h-28 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                                                {listing.imageUrl ? (
                                                    <Image
                                                        src={listing.imageUrl}
                                                        alt={listing.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        unoptimized
                                                        className="hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <MapPin className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                    Ativo
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h2>
                                                        <p className="text-sm text-gray-500">ID: {listing.id}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/edit-listing/${listing.id}`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                        <DeleteListingButton
                                                            listingId={listing.id}
                                                            onDeleteSuccess={handleDeleteSuccess}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span className="text-sm font-medium">{listing.bookings.length} reservas</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bookings Section */}
                                    <div className="p-6 bg-gray-50">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-blue-600" />
                                            Reservas Recebidas
                                        </h3>

                                        {listing.bookings.length === 0 ? (
                                            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-500">Nenhuma reserva para este espaço ainda.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {listing.bookings.map((booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                                                        {booking.clientName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900">{booking.clientName}</p>
                                                                        <p className="text-xs text-gray-500">Cliente</p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1 mb-3">
                                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                        <Calendar className="h-4 w-4" />
                                                                        <span>
                                                                            {new Date(booking.checkInDate).toLocaleDateString('pt-BR')} - {new Date(booking.checkOutDate).toLocaleDateString('pt-BR')}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                                    {booking.status}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Link
                                                            href={`/chat?bookingId=${booking.id}`}
                                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                            Ver Chat
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl">
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                <Plus className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum espaço ainda</h3>
                            <p className="text-gray-600 text-center mb-6 max-w-md">
                                Você ainda não criou nenhum espaço. Comece a ganhar listando o seu primeiro espaço agora!
                            </p>
                            <Link
                                href="/create-listing"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="h-5 w-5" />
                                Criar Primeiro Espaço
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}