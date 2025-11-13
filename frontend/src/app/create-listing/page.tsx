'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {AmenityDTO, ListingCard} from "../../../types";

export default function CreateListingPage() {
    const { token, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState(0);
    const [maxGuests, setMaxGuests] = useState(1);

    const [allAmenities, setAllAmenities] = useState<AmenityDTO[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<Set<number>>(new Set());

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchAmenities = async () => {
            try {
                const res = await fetch('/api/amenities'); // Usa o proxy
                if (!res.ok) throw new Error('Falha ao buscar comodidades');
                const data: AmenityDTO[] = await res.json();
                setAllAmenities(data);
            } catch (err: any) {
                setError('Não foi possível carregar as comodidades. Tente novamente.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAmenities();
    }, [isAuthenticated, router]);

    const handleAmenityChange = (amenityId: number) => {
        setSelectedAmenities((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(amenityId)) {
                newSet.delete(amenityId);
            } else {
                newSet.add(amenityId);
            }
            return newSet;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    location,
                    price,
                    maxGuests,
                    amenityIds: Array.from(selectedAmenities)
                }),
            });

            if (!res.ok) {
                if (res.status === 403) {
                    logout();
                    return;
                }
                throw new Error('Falha ao criar o anúncio.');
            }

            const newListing: ListingCard = await res.json();

            router.push(`/listings/${newListing.id}`);

        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading) return <main className="p-8">A carregar...</main>;

    return (
        <main className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Criar Novo Espaço</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                        type="text" id="title" required
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        id="description" rows={4}
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Localização</label>
                    <input
                        type="text" id="location" required
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (por noite)</label>
                        <input
                            type="number" id="price" required min="0"
                            value={price} onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700">Máx. Hóspedes</label>
                        <input
                            type="number" id="maxGuests" required min="1"
                            value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Comodidades</label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {allAmenities.map((amenity) => (
                            <label key={amenity.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedAmenities.has(amenity.id)}
                                    onChange={() => handleAmenityChange(amenity.id)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm"
                                />
                                <span className="text-gray-700">{amenity.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Criar Espaço
                </button>
            </form>
        </main>
    );
}