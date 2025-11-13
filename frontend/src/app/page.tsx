'use client';

import { ListingCard } from "../../types";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

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
        <main className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Encontre o seu Espaço</h1>

            <form onSubmit={handleSearch} className="mb-8 flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquise por 'piscina', 'São Paulo', etc..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Pesquisar
                </button>
            </form>

            {isLoading && (
                <p className="text-gray-600">A carregar...</p>
            )}

            {!isLoading && error && (
                <p className="text-red-600">Erro: {error}</p>
            )}

            {!isLoading && !error && listings && (
                <>
                    {listings.length === 0 ? (
                        <p className="text-gray-600">
                            Nenhum espaço encontrado {searchQuery && `para a pesquisa: "${searchQuery}"`}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {listings.map((listing) => (
                                <Link
                                    href={`/listings/${listing.id}`}
                                    key={listing.id}
                                    className="group"
                                >
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">

                                        <div className="h-48 w-full relative bg-gray-200">
                                            {listing.imageUrls && listing.imageUrls.length > 0 ? (
                                                <Image
                                                src={listing.imageUrls[0]}
                                                alt={listing.title}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                unoptimized
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500">Sem Imagem</div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate" title={listing.title}>
                                                {listing.title}
                                            </h2>
                                            <p className="text-gray-600 mb-2 truncate" title={listing.location}>
                                                {listing.location || "Localização não definida"}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900">
                                                R$ {listing.price}
                                                <span className="text-sm font-normal text-gray-500"> / noite</span>
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Anfitrião: {listing.hostName}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </main>
    );
}