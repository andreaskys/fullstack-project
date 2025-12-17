'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { AmenityDTO, ListingCard } from "../../../../types";
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import Image from 'next/image';
import { Edit, Loader2 } from 'lucide-react';

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
                if (!amenitiesRes.ok) {
                    setError('Falha ao buscar comodidades');
                    return;
                }
                const amenitiesData: AmenityDTO[] = await amenitiesRes.json();
                setAllAmenities(amenitiesData);

                const listingRes = await fetch(`/api/listings/${listingId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!listingRes.ok) {
                    setError('Falha ao buscar dados do espaço');
                    return;
                }

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

        void fetchListingData();
    }, [isAuthenticated, router, listingId, token]);

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

    const handleImageUploadSuccess = (url: string) => setImageUrls(prev => [...prev, url]);
    const handleVideoUploadSuccess = (url: string) => setVideoUrls(prev => [...prev, url]);
    const removeImage = (urlToRemove: string) => setImageUrls(prev => prev.filter(url => url !== urlToRemove));
    const removeVideo = (urlToRemove: string) => setVideoUrls(prev => prev.filter(url => url !== urlToRemove));

    const handleSubmit = async (e: FormEvent) => {
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
                    title, description, location, price, maxGuests,
                    amenityIds: Array.from(selectedAmenities),
                    imageUrls, videoUrls,
                }),
            });

            if (!res.ok) {
                if (res.status === 403) { logout(); return; }
                setError('Falha ao atualizar o anúncio.');
                return;
            }

            alert("Espaço atualizado com sucesso!");
            router.push(`/listings/${listingId}`);

        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">A carregar dados do espaço...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-blue-50/30 py-12">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header do Novo Design */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                            <Edit className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Editar Espaço
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Atualize as informações e definições do seu local
                    </p>
                </div>

                {/* Container do Formulário (Card Branco) */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Informações Básicas */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Informações Básicas</h2>

                            <div className="grid gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Título do Anúncio</label>
                                    <input
                                        type="text" id="title" required
                                        value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900"
                                        placeholder="Ex: Casa de Praia Espetacular"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                    <textarea
                                        id="description" rows={4}
                                        value={description} onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900"
                                        placeholder="Descreva o seu espaço..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                                    <input
                                        type="text" id="location" required
                                        value={location} onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900"
                                        placeholder="Ex: Lisboa, Portugal"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Preço (por noite)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-500">R$</span>
                                            <input
                                                type="number" id="price" required min="0"
                                                value={price} onChange={(e) => setPrice(Number(e.target.value))}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-2">Máx. Hóspedes</label>
                                        <input
                                            type="number" id="maxGuests" required min="1"
                                            value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Secção de Mídia */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Mídia do Espaço</h2>

                            {/* Previews das Imagens */}
                            {imageUrls.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Imagens Carregadas</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {imageUrls.map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group shadow-sm">
                                                <Image src={url} alt={`Preview ${index}`} fill style={{ objectFit: 'cover' }} unoptimized />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(url)}
                                                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <ImageUpload onUploadSuccess={handleImageUploadSuccess} />

                            {/* Vídeos */}
                            {videoUrls.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Vídeo Carregado</label>
                                    <div className="mt-2">
                                        {videoUrls.map((url, index) => (
                                            <div key={index} className="relative">
                                                <video src={url} controls className="w-full rounded-lg shadow-sm" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVideo(url)}
                                                    className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    Remover Vídeo
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {videoUrls.length === 0 && (
                                <VideoUpload onUploadSuccess={handleVideoUploadSuccess} />
                            )}
                        </div>

                        {/* Comodidades */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Comodidades</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {allAmenities.map((amenity) => (
                                    <label
                                        key={amenity.id}
                                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer
                                            ${selectedAmenities.has(amenity.id)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.has(amenity.id)}
                                            onChange={() => handleAmenityChange(amenity.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium">{amenity.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}