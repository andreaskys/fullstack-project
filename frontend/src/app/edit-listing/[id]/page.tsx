'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { AmenityDTO, ListingCard } from "../../../../types";
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import Image from 'next/image';

export default function EditListingPage() {
    const { token, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const params = useParams();
    const listingId = params.id as string;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState(0);
    const [maxGuests, setMaxGuests] = useState(1);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [allAmenities, setAllAmenities] = useState<AmenityDTO[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<Set<number>>(new Set());

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchListingData = async () => {
            if (!listingId) return;

            setIsLoading(true);
            try {
                const amenitiesRes = await fetch('/api/amenities');
                if (!amenitiesRes.ok) throw new Error('Falha ao buscar comodidades');
                const amenitiesData: AmenityDTO[] = await amenitiesRes.json();
                setAllAmenities(amenitiesData);
                const listingRes = await fetch(`/api/listings/${listingId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!listingRes.ok) throw new Error('Falha ao buscar dados do espaço');

                const listingData: ListingCard = await listingRes.json();

                setTitle(listingData.title);
                setDescription(listingData.description);
                setLocation(listingData.location);
                setPrice(listingData.price);
                setMaxGuests(listingData.maxGuests);
                setImageUrls(listingData.imageUrls || []);
                setVideoUrls(listingData.videoUrls || []);

                const amenityNameIdMap = new Map(amenitiesData.map(a => [a.name, a.id]));
                const selectedIds = (listingData.amenities || []).map(name => amenityNameIdMap.get(name))
                    .filter((id): id is number => id !== undefined);
                setSelectedAmenities(new Set(selectedIds));

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListingData();
    }, [isAuthenticated, router, listingId, token]); // Removido 'logout' das dependências

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

    const handleImageUploadSuccess = (url: string) => {
        setImageUrls(prevUrls => [...prevUrls, url]);
    };

    const handleVideoUploadSuccess = (url: string) => {
        setVideoUrls(prevUrls => [...prevUrls, url]);
    };

    const removeImage = (urlToRemove: string) => {
        setImageUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
    };
    const removeVideo = (urlToRemove: string) => {
        setVideoUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (imageUrls.length === 0) {
            setError("O espaço deve ter pelo menos uma imagem.");
            return;
        }
        try {
            const res = await fetch(`/api/listings/${listingId}`, {
                method: 'PUT',
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
                    amenityIds: Array.from(selectedAmenities),
                    imageUrls: imageUrls,
                    videoUrls: videoUrls,
                }),
            });
            if (!res.ok) {
                if (res.status === 403) {
                    logout();
                    return;
                }
                throw new Error('Falha ao atualizar o anúncio.');
            }

            alert("Espaço atualizado com sucesso!");
            router.push(`/listings/${listingId}`);

        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading) return <main className="p-8 text-gray-900">A carregar dados do espaço...</main>;

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Editar Espaço</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                            type="text" id="title" required
                            value={title} onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            id="description" rows={4}
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Localização</label>
                        <input
                            type="text" id="location" required
                            value={location} onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm text-gray-900"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (por noite)</label>
                            <input
                                type="number" id="price" required min="0"
                                value={price} onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm text-gray-900"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700">Máx. Hóspedes</label>
                            <input
                                type="number" id="maxGuests" required min="1"
                                value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Mídia do Espaço</h2>
                        {imageUrls.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Imagens Carregadas</label>
                                <div className="mt-2 grid grid-cols-5 gap-2">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="relative h-20 w-full rounded-md overflow-hidden">
                                            <Image src={url} alt={`Preview ${index}`} fill style={{ objectFit: 'cover' }} unoptimized />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(url)}
                                                className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full text-xs"
                                            >X</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <ImageUpload onUploadSuccess={handleImageUploadSuccess} />
                        {videoUrls.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vídeo Carregado</label>
                                <div className="mt-2">
                                    {videoUrls.map((url, index) => (
                                        <video key={index} src={url} controls className="w-full rounded-md" />
                                    ))}
                                </div>
                            </div>
                        )}
                        {videoUrls.length === 0 && (
                            <VideoUpload onUploadSuccess={handleVideoUploadSuccess} />
                        )}
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
                        Salvar Alterações
                    </button>
                </form>
            </div>
        </main>
    );
}