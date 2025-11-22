'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatBox from '@/components/ChatBox';
import { MessageSquare, Calendar, MapPin, User, Search, ChevronLeft } from 'lucide-react';

type BookingConversation = {
    bookingId: number;
    listingTitle: string;
    listingLocation?: string;
    checkInDate: string;
    checkOutDate: string;
    otherUserName: string;
    lastMessageTime?: string;
    unreadCount?: number;
    status: string;
};

export default function UnifiedChatPage() {
    const { token, isAuthenticated } = useAuth();
    const router = useRouter();

    const [conversations, setConversations] = useState<BookingConversation[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchConversations();
    }, [isAuthenticated, token]);

    const fetchConversations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Busca todas as reservas do usuário (tanto como cliente quanto como host)
            const res = await fetch('/api/bookings/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Não foi possível carregar as conversas');
            }

            const data: BookingConversation[] = await res.json();
            setConversations(data);

            // Seleciona a primeira conversa automaticamente
            if (data.length > 0 && !selectedBookingId) {
                setSelectedBookingId(data[0].bookingId);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.listingLocation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedConversation = conversations.find(c => c.bookingId === selectedBookingId);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                    <p className="text-gray-600">A carregar...</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                    <p className="text-gray-600">A carregar conversas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/20">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Voltar
                        </button>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Mensagens
                    </h1>
                    <p className="text-gray-600 mt-1">Gerencie suas conversas sobre reservas</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                    {/* Sidebar - Lista de Conversas */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden flex flex-col">
                        {/* Search Bar */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar conversas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {error && (
                                <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            {filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {searchQuery
                                            ? 'Tente buscar por outro termo'
                                            : 'Suas conversas sobre reservas aparecerão aqui'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredConversations.map((conversation) => (
                                        <button
                                            key={conversation.bookingId}
                                            onClick={() => setSelectedBookingId(conversation.bookingId)}
                                            className={`w-full p-4 text-left transition-all hover:bg-gray-50 ${
                                                selectedBookingId === conversation.bookingId
                                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {conversation.otherUserName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {conversation.otherUserName}
                                                        </h3>
                                                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                                                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                                {conversation.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700 truncate mb-1">
                                                        {conversation.listingTitle}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {new Date(conversation.checkInDate).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                    {conversation.lastMessageTime && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(conversation.lastMessageTime).toLocaleString('pt-BR')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                            {selectedConversation.otherUserName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                {selectedConversation.otherUserName}
                                            </h2>
                                            <p className="font-medium text-gray-700 mb-2">
                                                {selectedConversation.listingTitle}
                                            </p>
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {selectedConversation.listingLocation && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{selectedConversation.listingLocation}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {new Date(selectedConversation.checkInDate).toLocaleDateString('pt-BR')} - {new Date(selectedConversation.checkOutDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    selectedConversation.status === 'CONFIRMED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : selectedConversation.status === 'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {selectedConversation.status === 'CONFIRMED' ? 'Confirmada' :
                                                        selectedConversation.status === 'PENDING' ? 'Pendente' :
                                                            selectedConversation.status === 'CANCELLED' ? 'Cancelada' :
                                                                selectedConversation.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-hidden">
                                    <ChatBox roomId={selectedConversation.bookingId.toString()} />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <MessageSquare className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Selecione uma conversa
                                </h3>
                                <p className="text-gray-500">
                                    Escolha uma conversa da lista para começar a enviar mensagens
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}