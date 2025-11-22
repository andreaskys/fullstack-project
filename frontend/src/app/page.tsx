'use client';

import { ListingCard } from "../../types";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import {Calendar, Heart, Search, Shield, Sparkles} from "lucide-react";

export default function Home() {

    const [listings, setListings] = useState<ListingCard[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllListings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/listings');
            if (!res.ok) {
                throw new Error(`Erro ao buscar listings: ${res.statusText}`);
            }
            const data: ListingCard[] = await res.json();
            setListings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (searchQuery.trim() === '') {
            fetchAllListings();
            return;
        }

        try {
            const res = await fetch(`/api/listings/search?query=${searchQuery}`);
            if (!res.ok) {
                throw new Error(`Erro ao pesquisar listings: ${res.statusText}`);
            }
            const data: ListingCard[] = await res.json();
            setListings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllListings();
    }, []);


    return (
        <div className="min-h-screen">
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 md:py-32">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium mb-4">
                            <Sparkles className="h-4 w-4" />
                            Encontre o Seu Espaço Perfeito
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            Torne Cada Celebração Inesquecível
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Descubra e reserve espaços incríveis para casamentos, festas, eventos infantis e muito mais.
                            O seu espaço perfeito está a apenas um clique de distância.
                        </p>
                    </div>
                </div>
            </section>
            <section className="py-16 border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center space-y-3 p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Reserva Fácil</h3>
                            <p className="text-gray-600">
                                Reserve o seu espaço perfeito em minutos com nosso processo simplificado
                            </p>
                        </div>
                        <div className="text-center space-y-3 p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105" style={{ animationDelay: '100ms' }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Espaços Verificados</h3>
                            <p className="text-gray-600">
                                Todos os espaços são verificados e avaliados pela nossa comunidade
                            </p>
                        </div>
                        <div className="text-center space-y-3 p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105" style={{ animationDelay: '200ms' }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-600">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Melhor Preço Garantido</h3>
                            <p className="text-gray-600">
                                Preços competitivos e sem taxas ocultas para todas as reservas
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                        <div className="flex gap-2 bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Pesquise por 'piscina', 'São Paulo', etc..."
                                className="flex-grow px-6 py-4 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                            >
                                <Search className="h-5 w-5" />
                                Pesquisar
                            </button>
                        </div>
                    </form>
                </div>
            </section>
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Espaços Populares</h2>
                            <p className="text-gray-600">
                                Descubra os espaços mais amados para suas celebrações
                            </p>
                        </div>
                    </div>
                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                            <p className="text-gray-600 mt-4">A carregar...</p>
                        </div>
                    )}
                    {!isLoading && error && (
                        <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                            <p className="text-red-600 text-lg font-medium">Erro: {error}</p>
                        </div>
                    )}
                    {!isLoading && !error && listings && (
                        <>
                            {listings.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                    <p className="text-gray-600 text-lg">
                                        Nenhum espaço encontrado {searchQuery && `para a pesquisa: "${searchQuery}"`}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {listings.map((listing, index) => (
                                        <Link
                                            href={`/listings/${listing.id}`}
                                            key={listing.id}
                                            className="group"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                                                <div className="h-56 w-full relative bg-gradient-to-br from-gray-100 to-gray-200">
                                                    {listing.imageUrls && listing.imageUrls.length > 0 ? (
                                                        <Image
                                                            src={listing.imageUrls[0]}
                                                            alt={listing.title}
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                            unoptimized
                                                            className="group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            <Calendar className="h-12 w-12" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-5">
                                                    <h2 className="text-xl font-semibold mb-2 text-gray-900 truncate" title={listing.title}>
                                                        {listing.title}
                                                    </h2>
                                                    <p className="text-gray-600 mb-3 truncate" title={listing.location}>
                                                        {listing.location || "Localização não definida"}
                                                    </p>
                                                    <div className="flex items-baseline gap-1 mb-3">
                                                        <span className="text-2xl font-bold text-gray-900">
                                                            R$ {listing.price}
                                                        </span>
                                                        <span className="text-sm font-normal text-gray-500">/ noite</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                                                            {listing.hostName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                            {listing.hostName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
            <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Tem um Espaço para Partilhar?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Junte-se a milhares de anfitriões que ganham renda extra ao listar seus espaços
                        </p>
                        <button className="inline-flex items-center gap-2 text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <Sparkles className="h-5 w-5" />
                            Comece a Hospedar Hoje
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}